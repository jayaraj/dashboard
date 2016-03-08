package plugins

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/setting"
)

type PluginLoader interface {
	Load(decoder *json.Decoder, pluginDir string) error
}

type PluginBase struct {
	Type          string             `json:"type"`
	Name          string             `json:"name"`
	Id            string             `json:"id"`
	Info          PluginInfo         `json:"info"`
	Dependencies  PluginDependencies `json:"dependencies"`
	Includes      []*PluginInclude   `json:"includes"`
	Module        string             `json:"module"`
	BaseUrl       string             `json:"baseUrl"`
	StaticRoot    string             `json:"staticRoot"`
	StaticRootAbs string             `json:"-"`

	IncludedInAppId string `json:"-"`
	PluginDir       string `json:"-"`
}

func (pb *PluginBase) registerPlugin(pluginDir string) error {
	if _, exists := Plugins[pb.Id]; exists {
		return errors.New("Plugin with same id already exists")
	}

	if !strings.HasPrefix(pluginDir, setting.StaticRootPath) {
		log.Info("Plugins: Registering plugin %v", pb.Name)
	}

	if len(pb.Dependencies.Plugins) == 0 {
		pb.Dependencies.Plugins = []PluginDependencyItem{}
	}

	if pb.Dependencies.GrafanaVersion == "" {
		pb.Dependencies.GrafanaVersion = "*"
	}

	pb.PluginDir = pluginDir
	Plugins[pb.Id] = pb
	return nil
}

type PluginDependencies struct {
	GrafanaVersion string                 `json:"grafanaVersion"`
	Plugins        []PluginDependencyItem `json:"plugins"`
}

type PluginInclude struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Type string `json:"type"`
	Id   string `json:"id"`
}

type PluginDependencyItem struct {
	Type    string `json:"type"`
	Id      string `json:"id"`
	Name    string `json:"name"`
	Version string `json:"version"`
}

type PluginInfo struct {
	Author      PluginInfoLink      `json:"author"`
	Description string              `json:"description"`
	Links       []PluginInfoLink    `json:"links"`
	Logos       PluginLogos         `json:"logos"`
	Screenshots []PluginScreenshots `json:"screenshots"`
	Version     string              `json:"version"`
	Updated     string              `json:"updated"`
}

type PluginInfoLink struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}

type PluginLogos struct {
	Small string `json:"small"`
	Large string `json:"large"`
}

type PluginScreenshots struct {
	Path string `json:"path"`
	Name string `json:"name"`
}

type PluginStaticRoute struct {
	Directory string
	PluginId  string
}

type EnabledPlugins struct {
	Panels      []*PanelPlugin
	DataSources map[string]*DataSourcePlugin
	Apps        []*AppPlugin
}

func NewEnabledPlugins() EnabledPlugins {
	return EnabledPlugins{
		Panels:      make([]*PanelPlugin, 0),
		DataSources: make(map[string]*DataSourcePlugin),
		Apps:        make([]*AppPlugin, 0),
	}
}
