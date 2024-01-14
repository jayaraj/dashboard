package fileloader

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"

	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/jayaraj/infra/serviceerrors"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"
	"github.com/pkg/errors"
)

func (service *Service) triggerCsvProcess(ctx context.Context, msg devicemanagement.TriggerCsvProcessMsg) (err error) {
	defer msg.PartFile.Close()
	records, err := service.getRecords(msg.PartFile)
	if err != nil {
		return err
	}
	createEntry := &resource.CreateCsvEntryMsg{
		Filename: msg.FileName,
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ResourcesTopic(resource.CreateCsvEntry), createEntry); err != nil {
		return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "create csv entry failed"))
	}

	for i, record := range records {
		event := &devicemanagement.ProcessObjectFromRecordEvent{
			CsvEntryId:   createEntry.Result.Id,
			OrgId:        msg.OrgId,
			Topic:        msg.Topic,
			RecordNumber: int64(i + 1),
			Record:       record,
		}

		if err := service.bus.Publish(ctx, event); err != nil {

			csvError := &resource.CreateCsvErrorMsg{
				CsvEntryId:    createEntry.Result.Id,
				Error:         err.Error(),
				Configuration: map[string]interface{}{"record": event.RecordNumber},
			}
			if err := service.devMgmt.RequestTopic(ctx, client.ResourcesTopic(resource.CreateCsvError), csvError); err != nil {
				return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "publish create csv error failed"))
			}
		}
	}
	updateEntry := &resource.UpdateInitiatedCsvRecordsMsg{
		Id:        createEntry.Result.Id,
		Initiated: int64(len(records)),
	}
	if err := service.devMgmt.RequestTopic(ctx, client.ResourcesTopic(resource.UpdateInitiatedCsvRecords), updateEntry); err != nil {
		return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "update initiated csv records failed"))
	}
	return nil
}

func (service *Service) getRecords(r io.Reader) ([]map[string]string, error) {
	reader := csv.NewReader(r)
	var header []string
	records := make([]map[string]string, 0)
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return records, serviceerrors.NewServiceError(serviceerrors.ErrExternalError, fmt.Errorf("reading csv file failed"))
		}
		if header == nil {
			header = record
		} else {
			dict := make(map[string]string)
			for i := range header {
				dict[header[i]] = record[i]
			}
			records = append(records, dict)
		}
	}
	return records, nil
}

func (service *Service) ProcessObjectFromRecord(ctx context.Context, msg *devicemanagement.ProcessObjectFromRecordEvent) error {
	switch msg.Topic {
	case resource.CreateGroups,
		resource.CreateResources,
		resource.CreateInventories:

		request := resource.ProcessFromCsvRecordMsg{
			CsvEntryId:   msg.CsvEntryId,
			OrgId:        msg.OrgId,
			RecordNumber: msg.RecordNumber,
			Record:       msg.Record,
		}
		body, err := json.Marshal(request)
		if err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "marshal process csv record failed"))
		}
		if err := service.devMgmt.Publish(ctx, client.ResourcesTopic(msg.Topic), body); err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrapf(err, "publish %s for processing csv record failed", msg.Topic))
		}
	default:
		return nil
	}
	return nil
}
