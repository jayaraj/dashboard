package dtos

import (
	"time"
)

type ErrorResponse struct {
	Message string `json:"message"`
}

type ConfigurationType struct {
	Id             int64                  `json:"id"`
	UpdatedAt      time.Time              `json:"updated_at"`
	Type           string                 `json:"type"`
	AssociatedWith string                 `json:"associated_with"`
	Measurement    bool                   `json:"measurement"`
	Role           string                 `json:"role"`
	Configuration  map[string]interface{} `json:"configuration"`
}

type ConfigurationTypes struct {
	Count              int64               `json:"count"`
	ConfigurationTypes []ConfigurationType `json:"configuration_types"`
	Page               int64               `json:"page"`
	PerPage            int64               `json:"perpage"`
}

type IsConfigurationAccessibleMsg struct {
	AssociatedWith string `json:"associated_with" binding:"required"`
	Type           string `json:"type" binding:"required"`
	User           User   `json:"user" binding:"required"`
	// swagger:ignore
	Result bool `json:"result"`
}

type SearchConfigurationTypeMsg struct {
	User        User   `json:"user" binding:"required"`
	Query       string `json:"query"`
	Measurement bool   `json:"measurement"`
	Page        int64  `json:"page" binding:"required"`
	PerPage     int64  `json:"perPage" binding:"required"`
	// swagger:ignore
	Result ConfigurationTypes `json:"result"`
}

type GetConfigurationTypesWithAssociationMsg struct {
	Measurement bool   `json:"measurement"`
	Query       string `json:"query"`
	User        User   `json:"user" binding:"required"`
	// swagger:ignore
	AssociatedWith string `json:"associated_with" binding:"required"`
	Page           int64  `json:"page" binding:"required"`
	PerPage        int64  `json:"perPage" binding:"required"`
	// swagger:ignore
	Result ConfigurationTypes `json:"result"`
}

type GetConfigurationTypeByIdMsg struct {
	// swagger:ignore
	Id int64 `json:"-"`
	// swagger:ignore
	Result ConfigurationType `json:"result"`
}

type GetConfigurationTypeByTypeMsg struct {
	// swagger:ignore
	Type string `json:"type" binding:"required"`
	// swagger:ignore
	AssociatedWith string `json:"associated_with" binding:"required"`
	// swagger:ignore
	Result ConfigurationType `json:"result"`
}

type UpdateConfigurationTypeMsg struct {
	// swagger:ignore
	Id             int64                  `json:"-"`
	Type           string                 `json:"type" binding:"required"`
	AssociatedWith string                 `json:"associated_with" binding:"required"`
	Measurement    bool                   `json:"measurement"`
	Role           string                 `json:"role" binding:"required"`
	Configuration  map[string]interface{} `json:"configuration" binding:"required"`
	// swagger:ignore
	Result ConfigurationType `json:"result"`
}

type DeleteConfigurationTypeMsg struct {
	// swagger:ignore
	Id int64 `json:"-"`
	// swagger:ignore
	Result ConfigurationType `json:"result"`
}

type CreateConfigurationTypeMsg struct {
	Type           string                 `json:"type" binding:"required"`
	AssociatedWith string                 `json:"associated_with" binding:"required"`
	Measurement    bool                   `json:"measurement"`
	Role           string                 `json:"role" binding:"required"`
	Configuration  map[string]interface{} `json:"configuration" binding:"required"`
	// swagger:ignore
	Result ConfigurationType `json:"result"`
}
