package connection

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/infra/utils"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/alerts"
	"github.com/jayaraj/messages/client/watermeter"
	"github.com/phpdave11/gofpdf"
	"github.com/pkg/errors"
	"golang.org/x/sync/errgroup"
)

func (service *Service) GetReportByConnectionExt(c *contextmodel.ReqContext) response.Response {
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	connection, err := service.getConnectionByExt(c.Req.Context(), number)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get connection", err)
	}

	report := Report{
		Connection: connection,
		Alerts:     watermeter.AlertStatsResponse{},
	}

	if err := service.runParallelCancelOnError(c.Req.Context(), &report); err != nil {
		return response.Error(http.StatusInternalServerError, "failed to build report", err)
	}

	pdfBytes, err := service.buildReportPDF(report)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to build pdf", err)
	}

	return response.Respond(http.StatusOK, pdfBytes).
		SetHeader("Content-Type", "application/pdf").
		SetHeader("Content-Disposition", fmt.Sprintf(`attachment; filename="report-%d.pdf"`, connection.ConnectionExt))
}

func (service *Service) GenerateReport(c *contextmodel.ReqContext) response.Response {
	dto := TriggerReportGenerationMsg{}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	connection, err := service.getConnectionByExt(c.Req.Context(), dto.Number)
	if err != nil {
		return response.Error(http.StatusBadRequest, "getting connection number failed", err)
	}
	found := false
	if connection.Extras != nil {
		if waIds, ok := connection.Extras["wa_id"].([]interface{}); ok {
			for _, w := range waIds {
				switch id := w.(type) {
				case int64:
					x, _ := strconv.Atoi(dto.WaId)
					if int(id) == x {
						found = true
						break
					}
				case float64:
					x, _ := strconv.Atoi(dto.WaId)
					if int(id) == x {
						found = true
						break
					}
				case string:
					if id == dto.WaId {
						found = true
						break
					}
				default:
					if fmt.Sprintf("%v", w) == dto.WaId {
						found = true
						break
					}
				}
			}
		}
	}
	if !found {
		return response.Error(http.StatusBadRequest, "wa_id not subscribed for report generation", nil)
	}

	service.reportChan <- dto
	return response.Success("generated")
}

func (service *Service) TriggerReportGeneration(ctx context.Context, msg *TriggerReportGenerationMsg) error {

	report := Report{
		Connection: msg.Connection,
	}

	if err := service.runParallelCancelOnError(ctx, &report); err != nil {
		return err
	}

	pdfBytes, err := service.buildReportPDF(report)
	if err != nil {
		return err
	}

	triggerGrafo := &alerts.TriggerGrafoMsg{
		OrgId: msg.Connection.OrgId,
		Topic: "report",
		Payload: map[string]any{
			"command":  "report",
			"file":     pdfBytes,
			"wa_id":    []string{msg.WaId},
			"filename": fmt.Sprintf(`report-%d.pdf`, msg.Connection.ConnectionExt),
		},
	}
	c, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	body, err := json.Marshal(triggerGrafo)
	if err != nil {
		return errors.Wrap(err, "failed to marshal trigger grafo msg")
	}
	return service.devMgmt.Publish(c, client.ReaderTopic(alerts.TriggerGrafo), body)
}

func (service *Service) getAlertStats(ctx context.Context, report *Report) error {
	msg := &watermeter.AlertStatsMsg{
		OrgId:     report.Connection.OrgId,
		GroupId:   report.Connection.GroupId,
		GroupPath: report.Connection.GroupPathId,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.AlertStats), msg); err != nil {
		return err
	}
	report.Alerts = msg.Result
	return nil
}

func (service *Service) getBillDetails(ctx context.Context, report *Report) error {
	msg := &watermeter.BillDetailsMsg{
		ConnectionId: report.Connection.Id,
		GroupId:      report.Connection.GroupId,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.BillDetails), msg); err != nil {
		return err
	}
	report.BillDetails = msg.Result
	return nil
}

func (service *Service) getWeeklyComparison(ctx context.Context, report *Report) error {
	msg := &watermeter.WeeklyConsumptionComparisonMsg{
		OrgId:       uint64(report.Connection.OrgId),
		Measurement: "wm",
		GroupId:     uint64(report.Connection.GroupId),
		GroupPath:   report.Connection.GroupPathId,
		GroupTag:    "billed",
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.WeeklyConsumptionComparison), msg); err != nil {
		return err
	}
	report.WeeklyComparison = msg.Result
	return nil
}

func (service *Service) formatTime(v interface{}, withDate bool) string {
	switch t := v.(type) {
	case string:
		if parsed, err := time.Parse(time.RFC3339, t); err == nil {
			if withDate {
				return parsed.Format("Jan 02")
			}
			return parsed.Format("Jan")
		}
		return t
	}
	return ""
}

func (service *Service) ConvertSeriesToChartData(s watermeter.Series, withDate bool) ChartData {
	cd := ChartData{
		Labels:     make([]string, 0),
		Categories: make([]string, 0),
		Data:       make([][]float64, 0),
	}
	if len(s.Columns) == 0 || len(s.Rows) == 0 {
		return cd
	}

	labelIdx := -1
	for i, c := range s.Columns {
		t := strings.ToLower(c.Type)
		txt := strings.ToLower(c.Text)
		if strings.Contains(t, "time") || strings.Contains(txt, "time") {
			labelIdx = i
			break
		}
	}
	if labelIdx == -1 {
		labelIdx = 0
	}

	labels := make([]string, len(s.Rows))
	for i, row := range s.Rows {
		var cell interface{}
		if labelIdx < len(row) {
			cell = row[labelIdx]
		}
		labels[i] = service.formatTime(cell, withDate)
	}
	cd.Labels = labels

	// build categories: all columns except labelIdx
	numCats := 0
	for i := range s.Columns {
		if i == labelIdx {
			continue
		}
		numCats++
	}
	if numCats == 0 {
		return cd
	}

	categories := make([]string, 0, numCats)
	catColIdxs := make([]int, 0, numCats)
	for i, c := range s.Columns {
		if i == labelIdx {
			continue
		}
		categories = append(categories, c.Text)
		catColIdxs = append(catColIdxs, i)
	}
	cd.Categories = categories

	data := make([][]float64, len(labels))
	for i := range data {
		data[i] = make([]float64, numCats)
	}

	// fill: row-major
	for rowIdx, row := range s.Rows {
		for catIdx, colIdx := range catColIdxs {
			var v interface{}
			if colIdx < len(row) {
				v = row[colIdx]
			}
			data[rowIdx][catIdx] = utils.CovertToFloat64(v)
		}
	}
	cd.Data = data
	return cd
}

