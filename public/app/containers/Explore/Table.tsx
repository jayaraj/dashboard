import React, { PureComponent } from 'react';
import TableModel from 'app/core/table_model';

const EMPTY_TABLE = new TableModel();

interface TableProps {
  className?: string;
  data: TableModel;
  onClickCell?: (columnKey: string, rowValue: string) => void;
}

interface SFCCellProps {
  columnIndex: number;
  onClickCell?: (columnKey: string, rowValue: string, columnIndex: number, rowIndex: number, table: TableModel) => void;
  rowIndex: number;
  table: TableModel;
  value: string;
}

function Cell(props: SFCCellProps) {
  const { columnIndex, rowIndex, table, value, onClickCell } = props;
  const column = table.columns[columnIndex];
  if (column && column.filterable && onClickCell) {
    const onClick = event => {
      event.preventDefault();
      onClickCell(column.text, value, columnIndex, rowIndex, table);
    };
    return (
      <td>
        <a className="link" onClick={onClick}>
          {value}
        </a>
      </td>
    );
  }
  return <td>{value}</td>;
}

export default class Table extends PureComponent<TableProps, {}> {
  render() {
    const { className = '', data, onClickCell } = this.props;
    const tableModel = data || EMPTY_TABLE;
    return (
      <table className={`${className} filter-table`}>
        <thead>
          <tr>{tableModel.columns.map(col => <th key={col.text}>{col.text}</th>)}</tr>
        </thead>
        <tbody>
          {tableModel.rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <Cell key={j} columnIndex={j} rowIndex={i} value={value} table={data} onClickCell={onClickCell} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
