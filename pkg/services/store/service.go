package store

import (
	"context"
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana/pkg/infra/filestorage"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/grafana/grafana/pkg/setting"
)

var grafanaStorageLogger = log.New("grafanaStorageLogger")

const RootPublicStatic = "public-static"
const MAX_UPLOAD_SIZE = 1024 * 1024 // 1MB
type StorageService interface {
	registry.BackgroundService

	// List folder contents
	List(ctx context.Context, user *models.SignedInUser, path string) (*data.Frame, error)

	// Read raw file contents out of the store
	Read(ctx context.Context, user *models.SignedInUser, path string) (*filestorage.File, error)

	Upload(ctx context.Context, user *models.SignedInUser, form *multipart.Form) (*Response, error)

	Delete(ctx context.Context, user *models.SignedInUser, path string) error
}

type standardStorageService struct {
	sql  *sqlstore.SQLStore
	tree *nestedTree
}

type Response struct {
	path       string
	statusCode int
	message    string
	fileName   string
	err        bool
}

func ProvideService(sql *sqlstore.SQLStore, features featuremgmt.FeatureToggles, cfg *setting.Cfg) StorageService {
	roots := []storageRuntime{
		newDiskStorage(RootPublicStatic, "Public static files", &StorageLocalDiskConfig{
			Path: cfg.StaticRootPath,
			Roots: []string{
				"/testdata/",
				// "/img/icons/",
				// "/img/bg/",
				"/img/",
				"/gazetteer/",
				"/maps/",
			},
		}).setReadOnly(true).setBuiltin(true),
	}

	storage := filepath.Join(cfg.DataPath, "storage")
	_ = os.MkdirAll(storage, 0700)

	if features.IsEnabled(featuremgmt.FlagStorageLocalUpload) {
		upload := filepath.Join(storage, "upload")
		_ = os.MkdirAll(upload, 0700)
		roots = append(roots, newDiskStorage("upload", "Local file upload", &StorageLocalDiskConfig{
			Path: upload,
			Roots: []string{
				"/",
			},
		}).setBuiltin(true))
	}
	s := newStandardStorageService(roots)
	s.sql = sql
	return s
}

func newStandardStorageService(roots []storageRuntime) *standardStorageService {
	res := &nestedTree{
		roots: roots,
	}
	res.init()
	return &standardStorageService{
		tree: res,
	}
}

func (s *standardStorageService) Run(ctx context.Context) error {
	grafanaStorageLogger.Info("storage starting")
	return nil
}

func (s *standardStorageService) List(ctx context.Context, user *models.SignedInUser, path string) (*data.Frame, error) {
	// apply access control here
	return s.tree.ListFolder(ctx, path)
}

func (s *standardStorageService) Read(ctx context.Context, user *models.SignedInUser, path string) (*filestorage.File, error) {
	// TODO: permission check!
	return s.tree.GetFile(ctx, path)
}

func isFileTypeValid(filetype string) bool {
	if (filetype == "image/jpeg") || (filetype == "image/jpg") || (filetype == "image/gif") || (filetype == "image/png") || (filetype == "image/webp") {
		return true
	}
	return false
}

func (s *standardStorageService) Upload(ctx context.Context, user *models.SignedInUser, form *multipart.Form) (*Response, error) {
	response := Response{
		path: "upload",
	}
	upload, _ := s.tree.getRoot("upload")
	if upload == nil {
		response.statusCode = 404
		response.message = "upload feature is not enabled"
		response.err = true
		return &response, fmt.Errorf("upload feature is not enabled")
	}

	files := form.File["file"]
	for _, fileHeader := range files {
		// Restrict the size of each uploaded file to 1MB based on the header
		if fileHeader.Size > MAX_UPLOAD_SIZE {
			response.statusCode = 400
			response.message = "The uploaded image is too big"
			response.err = true
			return &response, nil
		}
		// restrict file size based on file size
		// open each file to copy contents
		file, err := fileHeader.Open()
		if err != nil {
			return nil, err
		}
		err = file.Close()
		if err != nil {
			return nil, err
		}
		data, err := ioutil.ReadAll(file)
		if err != nil {
			return nil, err
		}

		filetype := http.DetectContentType(data)
		path := "/" + fileHeader.Filename

		grafanaStorageLogger.Info("uploading a file", "filetype", filetype, "path", path)
		// only allow images to be uploaded
		if !isFileTypeValid(filetype) {
			return &Response{
				statusCode: 400,
				message:    "unsupported file type uploaded",
				err:        true,
			}, nil
		}
		err = upload.Upsert(ctx, &filestorage.UpsertFileCommand{
			Path:     path,
			Contents: data,
		})
		if err != nil {
			return nil, err
		}
		response.message = "Uploaded successfully"
		response.statusCode = 200
		response.fileName = fileHeader.Filename
		response.path = "upload/" + fileHeader.Filename
	}
	return &response, nil
}

func (s *standardStorageService) Delete(ctx context.Context, user *models.SignedInUser, path string) error {
	upload, _ := s.tree.getRoot("upload")
	if upload == nil {
		return fmt.Errorf("upload feature is not enabled")
	}
	err := upload.Delete(ctx, path)
	if err != nil {
		return err
	}
	return nil
}