func (service *Service) getDailyConsumption(ctx context.Context, report *Report) error {
	msg := &watermeter.TagwiseDailyConsumptionMsg{
		OrgId:       uint64(report.Connection.OrgId),
		Measurement: "wm",
		UtcOffset:   330,
		From:        time.Now().AddDate(0, 0, -16),
		To:          time.Now(),
		GroupId:     report.Connection.GroupId,
		GroupPath:   report.Connection.GroupPathId,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.TagwiseDailyConsumption), msg); err != nil {
		return err
	}
	report.DailyUsage = service.ConvertSeriesToChartData(msg.Result, true)

	return nil
}

func (service *Service) getMonthlyBills(ctx context.Context, report *Report) error {
	msg := &watermeter.MonthlyInvoicesMsg{
		ConnectionId: report.Connection.Id,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.MonthlyInvoices), msg); err != nil {
		return err
	}
	report.MonthlyBills = service.ConvertSeriesToChartData(msg.Result, false)

	return nil
}

func (service *Service) getGroupComparison(ctx context.Context, report *Report) error {
	msg := &watermeter.GroupComparisonMsg{
		OrgId:       uint64(report.Connection.OrgId),
		Measurement: "wm",
		UtcOffset:   330,
		GroupId:     report.Connection.GroupId,
		GroupPath:   report.Connection.GroupPathId,
		GroupTag:    "billed",
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.GroupComparison), msg); err != nil {
		return err
	}
	report.GroupComparison = msg.Result
	return nil
}

func (service *Service) getMonthlyConsumptions(ctx context.Context, report *Report) error {
	msg := &watermeter.MonthlyConsumptionMsg{
		OrgId:       uint64(report.Connection.OrgId),
		Measurement: "wm",
		GroupId:     uint64(report.Connection.GroupId),
		GroupPath:   report.Connection.GroupPathId,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.MonthlyConsumption), msg); err != nil {
		return err
	}
	report.MonthlyUsage = service.ConvertSeriesToChartData(msg.Result, false)
	return nil
}

func (service *Service) getAssets(ctx context.Context, report *Report) error {
	msg := &watermeter.ListResourcesMsg{
		OrgId:       uint64(report.Connection.OrgId),
		UtcOffset:   330,
		Measurement: "wm",
		GroupId:     report.Connection.GroupId,
		GroupPath:   report.Connection.GroupPathId,
		Page:        1,
		PerPage:     10,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ReaderTopic(watermeter.ListResources), msg); err != nil {
		return err
	}
	report.Assets = msg.Result
	return nil
}

func (service *Service) runParallelCancelOnError(ctx context.Context, report *Report) (err error) {
	defer func() {
		if r := recover(); r != nil {
			switch t := r.(type) {
			case error:
				err = errors.Wrapf(r.(error), "run tasks panic recovered")
			default:
				err = errors.Wrapf(err, "run tasks  unknown panic error: %v", t)
			}
		}
	}()
	group, grpContext := errgroup.WithContext(ctx)

	//AlertStats
	group.Go(func() error { return service.getAlertStats(grpContext, report) })

	//Billdetails
	group.Go(func() error { return service.getBillDetails(grpContext, report) })

	//WeeklyComparison
	group.Go(func() error { return service.getWeeklyComparison(grpContext, report) })

	//DailyConsumption
	group.Go(func() error { return service.getDailyConsumption(grpContext, report) })

	//MonthlyBills
	group.Go(func() error { return service.getMonthlyBills(grpContext, report) })

	//GroupComparison
	group.Go(func() error { return service.getGroupComparison(grpContext, report) })

	//MonthlyConsumption
	group.Go(func() error { return service.getMonthlyConsumptions(grpContext, report) })

	//Get Assets
	group.Go(func() error { return service.getAssets(grpContext, report) })

	if err := group.Wait(); err != nil {
		return err
	}
	return nil
}

func (service *Service) safeString(s string) string {
	if s == "" {
		return "-"
	}
	return s
}

