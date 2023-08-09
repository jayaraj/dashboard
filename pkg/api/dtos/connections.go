package dtos

import (
	"time"
)

type Connection struct {
	Id            int64     `json:"id"`
	UpdatedAt     time.Time `json:"updated_at"`
	OrgId         int64     `json:"org_id"`
	GroupId       int64     `json:"group_id"`
	GroupPathId   string    `json:"group_path_id"`
	GroupPathName string    `json:"group_path_name"`
	Profile       string    `json:"profile"`
	Status        string    `json:"status"`
	Name          string    `json:"name"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	Address1      string    `json:"address1"`
	Address2      string    `json:"address2"`
	City          string    `json:"city"`
	State         string    `json:"state"`
	Country       string    `json:"country"`
	Pincode       string    `json:"pincode"`
	ConnectionExt int64     `json:"connection_ext"`
}

type Connections struct {
	Count       int64        `json:"count"`
	Connections []Connection `json:"connections"`
	Page        int64        `json:"page"`
	PerPage     int64        `json:"perPage"`
}

type ConnectionUsers struct {
	Count   int64            `json:"count"`
	Users   []ConnectionUser `json:"users"`
	Page    int64            `json:"page"`
	PerPage int64            `json:"perPage"`
}

type ConnectionUser struct {
	UserId int64  `json:"user_id"`
	Login  string `json:"login"`
	Email  string `json:"email"`
	Phone  string `json:"phone"`
	Name   string `json:"name"`
	Role   string `json:"role"`
}

type ConnectionLog struct {
	Id            int64     `json:"id"`
	UpdatedAt     time.Time `json:"updated_at"`
	ConnectionExt int64     `json:"connection_ext"`
	ConnectionId  int64     `json:"connection_id"`
	Status        string    `json:"status"`
	Comments      string    `json:"comments"`
	Login         string    `json:"login"`
}

type ConnectionLogs struct {
	Count   int64           `json:"count"`
	Logs    []ConnectionLog `json:"logs"`
	Page    int64           `json:"page"`
	PerPage int64           `json:"perPage"`
}

type CreateConnectionMsg struct {
	OrgId         int64      `json:"org_id"`
	GroupParentId int64      `json:"group_parent_id" binding:"required"`
	Profile       string     `json:"profile" binding:"required"`
	Status        string     `json:"status" binding:"required"`
	Name          string     `json:"name" binding:"required"`
	Phone         string     `json:"phone" binding:"required"`
	Email         string     `json:"email" binding:"required"`
	Address1      string     `json:"address1" binding:"required"`
	Address2      string     `json:"address2"`
	City          string     `json:"city" binding:"required"`
	State         string     `json:"state" binding:"required"`
	Country       string     `json:"country" binding:"required"`
	Pincode       string     `json:"pincode" binding:"required"`
	Login         string     `json:"login"`
	Result        Connection `json:"result"`
}

type UpdateConnectionMsg struct {
	Id       int64  `json:"-"`
	Profile  string `json:"profile" binding:"required"`
	Status   string `json:"status" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Address1 string `json:"address1" binding:"required"`
	Address2 string `json:"address2"`
	City     string `json:"city" binding:"required"`
	State    string `json:"state" binding:"required"`
	Country  string `json:"country" binding:"required"`
	Pincode  string `json:"pincode" binding:"required"`
	Login    string `json:"login"`
}

type GetConnectionByIdMsg struct {
	Id     int64      `json:"id"`
	Result Connection `json:"result"`
}

type SearchConnectionsMsg struct {
	User    User        `json:"user"`
	Query   string      `json:"query"`
	Page    int64       `json:"page" binding:"required"`
	PerPage int64       `json:"perPage" binding:"required"`
	Result  Connections `json:"result"`
}

type GetConnectionLogsMsg struct {
	ConnectionId int64          `json:"-"`
	Page         int64          `json:"page"`
	PerPage      int64          `json:"perPage"`
	Result       ConnectionLogs `json:"result"`
}

type GetConnectionByExtMsg struct {
	ConnectionExt int64      `json:"-"`
	Result        Connection `json:"result"`
}

type GetConnectionByGroupMsg struct {
	GroupId int64      `json:"-"`
	Result  Connection `json:"result"`
}

type GetConnectionsByGroupPathIdMsg struct {
	PathById string      `json:"-"`
	Page     int64       `json:"page"`
	PerPage  int64       `json:"perPage"`
	Result   Connections `json:"result"`
}

type AddUserConnectionMsg struct {
	ConnectionExt int64      `json:"-"`
	UserId        int64      `json:"user_id" binding:"required"`
	Login         string     `json:"login" binding:"required"`
	Email         string     `json:"email" binding:"required"`
	Phone         string     `json:"phone"`
	Name          string     `json:"name" binding:"required"`
	Role          string     `json:"role" binding:"required"`
	CreatedBy     string     `json:"created_by" binding:"required"`
	User          User       `json:"user" binding:"required"`
	Otp           string     `json:"otp" binding:"required"`
	Result        Connection `json:"result"`
}

type SendConnectionUserOtpMsg struct {
	ConnectionExt int64  `json:"connection_ext" binding:"required"`
	Name          string `json:"name" binding:"required"`
	UserId        int64  `json:"user_id" binding:"required"`
}

type GetConnectionUsersMsg struct {
	ConnectionId int64      `json:"-"`
	Page         int64      `json:"page"`
	PerPage      int64      `json:"perPage"`
	Result       Groupusers `json:"result"`
}

type RemoveUserConnectionMsg struct {
	Id            int64  `json:"id"`
	ConnectionExt int64  `json:"connection_ext"`
	DeletedBy     string `json:"deleted_by"`
}

type GetUserConnectionMsg struct {
	Id     int64          `json:"id"`
	Result ConnectionUser `json:"result"`
}

type GetConnectionsByUserMsg struct {
	OrgId   int64       `json:"orgId"`
	UserId  int64       `json:"userId"`
	Page    int64       `json:"page"`
	PerPage int64       `json:"perPage"`
	Result  Connections `json:"result"`
}

type GetAllConnectionsByUserMsg struct {
	UserId  int64       `json:"userId"`
	Page    int64       `json:"page"`
	PerPage int64       `json:"perPage"`
	Result  Connections `json:"result"`
}
