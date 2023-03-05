import React, { PureComponent } from 'react';

import { DeleteButton, LinkButton, VerticalGroup} from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, FixedCharge, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { deleteFixedCharge, loadFixedCharges } from './state/actions';
import { getFixedChargeCount, getFixedCharges } from './state/selectors';

export interface Props {
  fixedCharges: FixedCharge[];
  fixedChargesCount: number;
  hasFetched: boolean;
  loadFixedCharges: typeof loadFixedCharges;
  deleteFixedCharge: typeof deleteFixedCharge;
  signedInUser: User;
}

export class FixedChargeList extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.fetchFixedCharges();
  }

  async fetchFixedCharges() {
    await this.props.loadFixedCharges();
  }

  deleteFixedCharge = (fixedCharge: FixedCharge) => {
    this.props.deleteFixedCharge(fixedCharge.id);
  };

  renderFixedCharge(fixedCharge: FixedCharge) {
    const { signedInUser } = this.props;
    const fixedChargeUrl = `org/fixedcharges/edit/${fixedCharge.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionFixedChargesRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionFixedChargesWrite, admin);

    return (
      <tr key={fixedCharge.id}>
        <td className="link-td">
          {canRead ? <a href={fixedChargeUrl}>{fixedCharge.amount}</a> : <>{fixedCharge.amount}</>}
        </td>
        <td className="link-td">
          {canRead ? <a href={fixedChargeUrl}>{fixedCharge.tax}</a> : <>{fixedCharge.tax}</>}
        </td>
        <td className="link-td">
          {canRead ? <a href={fixedChargeUrl}>{fixedCharge.description}</a> : <>{fixedCharge.description}</>}
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteFixedCharge(fixedCharge)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const admin = this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    return <EmptyListCTA 
    title="No Org charges are available."
    buttonIcon="fixed-charge" 
    buttonDisabled={!contextSrv.hasAccess(AccessControlAction.ActionFixedChargesWrite, admin)}
    buttonLink="/org/fixedcharges/new"
    buttonTitle=" New charge" />;
  }

  renderFixedChargeList() {
    const { fixedCharges,  signedInUser } = this.props;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionFixedChargesWrite, admin);
    const newFixedChargeHref = canWrite ? '/org/fixedcharges/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
          </div>
          <LinkButton href={newFixedChargeHref}  disabled={!canWrite}>
            New Charge
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Tax</th>
                  <th>Description</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{fixedCharges.map((fixedCharge) => this.renderFixedCharge(fixedCharge))}</tbody>
            </table>
          </VerticalGroup>
        </div>
      </>
    );
  }

  renderList() {
    const { fixedChargesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }
    if (fixedChargesCount > 0) {
      return this.renderFixedChargeList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched } = this.props;

    return (
      <Page navId="fixedcharges">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    fixedCharges: getFixedCharges(state.fixedCharges),
    hasFetched: state.fixedCharges.hasFetched,
    fixedChargesCount: getFixedChargeCount(state.fixedCharges),
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadFixedCharges,
  deleteFixedCharge,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.fixedCharges)(FixedChargeList);