func (service *Service) buildReportPDF(report Report) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 20)
	pdf.AddPage()

	pdf.SetFont("Helvetica", "B", 18)
	pdf.CellFormat(0, 10, "Connection Report", "", 1, "C", false, 0, "")
	pdf.Ln(2)

	pdf.SetDrawColor(0, 0, 0)
	pdf.SetLineWidth(0.3)
	pdf.Line(15, 30, 195, 30)
	pdf.Ln(6)

	//Section 1: Connection Details
	service.connectionDetailsSection(pdf, report)

	//Section 2 Billing Details & weekly usage
	service.drawUsageAndBillingCards(pdf, report)

	//Section 3: Stacked Bar Chart for last 6 months usage by category
	service.drawStackedBarChart(pdf, "Daily Usage/Supply", report.DailyUsage)

	//Section 4: Monthly Bills
	service.drawStackedBarChart(pdf, "Monthly Bills", report.MonthlyBills)

	pdf.AddPage()

	//Section 5: Alerts & Group Comaprison
	service.drawAlertsAndGroupComparison(pdf, report)

	//Section 6: Monthly Usage
	service.drawLineChart(pdf, "Monthly Usage/Supply", report.MonthlyUsage)

	//Section 7: Assets
	HeaderMap := map[string]Header{
		"name":           {Text: "Name", Index: 0},
		"uuid":           {Text: "UUID", Index: 1},
		"counter":        {Text: "Counter (L)", Index: 2},
		"counterm3":      {Text: "Counter (m3)", Index: 3},
		"batteryvoltage": {Text: "Battery Voltage", Index: 4},
		"temperature":    {Text: "Temperature", Index: 5},
		"online":         {Text: "Online", Index: 6},
	}
	service.drawSeriesTable(pdf, "Assets", report.Assets, HeaderMap)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func (service *Service) connectionDetailsSection(pdf *gofpdf.Fpdf, report Report) {
	// layout constants
	leftColX := 20.0
	rightColX := 100.0
	labelW := 15.0         // label width for both columns
	labelToValueGap := 6.0 // <-- same gap between "Label:" and the value on both columns
	lineHeight := 6.0

	// compute value start X positions (same gap applied to both columns)
	leftValX := leftColX + labelW + labelToValueGap   // e.g. 20 + 15 + 6 = 41
	rightValX := rightColX + labelW + labelToValueGap // e.g. 110 + 15 + 6 = 131

	// compute value widths (respecting right margin of 15mm => content end at 195)
	leftValueW := rightColX - leftValX - 2.0 // left value area ends just before right column
	rightValueW := 195.0 - rightValX - 2.0   // right value area ends at page content right edge

	// Safety: if labelW is too large for left column, shrink it to avoid overlap
	if leftValX-leftColX < labelW {
		// recompute labelW so it fits
		labelW = leftValX - leftColX
		if labelW < 6 {
			labelW = 6
		}
	}

	// Start rendering
	pdf.SetFont("Helvetica", "", 10)
	startY := pdf.GetY()

	// LEFT: Name
	pdf.SetXY(leftColX, startY)
	pdf.CellFormat(labelW, lineHeight, "Name:", "", 0, "L", false, 0, "")
	pdf.SetXY(leftValX, startY)
	pdf.MultiCell(leftValueW, lineHeight, service.safeString(report.Connection.Name), "", "L", false)

	//LEFT: Connection EXT
	pdf.SetXY(leftColX, pdf.GetY())
	pdf.CellFormat(labelW, lineHeight, "Number:", "", 0, "L", false, 0, "")
	pdf.SetXY(leftValX, pdf.GetY())
	pdf.MultiCell(leftValueW, lineHeight, service.safeString(fmt.Sprintf("%d", report.Connection.ConnectionExt)), "", "L", false)

	// LEFT: Email
	pdf.SetXY(leftColX, pdf.GetY())
	pdf.CellFormat(labelW, lineHeight, "Email:", "", 0, "L", false, 0, "")
	pdf.SetXY(leftValX, pdf.GetY())
	pdf.MultiCell(leftValueW, lineHeight, service.safeString(report.Connection.Email), "", "L", false)

	// LEFT: Phone
	pdf.SetXY(leftColX, pdf.GetY())
	pdf.CellFormat(labelW, lineHeight, "Phone:", "", 0, "L", false, 0, "")
	pdf.SetXY(leftValX, pdf.GetY())
	pdf.MultiCell(leftValueW, lineHeight, service.safeString(report.Connection.Phone), "", "L", false)

	// RIGHT column: align top to left column
	pdf.SetY(startY)

	// RIGHT: Status
	pdf.SetXY(rightColX, pdf.GetY())
	pdf.CellFormat(labelW, lineHeight, "Status:", "", 0, "L", false, 0, "")
	pdf.SetXY(rightValX, pdf.GetY())
	pdf.MultiCell(rightValueW, lineHeight, service.safeString(report.Connection.Status), "", "L", false)

	// RIGHT: Address label
	pdf.SetXY(rightColX, pdf.GetY())
	pdf.CellFormat(labelW, lineHeight, "Address:", "", 0, "L", false, 0, "")

	// RIGHT: Address lines (use rightValueW)
	pdf.SetXY(rightValX, pdf.GetY())
	pdf.MultiCell(rightValueW, lineHeight, service.safeString(report.Connection.Address1), "", "L", false)

	pdf.SetXY(rightValX, pdf.GetY())
	pdf.MultiCell(rightValueW, lineHeight, service.safeString(report.Connection.Address2), "", "L", false)

	// city + pincode combined
	cityZip := ""
	if report.Connection.City != "" && report.Connection.Pincode != "" {
		cityZip = fmt.Sprintf("%s - %s", report.Connection.City, report.Connection.Pincode)
	} else if report.Connection.City != "" {
		cityZip = report.Connection.City
	}

	pdf.SetXY(rightValX, pdf.GetY())
	pdf.MultiCell(rightValueW, lineHeight, service.safeString(cityZip), "", "L", false)
	pdf.Ln(1)
}

func (service *Service) fixSymbols(s string) string {
	replacements := map[string]string{
		"µ": string([]byte{0xB5}), // micro symbol (µ)
		"₹": "Rs.",                // Rupee fallback
		"°": string([]byte{0xB0}), // degree symbol
		"–": "-",                  // en dash
	}

	for k, v := range replacements {
		s = strings.ReplaceAll(s, k, v)
	}
	return s
}

func (service *Service) formatLiters(liters float64) string {
	unit := "L"
	value := liters

	switch {
	case liters == 0:
		unit = "L"
	case liters < 0.001:
		value = liters * 1_000_000
		unit = "µL" // microliters
	case liters < 1:
		value = liters * 1_000
		unit = "mL"
	case liters >= 1_000_000:
		value = liters / 1_000_000
		unit = "ML" // megaliters
	case liters >= 1_000:
		value = liters / 1_000
		unit = "kL" // kiloliters
	}

	return service.fixSymbols(fmt.Sprintf("%.3g %s", value, unit))
}

