// Libraries
import React, { FunctionComponent } from 'react';

interface Props {
  title?: string;
  onClose?: () => void;
  children: JSX.Element | JSX.Element[] | boolean;
  onAdd?: () => void;
}

export const PanelOptionsGroup: FunctionComponent<Props> = props => {
  return (
    <div className="panel-options-group">
      {props.onAdd ? (
        <div className="panel-options-group__header" style={{ cursor: 'pointer' }} onClick={props.onAdd}>
          <div className="panel-options-group__add">
            <i className="fa fa-plus" />
          </div>
          <span className="panel-options-group__title">{props.title}</span>
        </div>
      ) : (
        props.title && (
          <div className="panel-options-group__header">
            {props.title}
            {props.onClose && (
              <button className="btn btn-link" onClick={props.onClose}>
                <i className="fa fa-remove" />
              </button>
            )}
          </div>
        )
      )}
      {props.children && <div className="panel-options-group__body">{props.children}</div>}
    </div>
  );
};
