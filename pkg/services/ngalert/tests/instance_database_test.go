// +build integration

package tests

import (
	"testing"
	"time"

	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/store"

	"github.com/stretchr/testify/require"
)

const baseIntervalSeconds = 10

func mockTimeNow() {
	var timeSeed int64
	store.TimeNow = func() time.Time {
		fakeNow := time.Unix(timeSeed, 0).UTC()
		timeSeed++
		return fakeNow
	}
}

func TestAlertInstanceOperations(t *testing.T) {
	dbstore := setupTestEnv(t, baseIntervalSeconds)
	t.Cleanup(registry.ClearOverrides)

	alertRule1 := createTestAlertRule(t, dbstore, 60)
	orgID := alertRule1.OrgID

	alertRule2 := createTestAlertRule(t, dbstore, 60)
	require.Equal(t, orgID, alertRule2.OrgID)

	alertRule3 := createTestAlertRule(t, dbstore, 60)
	require.Equal(t, orgID, alertRule3.OrgID)

	alertRule4 := createTestAlertRule(t, dbstore, 60)
	require.Equal(t, orgID, alertRule4.OrgID)

	t.Run("can save and read new alert instance", func(t *testing.T) {
		saveCmd := &models.SaveAlertInstanceCommand{
			DefinitionOrgID: alertRule1.OrgID,
			DefinitionUID:   alertRule1.UID,
			State:           models.InstanceStateFiring,
			Labels:          models.InstanceLabels{"test": "testValue"},
		}
		err := dbstore.SaveAlertInstance(saveCmd)
		require.NoError(t, err)

		getCmd := &models.GetAlertInstanceQuery{
			DefinitionOrgID: saveCmd.DefinitionOrgID,
			DefinitionUID:   saveCmd.DefinitionUID,
			Labels:          models.InstanceLabels{"test": "testValue"},
		}

		err = dbstore.GetAlertInstance(getCmd)
		require.NoError(t, err)

		require.Equal(t, saveCmd.Labels, getCmd.Result.Labels)
		require.Equal(t, alertRule1.OrgID, getCmd.Result.RuleOrgID)
		require.Equal(t, alertRule1.UID, getCmd.Result.RuleUID)
	})

	t.Run("can save and read new alert instance with no labels", func(t *testing.T) {
		saveCmd := &models.SaveAlertInstanceCommand{
			DefinitionOrgID: alertRule2.OrgID,
			DefinitionUID:   alertRule2.UID,
			State:           models.InstanceStateNormal,
			Labels:          models.InstanceLabels{},
		}
		err := dbstore.SaveAlertInstance(saveCmd)
		require.NoError(t, err)

		getCmd := &models.GetAlertInstanceQuery{
			DefinitionOrgID: saveCmd.DefinitionOrgID,
			DefinitionUID:   saveCmd.DefinitionUID,
		}

		err = dbstore.GetAlertInstance(getCmd)
		require.NoError(t, err)

		require.Equal(t, alertRule2.OrgID, getCmd.Result.RuleOrgID)
		require.Equal(t, alertRule2.UID, getCmd.Result.RuleUID)
		require.Equal(t, saveCmd.Labels, getCmd.Result.Labels)
	})

	t.Run("can save two instances with same org_id, uid and different labels", func(t *testing.T) {
		saveCmdOne := &models.SaveAlertInstanceCommand{
			DefinitionOrgID: alertRule3.OrgID,
			DefinitionUID:   alertRule3.UID,
			State:           models.InstanceStateFiring,
			Labels:          models.InstanceLabels{"test": "testValue"},
		}

		err := dbstore.SaveAlertInstance(saveCmdOne)
		require.NoError(t, err)

		saveCmdTwo := &models.SaveAlertInstanceCommand{
			DefinitionOrgID: saveCmdOne.DefinitionOrgID,
			DefinitionUID:   saveCmdOne.DefinitionUID,
			State:           models.InstanceStateFiring,
			Labels:          models.InstanceLabels{"test": "meow"},
		}
		err = dbstore.SaveAlertInstance(saveCmdTwo)
		require.NoError(t, err)

		listQuery := &models.ListAlertInstancesQuery{
			DefinitionOrgID: saveCmdOne.DefinitionOrgID,
			DefinitionUID:   saveCmdOne.DefinitionUID,
		}

		err = dbstore.ListAlertInstances(listQuery)
		require.NoError(t, err)

		require.Len(t, listQuery.Result, 2)
	})

	t.Run("can list all added instances in org", func(t *testing.T) {
		listQuery := &models.ListAlertInstancesQuery{
			DefinitionOrgID: orgID,
		}

		err := dbstore.ListAlertInstances(listQuery)
		require.NoError(t, err)

		require.Len(t, listQuery.Result, 4)
	})

	t.Run("can list all added instances in org filtered by current state", func(t *testing.T) {
		listQuery := &models.ListAlertInstancesQuery{
			DefinitionOrgID: orgID,
			State:           models.InstanceStateNormal,
		}

		err := dbstore.ListAlertInstances(listQuery)
		require.NoError(t, err)

		require.Len(t, listQuery.Result, 1)
	})

	t.Run("update instance with same org_id, uid and different labels", func(t *testing.T) {
		saveCmdOne := &models.SaveAlertInstanceCommand{
			DefinitionOrgID: alertRule4.OrgID,
			DefinitionUID:   alertRule4.UID,
			State:           models.InstanceStateFiring,
			Labels:          models.InstanceLabels{"test": "testValue"},
		}

		err := dbstore.SaveAlertInstance(saveCmdOne)
		require.NoError(t, err)

		saveCmdTwo := &models.SaveAlertInstanceCommand{
			DefinitionOrgID: saveCmdOne.DefinitionOrgID,
			DefinitionUID:   saveCmdOne.DefinitionUID,
			State:           models.InstanceStateNormal,
			Labels:          models.InstanceLabels{"test": "testValue"},
		}
		err = dbstore.SaveAlertInstance(saveCmdTwo)
		require.NoError(t, err)

		listQuery := &models.ListAlertInstancesQuery{
			DefinitionOrgID: alertRule4.OrgID,
			DefinitionUID:   alertRule4.UID,
		}

		err = dbstore.ListAlertInstances(listQuery)
		require.NoError(t, err)

		require.Len(t, listQuery.Result, 1)

		require.Equal(t, saveCmdTwo.DefinitionOrgID, listQuery.Result[0].RuleOrgID)
		require.Equal(t, saveCmdTwo.DefinitionUID, listQuery.Result[0].RuleDefinitionUID)
		require.Equal(t, saveCmdTwo.Labels, listQuery.Result[0].Labels)
		require.Equal(t, saveCmdTwo.State, listQuery.Result[0].CurrentState)
	})
}