func (service *Service) formatPercentage(percentage float64, indicator watermeter.IndicatorType) string {
	if indicator == watermeter.UNKNOWN {
		return "N/A"
	}
	return fmt.Sprintf("%.2f %%", percentage)
}

func (service *Service) indicator(pdf *gofpdf.Fpdf, arrowX, arrowY, arrowR float64, indicator watermeter.IndicatorType) {
	switch indicator {
	case watermeter.UP:
		pdf.SetFillColor(34, 139, 34) // green
		pdf.Circle(arrowX, arrowY, arrowR, "F")
		pdf.SetFillColor(255, 255, 255)
		p := []gofpdf.PointType{
			{X: arrowX - 3, Y: arrowY + 2},
			{X: arrowX + 3, Y: arrowY + 2},
			{X: arrowX, Y: arrowY - 3},
		}
		pdf.SetXY(0, 0)
		pdf.Polygon(p, "F")
	case watermeter.DOWN:
		pdf.SetFillColor(220, 20, 60) // red
		pdf.Circle(arrowX, arrowY, arrowR, "F")
		pdf.SetFillColor(255, 255, 255)
		p := []gofpdf.PointType{
			{X: arrowX - 3, Y: arrowY - 2},
			{X: arrowX + 3, Y: arrowY - 2},
			{X: arrowX, Y: arrowY + 3},
		}
		pdf.SetXY(0, 0)
		pdf.Polygon(p, "F")
	default:
		pdf.SetFillColor(255, 165, 0)
		pdf.Circle(arrowX, arrowY, arrowR, "F")
		pdf.SetFillColor(255, 255, 255)
		rectW := arrowR * 1.2 // rectangle width relative to circle radius
		rectH := arrowR * 0.6 // rectangle height relative to circle radius
		x := arrowX - rectW/2 // top-left X
		y := arrowY - rectH/2 // top-left Y
		pdf.Rect(x, y, rectW, rectH, "F")
	}
}

