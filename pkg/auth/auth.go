package auth

import (
	"errors"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
)

var (
	ErrInvalidCredentials = errors.New("Invalid Username or Password")
)

type LoginSettings struct {
	LdapEnabled bool
}

type LdapFilterToOrg struct {
	Filter  string
	OrgId   int
	OrgRole string
}

type LdapSettings struct {
	Enabled      bool
	Hosts        []string
	UseSSL       bool
	BindDN       string
	AttrUsername string
	AttrName     string
	AttrSurname  string
	AttrMail     string
	Filters      []LdapFilterToOrg
}

type AuthSource interface {
	AuthenticateUser(username, password string) (*m.User, error)
}

type AuthenticateUserQuery struct {
	Username string
	Password string
	User     *m.User
}

func init() {
	bus.AddHandler("auth", AuthenticateUser)
}

func AuthenticateUser(query *AuthenticateUserQuery) error {
	err := loginUsingGrafanaDB(query)
	if err == nil || err != ErrInvalidCredentials {
		return err
	}

	if setting.LdapEnabled {
		err = loginUsingLdap(query)
	}

	return err
}

func loginUsingGrafanaDB(query *AuthenticateUserQuery) error {
	userQuery := m.GetUserByLoginQuery{LoginOrEmail: query.Username}

	if err := bus.Dispatch(&userQuery); err != nil {
		if err == m.ErrUserNotFound {
			return ErrInvalidCredentials
		}
		return err
	}

	user := userQuery.Result

	passwordHashed := util.EncodePassword(query.Password, user.Salt)
	if passwordHashed != user.Password {
		return ErrInvalidCredentials
	}

	query.User = user
	return nil
}
