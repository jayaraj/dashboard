import React from "react";

import { locationService } from '@grafana/runtime';
import { Themeable, withTheme } from '@grafana/ui';

import { getStyles, RuntimeVariableOption } from "./types";

type Props = {
  data: RuntimeVariableOption[];
  heading: string;
  isMulti: boolean;
} & Themeable;

interface State {
  List: RuntimeVariableOption[],
  MasterChecked: boolean,
  SelectedList: RuntimeVariableOption[],
}

class SelectTableComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { data } = props
    this.state = {
      List: [...data],
      MasterChecked: false,
      SelectedList: [],
    };
  }

  onMasterCheck(e: { target: { checked: any; }; }) {
    let tempList = this.state.List;
    tempList.map((data) => (data.selected = e.target.checked));
    this.setState({
      MasterChecked: e.target.checked,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  onItemCheck(e: { target: { checked: any; }; }, item: RuntimeVariableOption) {
    let tempList = this.state.List;
    tempList.map((data) => {
      if (data.id === item.id) {
        data.selected = e.target.checked;
      }
      return data;
    });

    const searchParams = locationService.getSearch().getAll(`var-${this.props.heading}`)
    if (e.target.checked) {
      locationService.partial({ [`var-${this.props.heading}`]: [...searchParams, item.value] }, true);
    } else {
      locationService.partial({[`var-${this.props.heading}`]: searchParams.filter((sp) => sp !== item.value)},true);
    }
    
    const totalItems = this.state.List.length;
    const totalCheckedItems = tempList.filter((e) => e.selected).length;

    this.setState({
      MasterChecked: totalItems === totalCheckedItems,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });

  }

  onTextSelected(e: any, item: RuntimeVariableOption) {
    let tempList = this.state.List;
    tempList.map((data) => {
      if (data.id === item.id) {
        data.selected = true;
      } else {
        data.selected = false;
      }
      return data;
    });

    locationService.partial({ [`var-${this.props.heading}`]: item.value }, true);

    this.setState({
      MasterChecked: false,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  getSelectedRows() {
    this.setState({
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  render() {
    const { theme, isMulti } = this.props
    const styles = getStyles(300, theme);
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <table className={styles.table}>
              <thead>
                <tr>
                {isMulti && 
                  <th scope="col">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={this.state.MasterChecked}
                      id="mastercheck"
                      onChange={(e) => this.onMasterCheck(e)}
                    />
                  </th>
                }
                  <th scope="col">Select All</th>
                </tr>
              </thead>
              <tbody>
                {this.state.List.map((data) => (
                  <tr key={data.id} className={data.selected ? "selected" : ""}>
                    {isMulti && 
                    <td scope="row">
                      <input
                        type="checkbox"
                        checked={data.selected}
                        className="form-check-input"
                        id="rowcheck{data.id}"
                        onChange={(e) => this.onItemCheck(e, data)}
                      />
                    </td>
                    }
                    <td onClick={(e) => this.onTextSelected(e, data)}>{data.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default withTheme(SelectTableComponent);
