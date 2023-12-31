package dtos

import (
	"time"
)

type Bulk struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	Filename  string    `json:"filename"`
	Initiated int64     `json:"initiated"`
	Processed int64     `json:"processed"`
	Errors    int64     `json:"errors"`
}

type Bulks struct {
	Count      int64  `json:"count"`
	CsvEntries []Bulk `json:"csv_entries"`
	Page       int64  `json:"page"`
	PerPage    int64  `json:"perPage"`
}

type BulkError struct {
	Id            int64                  `json:"id"`
	UpdatedAt     time.Time              `json:"updated_at"`
	CsvEntryId    int64                  `json:"csv_entry_id"`
	Configuration map[string]interface{} `json:"configuration,omitempty"`
	Error         string                 `json:"error"`
}

type BulkErrors struct {
	Count     int64       `json:"count"`
	CsvErrors []BulkError `json:"csv_errors"`
	Page      int64       `json:"page"`
	PerPage   int64       `json:"perPage"`
}

type SearchBulkMsg struct {
	Query   string `json:"query"`
	Page    int64  `json:"page"`
	PerPage int64  `json:"perPage"`
	// swagger:ignore
	Result Bulks `json:"result"`
}

type GetBulkByIdMsg struct {
	Id int64 `json:"id"`
	// swagger:ignore
	Result Bulk `json:"result"`
}

type GetBulkErrorsByBulkIdMsg struct {
	Id      int64 `json:"id"`
	Page    int64 `json:"page"`
	PerPage int64 `json:"perPage"`
	// swagger:ignore
	Result BulkErrors `json:"result"`
}
