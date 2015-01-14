package models

import (
	"errors"
	"time"
)

// Typed errors

var (
	ErrAccountNotFound = errors.New("Account not found")
)

type Account struct {
	Id              int64
	Login           string `xorm:"UNIQUE NOT NULL"`
	Email           string `xorm:"UNIQUE NOT NULL"`
	Name            string
	FullName        string
	Password        string
	IsAdmin         bool
	Salt            string `xorm:"VARCHAR(10)"`
	Company         string
	NextDashboardId int
	UsingAccountId  int64
	Created         time.Time
	Updated         time.Time
}

// ---------------------
// COMMANDS

type CreateAccountCommand struct {
	Email    string  `json:"email" binding:"required"`
	Login    string  `json:"login"`
	Password string  `json:"password" binding:"required"`
	Name     string  `json:"name"`
	Company  string  `json:"company"`
	Salt     string  `json:"-"`
	Result   Account `json:"-"`
}

type SetUsingAccountCommand struct {
	AccountId      int64
	UsingAccountId int64
}

// ----------------------
// QUERIES

type GetAccountInfoQuery struct {
	Id     int64
	Result AccountDTO
}

type GetOtherAccountsQuery struct {
	AccountId int64
	Result    []*OtherAccountDTO
}

type GetAccountByIdQuery struct {
	Id     int64
	Result *Account
}

type GetAccountByLoginQuery struct {
	Login  string
	Result *Account
}

// ------------------------
// DTO & Projections

type OtherAccountDTO struct {
	Id      int64  `json:"id"`
	Email   string `json:"email"`
	Role    string `json:"role"`
	IsUsing bool   `json:"isUsing"`
}

type CollaboratorDTO struct {
	AccountId int64  `json:"accountId"`
	Email     string `json:"email"`
	Role      string `json:"role"`
}

type AccountDTO struct {
	Email         string             `json:"email"`
	Name          string             `json:"name"`
	Collaborators []*CollaboratorDTO `json:"collaborators"`
}