func (service *Service) drawUsageAndBillingCards(pdf *gofpdf.Fpdf, report Report) {
	// layout constants
	marginLeft := 15.0
	marginRight := 15.0
	pageContentW := 210.0 - marginLeft - marginRight // A4 width 210mm
	gapBetween := 12.0

	cardW := (pageContentW - gapBetween) / 2.0
	cardH := 60.0
	cardTop := pdf.GetY() + 8.0
	leftCardX := marginLeft
	rightCardX := marginLeft + cardW + gapBetween

	// Card border style
	pdf.SetDrawColor(200, 200, 200)
	pdf.SetLineWidth(0.4)

	// ---------- LEFT CARD (Usage) ----------
	pdf.Rect(leftCardX, cardTop, cardW, cardH, "D")

	// Title
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(leftCardX, cardTop+6)
	pdf.CellFormat(cardW, 6, "Weekly Usage", "", 0, "C", false, 0, "")

	// big percent (center)
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetXY(leftCardX, cardTop+18)
	pdf.CellFormat(cardW, 10, service.formatPercentage(report.WeeklyComparison.Change, report.WeeklyComparison.Indicator), "", 0, "C", false, 0, "")

	// center divider line
	lineY := cardTop + cardH/2.0 - 2.0
	centerX := leftCardX + cardW/2.0
	pdf.SetDrawColor(160, 160, 160)
	pdf.Line(leftCardX+12, lineY, leftCardX+cardW-12, lineY)
	pdf.Line(centerX, lineY, centerX, lineY+cardH/2-12)

	// arrow indicator (circle + triangle)
	arrowX := leftCardX + 8
	arrowY := cardTop + 8
	arrowR := 6.0

	service.indicator(pdf, arrowX, arrowY, arrowR, report.WeeklyComparison.Indicator)

	colPad := 12.0
	colMid := leftCardX + cardW/2.0
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(leftCardX+colPad, lineY+6)
	pdf.CellFormat((cardW/2.0)-colPad, 6, "Last Week", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(leftCardX+colPad, lineY+14)
	pdf.CellFormat((cardW/2.0)-colPad, 6, service.formatLiters(report.WeeklyComparison.Last), "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(colMid, lineY+6)
	pdf.CellFormat((cardW/2.0)-colPad, 6, "Previous Week", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(colMid, lineY+14)
	pdf.CellFormat((cardW/2.0)-colPad, 6, service.formatLiters(report.WeeklyComparison.Previous), "", 0, "C", false, 0, "")

	// ---------- RIGHT CARD (Billing) ----------
	pdf.SetDrawColor(200, 200, 200)
	pdf.SetLineWidth(0.4)
	pdf.Rect(rightCardX, cardTop, cardW, cardH, "D")
	// Title
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(rightCardX, cardTop+6)
	pdf.CellFormat(cardW, 6, fmt.Sprintf("Bill Plan: %s", report.BillDetails.Plan), "", 0, "C", false, 0, "")

	// draw cross divider (centered)
	centerX = rightCardX + cardW/2.0
	centerY := cardTop + cardH/2.0 - 2.0
	pdf.SetDrawColor(180, 180, 180)
	pdf.Line(rightCardX+12, centerY, rightCardX+cardW-12, centerY) // horizontal
	pdf.Line(centerX, cardTop+12, centerX, cardTop+cardH-12)       // vertical

	// Labels and values
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightCardX+12, cardTop+12)
	pdf.CellFormat((cardW/2.0)-12, 6, "Bill Date", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(rightCardX+12, cardTop+20)
	pdf.CellFormat((cardW/2.0)-12, 8, report.BillDetails.InvoiceDate.Format("Jan 2, 2006"), "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(centerX, cardTop+12)
	pdf.CellFormat((cardW/2.0)-12, 6, "Billed Amount", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(centerX, cardTop+20)
	pdf.CellFormat((cardW/2.0)-12, 8, fmt.Sprintf("Rs. %0.0f", report.BillDetails.LastBilledAmount), "", 0, "C", false, 0, "")

	// bottom-left (Previous Balance) and bottom-right (Total Unpaid)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightCardX+12, centerY+6)
	pdf.CellFormat((cardW/2.0)-12, 6, "Previous Balance", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(rightCardX+12, centerY+14)
	pdf.CellFormat((cardW/2.0)-12, 8, fmt.Sprintf("Rs. %0.0f", report.BillDetails.OldBalance), "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(centerX, centerY+6)
	pdf.CellFormat((cardW/2.0)-12, 6, "Total Unpaid", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(centerX, centerY+14)
	pdf.CellFormat((cardW/2.0)-12, 8, fmt.Sprintf("Rs. %0.0f", report.BillDetails.Balance), "", 0, "C", false, 0, "")

	// move cursor below cards
	pdf.SetY(cardTop + cardH + 6)
}

func (service *Service) drawStackedBarChart(pdf *gofpdf.Fpdf, title string, chartData ChartData) {
	x := 15.0
	y := pdf.GetY() + 6.0
	w := 180.0
	h := 60.0
	// basic layout
	plotX := x + 8.0
	plotY := y + 12.0
	plotW := w - 16.0
	plotH := h - 28.0

	// compute totals and max
	n := len(chartData.Labels)
	m := len(chartData.Categories)
	totals := make([]float64, n)
	max := 0.0
	for i := 0; i < n; i++ {
		sum := 0.0
		for j := 0; j < m; j++ {
			if j < len(chartData.Data[i]) {
				sum += chartData.Data[i][j]
			}
		}
		totals[i] = sum
		if sum > max {
			max = sum
		}
	}
	if max == 0 {
		max = 1
	}

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(x, y)
	pdf.CellFormat(w, 6, title, "", 0, "L", false, 0, "")

	// grid lines + Y ticks
	numTicks := 5.0
	// draw horizontal grid lines (4 ticks)
	pdf.SetDrawColor(230, 230, 230)
	pdf.SetFont("Helvetica", "", 8)
	for t := 0.0; t <= numTicks; t++ {
		yy := plotY + float64(t)/float64(numTicks)*plotH
		pdf.Line(plotX, yy, plotX+plotW, yy)
		val := max * (1.0 - float64(t)/float64(numTicks))
		pdf.Text(x+2, yy+3, fmt.Sprintf("%.2f", val))
	}

	// bar layout
	barGap := 6.0
	if n == 0 {
		return
	}
	totalGaps := float64(n+1) * barGap
	barWidth := (plotW - totalGaps) / float64(n)
	if barWidth < 4 {
		barWidth = 4
	}

	palette := [][]int{
		{60, 130, 200},  // blue
		{100, 180, 100}, // green
		{230, 120, 60},  // orange
		{170, 120, 220}, // purple
		{200, 80, 120},  // pink
		{180, 180, 180}, // gray
		{120, 200, 250}, // light blue
		{250, 200, 100}, // yellow
		{150, 150, 100}, // brown
		{100, 220, 180}, // teal
		{200, 200, 200}, // light gray
		{220, 180, 220}, // light purple
		{180, 220, 180}, // light green
		{250, 150, 150}, // light red
	}

	for i := 0; i < n; i++ {
		stackBottom := plotY + plotH
		barX := plotX + barGap + float64(i)*(barWidth+barGap)
		for j := 0; j < m; j++ {
			val := 0.0
			if i < len(chartData.Data) && j < len(chartData.Data[i]) {
				val = chartData.Data[i][j]
			}
			if val <= 0 {
				continue
			}

			hVal := (val / max) * plotH
			barY := stackBottom - hVal
			col := palette[j%len(palette)]
			pdf.SetFillColor(col[0], col[1], col[2])
			pdf.Rect(barX, barY, barWidth, hVal, "F")
			stackBottom = barY
		}

		pdf.SetFont("Helvetica", "", 8)
		labelX := barX + barWidth/2.0
		pdf.SetXY(labelX-15, plotY+plotH+2)
		pdf.CellFormat(30, 4, chartData.Labels[i], "", 0, "C", false, 0, "")
	}

	legendRadius := 2.0
	legendSpacing := 8.0
	legendY := y + h - 6.0
	pdf.SetFont("Helvetica", "", 9)

	legendTotalW := 0.0
	for j := 0; j < m; j++ {
		itemW := (legendRadius*2 + 2.0) + pdf.GetStringWidth(chartData.Categories[j]) + legendSpacing
		legendTotalW += itemW
	}
	legendTotalW -= legendSpacing

	legendStartX := x + (w-legendTotalW)/2.0
	legendX := legendStartX
	legendYLine := legendY

	for j := 0; j < m; j++ {
		col := palette[j%len(palette)]
		pdf.SetFillColor(col[0], col[1], col[2])
		pdf.Circle(legendX+legendRadius, legendYLine, legendRadius, "F")

		pdf.SetXY(legendX+(legendRadius*2)+2, legendYLine-3)
		pdf.CellFormat(0, legendRadius*2+2, chartData.Categories[j], "", 0, "L", false, 0, "")

		itemW := (legendRadius*2 + 2.0) + pdf.GetStringWidth(chartData.Categories[j]) + legendSpacing
		legendX += itemW

		if legendX+itemW > x+w-10 {
			legendX = legendStartX
			legendYLine += legendRadius*2 + 6
		}
	}
	sx, sy := pdf.GetX(), pdf.GetY()+8.0
	pdf.SetXY(sx, sy)
}

func (service *Service) drawLineChart(pdf *gofpdf.Fpdf, title string, chartData ChartData) {
	x := 15.0
	y := pdf.GetY() + 6.0
	w := 180.0
	h := 60.0
	plotX := x + 8.0
	plotY := y + 12.0
	plotW := w - 16.0
	plotH := h - 28.0

	n := len(chartData.Labels)
	m := len(chartData.Categories)
	maxVal := 0.0
	for i := 0; i < n; i++ {
		if i >= len(chartData.Data) {
			continue
		}
		for j := 0; j < m; j++ {
			if j < len(chartData.Data[i]) {
				v := chartData.Data[i][j]
				if v > maxVal {
					maxVal = v
				}
			}
		}
	}
	if maxVal == 0 {
		maxVal = 1
	}

	// header/title
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(x, y)
	pdf.CellFormat(w, 6, title, "", 0, "L", false, 0, "")

	// grid lines + Y ticks
	numTicks := 5
	pdf.SetDrawColor(230, 230, 230)
	pdf.SetFont("Helvetica", "", 8)
	for t := 0; t <= numTicks; t++ {
		yy := plotY + float64(t)/float64(numTicks)*plotH
		pdf.Line(plotX, yy, plotX+plotW, yy)
		val := maxVal * (1.0 - float64(t)/float64(numTicks))
		pdf.Text(x+2, yy+3, fmt.Sprintf("%.0f", val))
	}

	// Prepare plotting points: x positions (evenly spaced)
	var stepX float64
	if n > 0 {
		stepX = plotW / float64(n) // n bins, centers at half-step offsets
	} else {
		stepX = plotW / 2.0
	}
	// palette for multiple series
	palette := [][]int{
		{60, 130, 200},  // blue
		{100, 180, 100}, // green
		{230, 120, 60},  // orange
		{170, 120, 220}, // purple
		{200, 80, 120},  // pink
		{180, 180, 180}, // gray
		{120, 200, 250}, // light blue
		{250, 200, 100}, // yellow
		{150, 150, 100}, // brown
		{100, 220, 180}, // teal
		{200, 200, 200}, // light gray
		{220, 180, 220}, // light purple
		{180, 220, 180}, // light green
		{250, 150, 150}, // light red
	}

	points := make([][][2]float64, m)
	for j := 0; j < m; j++ {
		points[j] = make([][2]float64, n)
	}
	for i := 0; i < n; i++ {
		xx := plotX + stepX*0.5 + float64(i)*stepX
		for j := 0; j < m; j++ {
			val := 0.0
			if i < len(chartData.Data) && j < len(chartData.Data[i]) {
				val = chartData.Data[i][j]
			}
			yy := plotY + plotH - (val/maxVal)*plotH
			points[j][i] = [2]float64{xx, yy}
		}
	}

	pdf.SetLineWidth(0.9)
	for j := 0; j < m; j++ {
		col := palette[j%len(palette)]
		pdf.SetDrawColor(col[0], col[1], col[2])
		for i := 1; i < n; i++ {
			p1 := points[j][i-1]
			p2 := points[j][i]
			pdf.Line(p1[0], p1[1], p2[0], p2[1])
		}
		pdf.SetFillColor(col[0], col[1], col[2])
		for i := 0; i < n; i++ {
			pt := points[j][i]
			pdf.Circle(pt[0], pt[1], 1.8, "F")
		}
	}

	pdf.SetFont("Helvetica", "", 8)
	labelW := 30.0
	for i := 0; i < n; i++ {
		label := chartData.Labels[i]
		labelX := plotX + stepX*0.5 + float64(i)*stepX // same center used for points
		// ensure label doesn't overflow the plotting area
		if labelX-labelW/2.0 < plotX {
			labelX = plotX + labelW/2.0
		}
		if labelX+labelW/2.0 > plotX+plotW {
			labelX = plotX + plotW - labelW/2.0
		}
		pdf.SetXY(labelX-labelW/2.0, plotY+plotH+3)
		pdf.CellFormat(labelW, 4, label, "", 0, "C", false, 0, "")
	}

	legendRadius := 2.5
	legendSpacing := 10.0
	legendY := y + h - 6.0
	pdf.SetFont("Helvetica", "", 9)

	textWidths := make([]float64, m)
	legendTotalW := 0.0
	for j := 0; j < m; j++ {
		tw := pdf.GetStringWidth(chartData.Categories[j])
		textWidths[j] = tw
		legendTotalW += (legendRadius*2 + 2.0 + tw + legendSpacing)
	}
	legendTotalW -= legendSpacing
	if legendTotalW > w-8.0 {
		legendSpacing = 6.0
		legendTotalW = 0
		for j := 0; j < m; j++ {
			legendTotalW += (legendRadius*2 + 2.0 + textWidths[j] + legendSpacing)
		}
		legendTotalW -= legendSpacing
	}

	legendStartX := x + (w-legendTotalW)/2.0
	legendX := legendStartX
	legendYLine := legendY

	for j := 0; j < m; j++ {
		col := palette[j%len(palette)]
		pdf.SetFillColor(col[0], col[1], col[2])
		pdf.Circle(legendX+legendRadius, legendYLine, legendRadius, "F")
		textW := textWidths[j]
		pdf.SetXY(legendX+(legendRadius*2)+2, legendYLine-3)
		pdf.CellFormat(textW, legendRadius*2+2, chartData.Categories[j], "", 0, "L", false, 0, "")
		itemW := (legendRadius*2 + 2.0 + textW + legendSpacing)
		legendX += itemW
		if legendX+itemW > x+w-8 {
			legendX = legendStartX
			legendYLine += legendRadius*2 + 6
		}
	}
	sx, sy := pdf.GetX(), pdf.GetY()+20.0
	pdf.SetXY(sx, sy)
}

func (service *Service) drawAlertsAndGroupComparison(pdf *gofpdf.Fpdf, report Report) {
	marginLeft := 15.0
	marginRight := 15.0
	pageContentW := 210.0 - marginLeft - marginRight // A4
	gapBetween := 12.0

	cardW := (pageContentW - gapBetween) / 2.0
	cardH := 80.0
	cardTop := pdf.GetY() + 8.0
	leftCardX := marginLeft
	rightCardX := marginLeft + cardW + gapBetween

	// Card border style
	pdf.SetDrawColor(200, 200, 200)
	pdf.SetLineWidth(0.4)

	// ---------------- LEFT CARD: Alerts ----------------
	pdf.Rect(leftCardX, cardTop, cardW, cardH, "D")

	// Title
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(leftCardX, cardTop+6)
	pdf.CellFormat(cardW, 8, "Total Alerting", "", 0, "C", false, 0, "")

	// big number (center)
	pdf.SetFont("Helvetica", "B", 16)
	alertCountStr := fmt.Sprintf("%d", report.Alerts.Count)
	pdf.SetXY(leftCardX, cardTop+15)
	pdf.CellFormat(cardW, 10, alertCountStr, "", 0, "C", false, 0, "")

	// divider line under number
	lineY := cardTop + 25
	pdf.SetDrawColor(200, 200, 200)
	pdf.Line(leftCardX+12, lineY, leftCardX+cardW-12, lineY)

	// breakdown list (left-aligned inside left card)
	pdf.SetFont("Helvetica", "", 12)
	rowX := leftCardX + 12.0
	rowY := lineY + 6.0
	for key, val := range report.Alerts.Alerts {
		if val > 0 {
			pdf.SetTextColor(220, 20, 60)
		} else {
			pdf.SetTextColor(0, 0, 0)
		}
		pdf.SetXY(rowX, rowY)
		pdf.CellFormat(cardW-24, 8, key, "", 0, "L", false, 0, "")
		pdf.SetXY(rowX, rowY)
		pdf.CellFormat(cardW-24, 8, fmt.Sprintf("%d", val), "", 0, "R", false, 0, "")
		rowY += 10.0
	}
	pdf.SetTextColor(0, 0, 0)

	// ---------------- RIGHT CARD: Group Comparison ----------------
	pdf.Rect(rightCardX, cardTop, cardW, cardH, "D")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(rightCardX, cardTop+6)
	pdf.CellFormat(cardW, 6, "Group Comparison", "", 0, "C", false, 0, "")

	// draw cross divider (centered)
	centerX := rightCardX + cardW/2.0
	centerY := cardTop + cardH/2.0 - 2.0
	pdf.SetDrawColor(180, 180, 180)
	pdf.Line(rightCardX+12, centerY, rightCardX+cardW-12, centerY) // horizontal
	pdf.Line(centerX, cardTop+18, centerX, cardTop+cardH-12)       // vertical

	// Usage indicator (left side of right card)
	arrowX := rightCardX + 8.0
	arrowY := cardTop + 8.0
	arrowR := 6.0
	service.indicator(pdf, arrowX, arrowY, arrowR, report.GroupComparison.Indicator)

	monthStr := fmt.Sprintf("%s Usage", report.GroupComparison.Month)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightCardX+12, cardTop+20)
	pdf.CellFormat((cardW/2.0)-12, 6, monthStr, "", 0, "C", false, 0, "")

	percentStr := service.formatPercentage(report.GroupComparison.Percentage, report.GroupComparison.Indicator)
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(rightCardX+12, cardTop+28)
	pdf.CellFormat((cardW/2.0)-12, 8, percentStr, "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(centerX, cardTop+20)
	pdf.CellFormat((cardW/2.0)-12, 6, "Connections", "", 0, "C", false, 0, "")

	connectionsStr := fmt.Sprintf("%d", int64(report.GroupComparison.Count))
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(centerX, cardTop+28)
	pdf.CellFormat((cardW/2.0)-12, 8, connectionsStr, "", 0, "C", false, 0, "")

	// bottom labels and values (Usage/Supply and Group Total)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightCardX+12, centerY+6)
	pdf.CellFormat((cardW/2.0)-12, 6, "Usage/Supply", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(rightCardX+12, centerY+14)
	pdf.CellFormat((cardW/2.0)-12, 8, service.formatLiters(report.GroupComparison.Consumption), "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(centerX, centerY+6)
	pdf.CellFormat((cardW/2.0)-12, 6, "Group Total", "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(centerX, centerY+14)
	pdf.CellFormat((cardW/2.0)-12, 8, service.formatLiters(report.GroupComparison.TotalConsumption), "", 0, "C", false, 0, "")

	// advance cursor below row
	sx, sy := pdf.GetX(), pdf.GetY()+30.0
	pdf.SetXY(sx, sy)
}

func (service *Service) drawSeriesTable(pdf *gofpdf.Fpdf, title string, s watermeter.Series, headerMap map[string]Header) {
	// page & margins
	pageW := 210.0
	leftMargin := 15.0
	rightMargin := 15.0
	bottomMargin := 15.0
	contentW := pageW - leftMargin - rightMargin

	// start position & title (left)
	x := leftMargin
	y := pdf.GetY() + 6.0
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetXY(x, y)
	pdf.CellFormat(contentW, 6, title, "", 1, "L", false, 0, "")
	y += 6.0

	type hdr struct {
		Key       string // header map key, e.g. "name"
		Display   string // header text to display, e.g. "Name"
		OrderIdx  int    // HeaderDef.Index used for ordering output
		SourceIdx int    // matched source column index in s.Columns (or -1 if not found)
	}
	headers := make([]hdr, 0, len(headerMap))
	for k, v := range headerMap {
		headers = append(headers, hdr{Key: k, Display: v.Text, OrderIdx: int(v.Index), SourceIdx: -1})
	}
	sort.Slice(headers, func(i, j int) bool { return headers[i].OrderIdx < headers[j].OrderIdx })

	colNameToIdx := map[string]int{}
	for i, c := range s.Columns {
		colNameToIdx[strings.ToLower(c.Text)] = i
	}

	// Fill SourceIdx for each header by matching key -> column.Text
	for i := range headers {
		lk := strings.ToLower(headers[i].Key)
		if idx, ok := colNameToIdx[lk]; ok {
			headers[i].SourceIdx = idx
		} else {
			// try matching header display text too (in case map key differs)
			lh := strings.ToLower(headers[i].Display)
			if idx, ok := colNameToIdx[lh]; ok {
				headers[i].SourceIdx = idx
			}
		}
		// if still -1, column will be empty
	}

	colCount := len(headers)
	if colCount == 0 {
		pdf.SetY(y + 4.0)
		return
	}

	// --- Build filteredRows directly from column-major s.Rows using headers' SourceIdx ---
	// find max rows among all source columns (some may be missing)
	maxRows := 0
	for _, col := range s.Rows {
		if len(col) > maxRows {
			maxRows = len(col)
		}
	}

	filteredRows := make([][]interface{}, maxRows)
	for r := 0; r < maxRows; r++ {
		fr := make([]interface{}, colCount)
		for ci := 0; ci < colCount; ci++ {
			srcIdx := headers[ci].SourceIdx
			if srcIdx >= 0 && srcIdx < len(s.Rows) && r < len(s.Rows[srcIdx]) {
				fr[ci] = s.Rows[srcIdx][r]
			} else {
				fr[ci] = nil
			}
		}
		filteredRows[r] = fr
	}

	// --- compute column widths (measure header + sample rows) ---
	pdf.SetFont("Helvetica", "B", 9)
	colWidths := make([]float64, colCount)
	for i := 0; i < colCount; i++ {
		colWidths[i] = pdf.GetStringWidth(headers[i].Display) + 8.0
	}
	pdf.SetFont("Helvetica", "", 9)
	sampleN := len(filteredRows)
	if sampleN > 5 {
		sampleN = 5
	}
	for r := 0; r < sampleN; r++ {
		for c := 0; c < colCount; c++ {
			cell := filteredRows[r][c]
			cellStr := fmt.Sprintf("%v", cell)
			w := pdf.GetStringWidth(cellStr) + 8.0
			if w > colWidths[c] {
				colWidths[c] = w
			}
		}
	}
	// fit to contentW
	var totalW float64
	for _, w := range colWidths {
		totalW += w
	}
	if totalW > contentW {
		scale := contentW / totalW
		for i := range colWidths {
			colWidths[i] *= scale
		}
	} else {
		remaining := contentW - totalW
		each := remaining / float64(colCount)
		for i := range colWidths {
			colWidths[i] += each
		}
	}

	headerH := 7.0
	pdf.SetFont("Helvetica", "B", 9)
	curX := x
	pdf.SetY(y)
	for i := 0; i < colCount; i++ {
		pdf.SetXY(curX, y)
		pdf.CellFormat(colWidths[i], headerH, headers[i].Display, "", 0, "C", false, 0, "")
		curX += colWidths[i]
	}
	sepY := y + headerH + 2.0
	pdf.SetDrawColor(220, 220, 220)
	pdf.SetLineWidth(0.4)
	pdf.Line(x, sepY, x+contentW, sepY)
	pdf.SetY(sepY + 4.0)

	formatCell := func(val interface{}, srcIdx int) string {
		if val == nil {
			return ""
		}
		ctext := ""
		if srcIdx >= 0 && srcIdx < len(s.Columns) {
			ctext = s.Columns[srcIdx].Text
		}
		if strings.EqualFold(ctext, "online") {
			online := "online"
			if v, ok := val.(float64); ok && v == 1 {
				online = "offline"
			}
			return online
		}
		if strings.EqualFold(ctext, "batteryvoltage") {
			if v, ok := val.(float64); ok {
				return fmt.Sprintf("%.2f V", v)
			}
		}
		if strings.EqualFold(ctext, "counter") {
			if v, ok := val.(float64); ok {
				return fmt.Sprintf("%d", int64(v))
			}
		}

		switch v := val.(type) {
		case float64:
			return fmt.Sprintf("%.2f", v)
		default:
			return fmt.Sprintf("%v", val)
		}
	}

	// --- render rows (no borders), MultiCell for wrapping, page breaks ---
	pdf.SetFont("Helvetica", "", 9)
	rowLineH := 5.0
	for ri := 0; ri < len(filteredRows); ri++ {
		// page-break check
		if pdf.GetY()+rowLineH+bottomMargin > 297.0 {
			pdf.AddPage()
			// redraw header
			pdf.SetFont("Helvetica", "B", 9)
			curX = leftMargin
			pdf.SetY(15.0)
			for i := 0; i < colCount; i++ {
				pdf.SetXY(curX, pdf.GetY())
				pdf.CellFormat(colWidths[i], headerH, headers[i].Display, "", 0, "C", false, 0, "")
				curX += colWidths[i]
			}
			sepY = pdf.GetY() + headerH + 2.0
			pdf.SetDrawColor(220, 220, 220)
			pdf.Line(x, sepY, x+contentW, sepY)
			pdf.SetY(sepY + 4.0)
			pdf.SetFont("Helvetica", "", 9)
		}

		startY := pdf.GetY()
		maxUsed := 0.0
		curX = x
		for ci := 0; ci < colCount; ci++ {
			srcIdx := headers[ci].SourceIdx
			val := filteredRows[ri][ci]
			cellText := formatCell(val, srcIdx)
			pdf.SetXY(curX, startY)
			beforeY := pdf.GetY()
			pdf.MultiCell(colWidths[ci], rowLineH, cellText, "", "C", false)
			afterY := pdf.GetY()
			used := afterY - beforeY
			if used > maxUsed {
				maxUsed = used
			}
			curX += colWidths[ci]
			pdf.SetXY(curX, startY)
		}
		if maxUsed < rowLineH {
			maxUsed = rowLineH
		}
		pdf.SetY(startY + maxUsed + 2.0)
	}

	sx, sy := pdf.GetX(), pdf.GetY()+6.0
	pdf.SetXY(sx, sy)
}
