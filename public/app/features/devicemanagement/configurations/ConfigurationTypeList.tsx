import { css } from '@emotion/css';
import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  CellProps,
  DeleteButton,
  LinkButton,
  FilterInput,
  InlineField,
  Pagination,
  useStyles2,
  Stack,
  Tooltip,
  Icon,
  InteractiveTable,
  Select,
  Checkbox,
} from '@grafana/ui';
import { Configuration } from 'app/core/components/CustomForm/types';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { OrgRole, StoreState } from 'app/types';
import {
  ConfigurationType,
  configurationTypesPageLimit,
  associationTypes,
} from 'app/types/devicemanagement/configuration';

import {
  changeConfigurationTypesPage,
  changeConfigurationTypesQuery,
  deleteConfigurationType,
  loadConfigurationTypes,
} from './state/actions';
import {
  getSearchQuery,
  getConfigurationTypes,
  getConfigurationTypesCount,
  getConfigurationTypeSearchPage,
} from './state/selectors';

type Cell<T extends keyof ConfigurationType = keyof ConfigurationType> = CellProps<
  ConfigurationType,
  ConfigurationType[T]
>;
export interface OwnProps {}
const skeletonData: ConfigurationType[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  associated_with: '',
  type: '',
  measurement: false,
  role: OrgRole.None,
  configuration: {} as Configuration,
}));

export const ConfigurationTypeList = ({
  configurationTypes,
  configurationTypesCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadConfigurationTypes,
  deleteConfigurationType,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('configurations:create');
  const totalPages = Math.ceil(configurationTypesCount / configurationTypesPageLimit);
  const [noConfigurationTypes, setNoConfigurationTypes] = useState<boolean>(true);

  useEffect(() => {
    loadConfigurationTypes();
  }, [loadConfigurationTypes]);

  useEffect(() => {
    if (configurationTypes.length !== 0 && noConfigurationTypes) {
      setNoConfigurationTypes(false);
    }
  }, [configurationTypes]);

  const columns: Array<Column<ConfigurationType>> = useMemo(
    () => [
      {
        id: 'type',
        header: 'Type',
        cell: ({ cell: { value } }: Cell<'type'>) => {
          if (!hasFetched) {
            return <Skeleton width={50} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'associated_with',
        header: 'Configuration Of',
        cell: ({ cell: { value } }: Cell<'associated_with'>) => {
          if (!hasFetched) {
            return <Skeleton width={30} height={32} containerClassName={styles.blockSkeleton} />;
          }
          return <Select value={value} options={associationTypes} disabled={true} onChange={() => {}} />;
        },
      },
      {
        id: 'role',
        header: 'Role',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'role'>) => {
          if (!hasFetched) {
            return <Skeleton width={50} />;
          }
          return value;
        },
      },
      {
        id: 'measurement',
        header: 'Measurement',
        cell: ({ cell: { value } }: Cell<'measurement'>) => {
          if (!hasFetched) {
            return <Skeleton width={30} height={32} containerClassName={styles.blockSkeleton} />;
          }
          return <Checkbox value={value} />;
        },
      },
      {
        id: 'actions',
        header: '',
        disableGrow: true,
        cell: ({ row: { original } }: Cell) => {
          if (!hasFetched) {
            return (
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Skeleton containerClassName={styles.blockSkeleton} width={16} height={16} />
                <Skeleton containerClassName={styles.blockSkeleton} width={22} height={24} />
              </Stack>
            );
          }
          const configurationtypeUrl = `configurationtypes/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('configurations:read');
          const canDelete = contextSrv.hasPermission('configurations:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.type}`}>
                  <a href={configurationtypeUrl} aria-label={`Edit ${original.type}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.type}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteConfigurationType(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteConfigurationType, styles]
  );

  return (
    <Page.Contents isLoading={!hasFetched}>
      {noConfigurationTypes ? (
        <EmptyListCTA
          title={`No configuration types are available.`}
          buttonIcon="resource-type"
          buttonLink="configurationtypes/new"
          buttonTitle={`New Configuration Type`}
          buttonDisabled={!canCreate}
        />
      ) : (
        <>
          <div className="page-action-bar">
            <InlineField grow>
              <FilterInput placeholder={`Search configuration types`} value={searchQuery} onChange={changeQuery} />
            </InlineField>
            <LinkButton href={canCreate ? 'configurationtypes/new' : '#'} disabled={!canCreate}>
              {`New Configuration Type`}
            </LinkButton>
          </div>
          <Stack direction={'column'} gap={2}>
            <InteractiveTable
              columns={columns}
              data={hasFetched ? configurationTypes : skeletonData}
              getRowId={(configurationType) => String(configurationType.id)}
            />
            <Stack justifyContent="flex-end">
              <Pagination
                hideWhenSinglePage
                currentPage={searchPage}
                numberOfPages={totalPages}
                onNavigate={changePage}
              />
            </Stack>
          </Stack>
        </>
      )}
    </Page.Contents>
  );
};

function mapStateToProps(state: StoreState) {
  return {
    configurationTypes: getConfigurationTypes(state.configurationTypes),
    searchQuery: getSearchQuery(state.configurationTypes),
    searchPage: getConfigurationTypeSearchPage(state.configurationTypes),
    configurationTypesCount: getConfigurationTypesCount(state.configurationTypes),
    hasFetched: state.configurationTypes.hasFetched,
  };
}

const mapDispatchToProps = {
  loadConfigurationTypes,
  deleteConfigurationType,
  changeQuery: changeConfigurationTypesQuery,
  changePage: changeConfigurationTypesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(ConfigurationTypeList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
});
