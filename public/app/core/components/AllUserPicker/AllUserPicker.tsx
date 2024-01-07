import { debounce, DebouncedFuncLeading, isNil } from 'lodash';
import React, { Component } from 'react';

import { SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { AsyncSelect } from '@grafana/ui';
import { User } from 'app/types';

export interface Props {
  onSelected: (user: SelectableValue<User['id']>) => void;
  className?: string;
  inputId?: string;
}

export interface State {
  isLoading: boolean;
}

export class AllUserPicker extends Component<Props, State> {
  debouncedSearch: DebouncedFuncLeading<typeof this.search>;

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
      .get(`/api/users/search?perpage=${100}&page=${1}&query=${query}`)
      .then((result: {users: User[];}) => {
        return result.users.map((user) => ({
          id: user.id,
          value: user.id,
          label: user.login,
          imgUrl: user.avatarUrl,
          login: user.login,
        }));
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  render() {
    const { className, onSelected, inputId } = this.props;
    const { isLoading } = this.state;

    return (
      <div className="user-picker" data-testid="userPicker">
        <AsyncSelect
          isClearable
          className={className}
          inputId={inputId}
          isLoading={isLoading}
          defaultOptions={true}
          loadOptions={this.debouncedSearch}
          onChange={onSelected}
          placeholder="Start typing to search for user"
          noOptionsMessage="No users found"
          aria-label="User picker"
        />
      </div>
    );
  }
}
