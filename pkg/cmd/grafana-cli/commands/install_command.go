package commands

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/fatih/color"
	"github.com/grafana/grafana/pkg/cmd/grafana-cli/log"
	m "github.com/grafana/grafana/pkg/cmd/grafana-cli/models"
	s "github.com/grafana/grafana/pkg/cmd/grafana-cli/services"
)

func validateInput(c CommandLine, pluginFolder string) error {
	arg := c.Args().First()
	if arg == "" {
		return errors.New("please specify plugin to install")
	}

	pluginsDir := c.GlobalString("pluginsDir")
	if pluginsDir == "" {
		return errors.New("missing pluginsDir flag")
	}

	fileInfo, err := os.Stat(pluginsDir)
	if err != nil {
		if err = os.MkdirAll(pluginsDir, os.ModePerm); err != nil {
			return errors.New(fmt.Sprintf("pluginsDir (%s) is not a directory", pluginsDir))
		}
		return nil
	}

	if !fileInfo.IsDir() {
		return errors.New("path is not a directory")
	}

	return nil
}

func installCommand(c CommandLine) error {
	pluginFolder := c.GlobalString("pluginsDir")
	if err := validateInput(c, pluginFolder); err != nil {
		return err
	}

	pluginToInstall := c.Args().First()
	version := c.Args().Get(1)

	return InstallPlugin(pluginToInstall, version, c)
}

func InstallPlugin(pluginName, version string, c CommandLine) error {
	plugin, err := s.GetPlugin(pluginName, c.GlobalString("repo"))
	pluginFolder := c.GlobalString("pluginsDir")
	if err != nil {
		return err
	}

	v, err := SelectVersion(plugin, version)
	if err != nil {
		return err
	}

	if version == "" {
		version = v.Version
	}

	downloadURL := fmt.Sprintf("%s/%s/versions/%s/download",
		c.GlobalString("repo"),
		pluginName,
		version)

	log.Infof("installing %v @ %v\n", plugin.Id, version)
	log.Infof("from url: %v\n", downloadURL)
	log.Infof("into: %v\n", pluginFolder)
	log.Info("\n")

	err = downloadFile(plugin.Id, pluginFolder, downloadURL)
	if err != nil {
		return err
	}

	log.Infof("%s Installed %s successfully \n", color.GreenString("✔"), plugin.Id)

	/* Enable once we need support for downloading depedencies
	res, _ := s.ReadPlugin(pluginFolder, pluginName)
	for _, v := range res.Dependency.Plugins {
		InstallPlugin(v.Id, version, c)
		log.Infof("Installed dependency: %v ✔\n", v.Id)
	}
	*/
	return err
}

func SelectVersion(plugin m.Plugin, version string) (m.Version, error) {
	if version == "" {
		return plugin.Versions[0], nil
	}

	for _, v := range plugin.Versions {
		if v.Version == version {
			return v, nil
		}
	}

	return m.Version{}, errors.New("Could not find the version your looking for")
}

func RemoveGitBuildFromName(pluginName, filename string) string {
	r := regexp.MustCompile("^[a-zA-Z0-9_.-]*/")
	return r.ReplaceAllString(filename, pluginName+"/")
}

var retryCount = 0
var permissionsDeniedMessage = "Could not create %s. Permission denied. Make sure you have write access to plugindir"

func downloadFile(pluginName, filePath, url string) (err error) {
	defer func() {
		if r := recover(); r != nil {
			retryCount++
			if retryCount == 1 {
				log.Debug("\nFailed downloading. Will retry once.\n")
				downloadFile(pluginName, filePath, url)
			} else {
				panic(r)
			}
		}
	}()

	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	r, err := zip.NewReader(bytes.NewReader(body), resp.ContentLength)
	if err != nil {
		return err
	}
	for _, zf := range r.File {
		newFile := path.Join(filePath, RemoveGitBuildFromName(pluginName, zf.Name))

		if zf.FileInfo().IsDir() {
			err := os.Mkdir(newFile, 0777)
			if PermissionsError(err) {
				return fmt.Errorf(permissionsDeniedMessage, newFile)
			}
		} else {
			dst, err := os.Create(newFile)
			if PermissionsError(err) {
				return fmt.Errorf(permissionsDeniedMessage, newFile)
			}

			defer dst.Close()
			src, err := zf.Open()
			if err != nil {
				log.Errorf("%v", err)
			}
			defer src.Close()

			io.Copy(dst, src)
		}
	}

	return nil
}

func PermissionsError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "permission denied")
}
