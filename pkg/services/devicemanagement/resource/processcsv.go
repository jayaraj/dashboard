package resource

import (
	"context"
	"encoding/csv"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Knetic/govaluate"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/jayaraj/infra/serviceerrors"
	"github.com/jayaraj/messages/client"
	"github.com/pkg/errors"
)

func (service *Service) sanitize(header string) string {
	reParens := regexp.MustCompile(`\s*$begin:math:text$.*?$end:math:text$`)
	header = reParens.ReplaceAllString(header, "")

	reNonWord := regexp.MustCompile(`[^\w\s]`)
	header = reNonWord.ReplaceAllString(header, "")

	header = strings.TrimSpace(header)
	header = strings.ReplaceAll(header, " ", "_")

	return header
}

func (service *Service) sanitizeHeaders(headers []string) []string {
	sanitized := make([]string, len(headers))
	for i, h := range headers {
		sanitized[i] = service.sanitize(h)
	}
	return sanitized
}

func cleanExpression(expr string) string {
	re := regexp.MustCompile(`{{\s*([^}]+)\s*}}`)
	return re.ReplaceAllString(expr, "$1")
}

func (service *Service) evaluateExpression(expr string, variables map[string]interface{}) (interface{}, error) {
	for k, v := range variables {
		if str, ok := v.(string); ok {
			if f, err := service.parseToFloat(str); err == nil {
				variables[k] = f
			}
		}
	}

	evaluableExpression, err := govaluate.NewEvaluableExpression(expr)
	if err != nil {
		return nil, err
	}
	return evaluableExpression.Evaluate(variables)
}

func (service *Service) parseToFloat(val interface{}) (float64, error) {
	switch v := val.(type) {
	case float64:
		return v, nil
	case float32:
		return float64(v), nil
	case string:
		return strconv.ParseFloat(v, 64)
	case int:
		return float64(v), nil
	case int64:
		return float64(v), nil
	default:
		return 0, fmt.Errorf("cannot convert %v to float", val)
	}
}

func (service *Service) processCsv(ctx context.Context, msg devicemanagement.UpdateResourceDataMsg) (err error) {
	defer msg.File.Close()
	reader := csv.NewReader(msg.File)

	headers, err := reader.Read()
	if err != nil {
		return errors.Wrapf(err, "error reading CSV headers")
	}

	sanitizedHeaders := service.sanitizeHeaders(headers)
	if len(headers) == 0 {
		return errors.New("CSV file contains no headers")
	}

	mappedVariables := make(map[string]int)
	for i, h := range sanitizedHeaders {
		for k, v := range msg.Mapping {
			if strings.Contains(v, h) {
				mappedVariables[k] = i
			}
		}
	}
	if _, ok := mappedVariables["time"]; !ok {
		return serviceerrors.NewServiceError(serviceerrors.ErrInvalidRequest, errors.New("time not found"))
	}
	if _, ok := mappedVariables["uuid"]; !ok {
		return serviceerrors.NewServiceError(serviceerrors.ErrInvalidRequest, errors.New("uuid not found"))
	}

	for {
		record, err := reader.Read()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return errors.Wrapf(err, "error reading CSV reacord")
		}

		if len(record) != len(sanitizedHeaders) {
			service.log.Error("header and record length mismatch")
			continue
		}

		varContext := make(map[string]interface{})
		for i, h := range sanitizedHeaders {
			val := strings.TrimSpace(record[i])
			varContext[h] = val
		}

		uuidExpr := cleanExpression(msg.Mapping["uuid"])
		uuidEvaluated, err := service.evaluateExpression(uuidExpr, varContext)
		if err != nil {
			service.log.Error("UUID eval error", "err", err)
			continue
		}
		uuidStr := fmt.Sprintf("%v", uuidEvaluated)

		timeExpr := cleanExpression(msg.Mapping["time"])
		timeEvaluated, err := service.evaluateExpression(timeExpr, varContext)
		if err != nil {
			service.log.Error("Time eval error", "err", err)
			continue
		}
		timeStr := fmt.Sprintf("%v", timeEvaluated)

		location := time.UTC
		if timezone, ok := msg.Mapping["timezone"]; ok && timezone != "" {
			location, err = time.LoadLocation(timezone)
			if err != nil {
				location = time.UTC
			}
		}
		timeFormats := []string{
			"2006-01-02 15:04:05",     // "2026-03-31 18:36:00"
			"2006-01-02T15:04:05",     // ISO 8601 without timezone
			"2006-01-02T15:04:05.999", // ISO 8601 with milliseconds, no timezone
			time.RFC3339,              // "2006-01-02T15:04:05Z07:00"
			"2006-01-02",              // Date only
			"15:04:05",                // Time only
			"02/01/06 15:04",          // "31/03/26 18:36"
			"02/01/2006 15:04",        // "31/03/2026 18:36"
			"02/01/06 15:04:05",       // "31/03/26 18:36:00"
			"02/01/2006 15:04:05",     // "31/03/2026 18:36:00"
			"01/02/06 15:04",          // "03/31/26 18:36" (US format)
			"01/02/2006 15:04",        // "03/31/2026 18:36" (US format)
			"01/02/06 15:04:05",       // "03/31/26 18:36:00" (US format)
			"01/02/2006 15:04:05",     // "03/31/2026 18:36:00" (US format)
			"02-Jan-2006 15:04:05",    // "31-Mar-2026 18:36:00"
			"02-Jan-2006 15:04",       // "31-Mar-2026 18:36"
			"Jan 02, 2006 15:04:05",   // "Mar 31, 2026 18:36:00"
			"Jan 02, 2006 15:04",      // "Mar 31, 2026 18:36"
			"2006-01-02 15:04",        // "2026-03-31 18:36"
		}
		var parsedTime time.Time
		parsed := false
		for _, format := range timeFormats {
			parsedTime, err = time.ParseInLocation(format, timeStr, location)
			if err == nil {
				parsed = true
				break
			}
		}
		if !parsed {
			service.log.Error("time parsing failed: no matching format", "time", timeStr)
			continue
		}

		data := make(map[string]float64)
		for k, expr := range msg.Mapping {
			if k == "uuid" || k == "time" || k == "timezone" {
				continue
			}
			cleaned := cleanExpression(expr)
			if cleaned == "" {
				continue
			}
			result, err := service.evaluateExpression(cleaned, varContext)
			if err != nil {
				service.log.Warn("Skipping data field", "field", k, "error", err)
				continue
			}
			floatVal, err := service.parseToFloat(result)
			if err != nil {
				service.log.Warn("Failed converting to float", "field", k, "value", result)
				continue
			}
			data[k] = floatVal
		}

		dto := client.HistoricalDataMsg{
			User: msg.User,
			UUID: uuidStr,
			Time: parsedTime,
			Data: data,
		}
		if err := service.devMgmt.RequestTopic(ctx, client.WriterTopic(client.HistoryData), dto); err != nil {
			service.log.Error("failed to write", "payload", dto, "err", err.Error())
			continue
		}
	}
	return nil
}
