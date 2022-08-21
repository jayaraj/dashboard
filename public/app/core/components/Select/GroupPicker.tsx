import { debounce, isNil } from 'lodash';
import React, { Component } from 'react';

import { SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { AsyncSelect } from '@grafana/ui';
import { Group } from 'app/types';

export interface Props {
  resourceId: number;
  onSelected: (group: SelectableValue<Group['id']>) => void;
  className?: string;
  inputId?: string;
}

export interface State {
  isLoading: boolean;
}

export class GroupPicker extends Component<Props, State> {
  debouncedSearch: any;

  constructor(props: Props) {
    super(props);
    this.state = { isLoading: false };
    this.search = this.search.bind(this);

    this.debouncedSearch = debounce(this.search, 300, {
      leading: true,
      trailing: true,
    });
  }

  search(query?: string) {
    this.setState({ isLoading: true });

    if (isNil(query)) {
      query = '';
    }

    return getBackendSrv()
      .get(`/api/resources/${this.props.resourceId}/groups/leafs?query=${query}`)
      .then((result: { groups: Group[] }) => {
        const groups: Array<SelectableValue<Group>> = result.groups.map((group) => {
          return {
            value: group,
            label: group.path,
          };
        });
        this.setState({ isLoading: false });
        return groups;
      });
  }

  render() {
    const { className, onSelected, inputId } = this.props;
    const { isLoading } = this.state;

    return (
      <div className="group-picker" data-testid="groupPicker">
        <AsyncSelect
          isClearable
          className={className}
          inputId={inputId}
          isLoading={isLoading}
          defaultOptions={true}
          loadOptions={this.debouncedSearch}
          onChange={onSelected}
          placeholder="Select a group"
          noOptionsMessage="No groups found"
          aria-label="Group picker"
        />
      </div>
    );
  }
}
