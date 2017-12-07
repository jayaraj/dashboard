import React from 'react';
import { NavModel, NavModelItem } from '../../nav_model_srv';
import classNames from 'classnames';
import appEvents from 'app/core/app_events';

export interface IProps {
  model: NavModel;
}

function TabItem(tab: NavModelItem) {
  if (tab.hideFromTabs) {
    return (null);
  }

  let tabClasses = classNames({
    'gf-tabs-link': true,
    active: tab.active,
  });

  return (
    <li className="gf-tabs-item" key={tab.url}>
      <a className={tabClasses} href={tab.url}>
        <i className={tab.icon} />
        {tab.text}
      </a>
    </li>
  );
}

function SelectOption(navItem: NavModelItem) {
  if (navItem.hideFromTabs) { // TODO: Rename hideFromTabs => hideFromNav
    return (null);
  }

  return (
    <option key={navItem.url} value={navItem.url}>
      {navItem.text}
    </option>
  );
}

function Navigation({main}: {main: NavModelItem}) {
  return (<nav>
    <SelectNav customCss="page-header__select_nav" main={main} />
    <Tabs customCss="page-header__tabs" main={main} />
  </nav>);
}

function SelectNav({main, customCss}: {main: NavModelItem, customCss: string}) {
  const defaultSelectedItem = main.children.find(navItem => {
    return navItem.active === true;
  });

  const gotoUrl = evt => {
    var element = evt.target;
    var url = element.options[element.selectedIndex].value;
    appEvents.emit('location-change', {href: url});
  };

  return (<select
    className={`gf-select-nav ${customCss}`}
    defaultValue={defaultSelectedItem.url}
    onChange={gotoUrl}>{main.children.map(SelectOption)}</select>);
}

function Tabs({main, customCss}: {main: NavModelItem, customCss: string}) {
  return <ul className={`gf-tabs ${customCss}`}>{main.children.map(TabItem)}</ul>;
}

export default class PageHeader extends React.Component<IProps, any> {
  constructor(props) {
    super(props);
  }

  renderBreadcrumb(breadcrumbs) {
    const breadcrumbsResult = [];
    for (let i = 0; i < breadcrumbs.length; i++) {
      const bc = breadcrumbs[i];
      if (bc.uri) {
        breadcrumbsResult.push(<a className="text-link" key={i} href={bc.uri}>{bc.title}</a>);
      } else {
        breadcrumbsResult.push(<span key={i}> / {bc.title}</span>);
      }
    }
    return breadcrumbsResult;
  }

  renderHeaderTitle(main) {
    return (
      <div className="page-header__inner">
        <span className="page-header__logo">
          {main.icon && <i className={`page-header__icon ${main.icon}`} />}
          {main.img && <img className="page-header__img" src={main.img} />}
        </span>

        <div className="page-header__info-block">
          {main.text && <h1 className="page-header__title">{main.text}</h1>}
          {main.breadcrumbs && main.breadcrumbs.length > 0 && (
            <h1 className="page-header__title">
              {this.renderBreadcrumb(main.breadcrumbs)}
            </h1>)
          }
          {main.subTitle && <div className="page-header__sub-title">{main.subTitle}</div>}
          {main.subType && (
            <div className="page-header__stamps">
              <i className={main.subType.icon} />
              {main.subType.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="page-header-canvas">
        <div className="page-container">
          <div className="page-header">
            {this.renderHeaderTitle(this.props.model.main)}
            {this.props.model.main.children && <Navigation main={this.props.model.main} />}
          </div>
        </div>
      </div>
    );
  }
}
