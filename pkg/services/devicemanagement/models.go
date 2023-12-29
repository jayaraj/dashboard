package devicemanagement

import (
	"io"
	"time"
)

type OrgUser struct {
	OrgId      int64     `json:"org_id" xorm:"org_id"`
	UserId     int64     `json:"user_id" xorm:"user_id"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	Name       string    `json:"name"`
	AvatarURL  string    `json:"avatar_url" xorm:"avatar_url"`
	Login      string    `json:"login"`
	Role       string    `json:"role"`
	LastSeenAt time.Time `json:"last_seen_at"`
	Updated    time.Time `json:"updated"`
	Created    time.Time `json:"create"`
}

type RestRequest struct {
	Url        string
	Request    []byte
	HttpMethod string
	Response   []byte
	StatusCode int
}

type FileRequest struct {
	Url        string
	Filename   string
	FormData   map[string]string
	Content    io.Reader
	Response   []byte
	StatusCode int
}

type UpdateUserEvent struct {
	UserId int64
}

type UpdateOrgUserEvent struct {
	OrgId  int64
	UserId int64
}

type DeleteUserEvent struct {
	UserId int64
}

type DeleteOrgEvent struct {
	OrgId int64
}

type DeleteOrgUserEvent struct {
	UserId int64
	OrgId  int64
}
