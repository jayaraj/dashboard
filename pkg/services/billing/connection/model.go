package connection

type SubscribeConnectionMsg struct {
	Number float64 `json:"number" validate:"required" binding:"required"`
}
