package fileloader

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCsvCreate  = "fileloaders.csv:create"
	ActionCsvDelete  = "fileloaders.csv:delete"
	ActionCsvRead    = "fileloaders.csv:read"
	ActionFileRead   = "fileloaders.file:read"
	ActionFileCreate = "fileloaders.file:create"
	ScopeRoot        = "fileloaders"
)

var (
	ScopeAll      = accesscontrol.GetResourceAllScope(ScopeRoot)
	ScopeProvider = accesscontrol.NewScopeProvider(ScopeRoot)

	ReadPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalAny(
			accesscontrol.EvalPermission(ActionCsvRead),
			accesscontrol.EvalPermission(ActionCsvCreate),
			accesscontrol.EvalPermission(ActionCsvDelete),
		),
	)
)

func (service *Service) declareFixedRoles(ac accesscontrol.Service) error {

	csvFileloaderCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fileloaders.csv:creator",
			DisplayName: "FileLoader csv creator",
			Description: "Upload or delete csv files",
			Group:       "Fileloaders",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionCsvCreate},
				{Action: ActionCsvDelete, Scope: ScopeAll},
				{Action: ActionCsvRead, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	csvFileloaderReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fileloaders.csv:reader",
			DisplayName: "FileLoader csv reader",
			Description: "Read csv files",
			Group:       "FileLoaders",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionCsvRead},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	fileFileloaderCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fileloaders.file:creator",
			DisplayName: "FileLoader file creator",
			Description: "Upload or delete files",
			Group:       "Fileloaders",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionFileCreate},
				{Action: ActionFileRead, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	fileFileloaderReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fileloaders.file:reader",
			DisplayName: "FileLoader file reader",
			Description: "Read files",
			Group:       "FileLoaders",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionFileRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(csvFileloaderCreatorRole, csvFileloaderReaderRole, fileFileloaderCreatorRole, fileFileloaderReaderRole)
}
