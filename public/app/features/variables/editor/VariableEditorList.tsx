import { css } from '@emotion/css';
import React, { ReactElement } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import { TypedVariableModel } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { reportInteraction } from '@grafana/runtime';
import { Button, useStyles2, Stack } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';

import { VariablesDependenciesButton } from '../inspect/VariablesDependenciesButton';
import { UsagesToNetwork, VariableUsageTree } from '../inspect/utils';
import { KeyedVariableIdentifier } from '../state/types';

import { VariableEditorListRow } from './VariableEditorListRow';

export interface Props {
  variables: TypedVariableModel[];
  usages: VariableUsageTree[];
  usagesNetwork: UsagesToNetwork[];
  onAdd: () => void;
  onEdit: (identifier: KeyedVariableIdentifier) => void;
  onChangeOrder: (identifier: KeyedVariableIdentifier, fromIndex: number, toIndex: number) => void;
  onDuplicate: (identifier: KeyedVariableIdentifier) => void;
  onDelete: (identifier: KeyedVariableIdentifier) => void;
}

export function VariableEditorList({
  variables,
  usages,
  usagesNetwork,
  onChangeOrder,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
}: Props): ReactElement {
  const styles = useStyles2(getStyles);
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !result.source) {
      return;
    }
    reportInteraction('Variable drag and drop');
    const identifier = JSON.parse(result.draggableId);
    onChangeOrder(identifier, variables[result.source.index].index, variables[result.destination.index].index);
  };

  return (
    <div>
      <div>
        {variables.length === 0 && <EmptyVariablesList onAdd={onAdd} />}

        {variables.length > 0 && (
          <Stack direction="column" gap={4}>
            <div className={styles.tableContainer}>
              <table
                className="filter-table filter-table--hover"
                aria-label={selectors.pages.Dashboard.Settings.Variables.List.table}
                role="grid"
              >
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Definition</th>
                    <th colSpan={5} />
                  </tr>
                </thead>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="variables-list" direction="vertical">
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {variables.map((variable, index) => (
                          <VariableEditorListRow
                            index={index}
                            key={`${variable.name}-${index}`}
                            variable={variable}
                            usageTree={usages}
                            usagesNetwork={usagesNetwork}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                            onEdit={onEdit}
                          />
                        ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </DragDropContext>
              </table>
            </div>
            <Stack>
              <VariablesDependenciesButton variables={variables} />
              <Button
                aria-label={selectors.pages.Dashboard.Settings.Variables.List.newButton}
                onClick={onAdd}
                icon="plus"
              >
                New variable
              </Button>
            </Stack>
          </Stack>
        )}
      </div>
    </div>
  );
}

function EmptyVariablesList({ onAdd }: { onAdd: () => void }): ReactElement {
  return (
    <div>
      <EmptyListCTA
        title="There are no variables yet"
        buttonIcon="calculator-alt"
        buttonTitle="Add variable"
        onClick={(event) => {
          event.preventDefault();
          onAdd();
        }}
      />
    </div>
  );
}

const getStyles = () => ({
  tableContainer: css`
    overflow: scroll;
    width: 100%;
  `,
});
