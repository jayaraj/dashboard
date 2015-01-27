package api

import (
	"github.com/torkelo/grafana-pro/pkg/bus"
	"github.com/torkelo/grafana-pro/pkg/middleware"
	m "github.com/torkelo/grafana-pro/pkg/models"
	"github.com/torkelo/grafana-pro/pkg/util"
)

// POST /api/account/signup
func SignUp(c *middleware.Context, cmd m.CreateUserCommand) {

	cmd.Login = cmd.Email
	cmd.Salt = util.GetRandomString(10)
	cmd.Rands = util.GetRandomString(10)
	cmd.Password = util.EncodePassword(cmd.Password, cmd.Salt)

	if err := bus.Dispatch(&cmd); err != nil {
		c.JsonApiErr(500, "failed to create user", err)
		return
	}

	user := cmd.Result

	loginUserWithUser(&user, c)

	c.JsonOK("User created and logged in")
}
