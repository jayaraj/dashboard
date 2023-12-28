package devicemanagement

import "time"

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
