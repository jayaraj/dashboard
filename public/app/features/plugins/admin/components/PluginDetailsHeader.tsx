import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Icon } from '@grafana/ui';

import { InstallControls } from './InstallControls';
import { usePluginDetails } from '../hooks/usePluginDetails';
import { PluginDetailsHeaderSignature } from './PluginDetailsHeaderSignature';
import { PluginLogo } from './PluginLogo';

type Props = {
  parentUrl: string;
  currentUrl: string;
  pluginId?: string;
};

export function PluginDetailsHeader({ pluginId, parentUrl, currentUrl }: Props): React.ReactElement | null {
  const styles = useStyles2(getStyles);
  const { state, dispatch } = usePluginDetails(pluginId!);
  const { plugin, pluginConfig, isInflight, hasUpdate, isInstalled, hasInstalledPanel } = state;

  if (!plugin) {
    return null;
  }

  return (
    <div className={styles.headerContainer}>
      <PluginLogo
        alt={`${plugin.name} logo`}
        src={plugin.info.logos.small}
        className={css`
          object-fit: contain;
          width: 100%;
          height: 68px;
          max-width: 68px;
        `}
      />

      <div className={styles.headerWrapper}>
        {/* Title & navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <a className={styles.textUnderline} href={parentUrl}>
                Plugins
              </a>
            </li>
            <li>
              <a href={currentUrl} aria-current="page">
                {plugin.name}
              </a>
            </li>
          </ol>
        </nav>

        <div className={styles.headerInformation}>
          {/* Org name */}
          <span>{plugin.orgName}</span>

          {/* Links */}
          {plugin.links.map((link: any) => (
            <a key={link.name} href={link.url}>
              {link.name}
            </a>
          ))}

          {/* Downloads */}
          {plugin.downloads > 0 && (
            <span>
              <Icon name="cloud-download" />
              {` ${new Intl.NumberFormat().format(plugin.downloads)}`}{' '}
            </span>
          )}

          {/* Latest version */}
          {plugin.version && <span>{plugin.version}</span>}

          {/* Signature information */}
          <PluginDetailsHeaderSignature installedPlugin={pluginConfig} />
        </div>

        <p>{plugin.description}</p>

        <InstallControls
          plugin={plugin}
          isInflight={isInflight}
          hasUpdate={hasUpdate}
          isInstalled={isInstalled}
          hasInstalledPanel={hasInstalledPanel}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    headerContainer: css`
      display: flex;
      margin-bottom: ${theme.spacing(3)};
      margin-top: ${theme.spacing(3)};
      min-height: 120px;
    `,
    headerWrapper: css`
      margin-left: ${theme.spacing(3)};
    `,
    breadcrumb: css`
      font-size: ${theme.typography.h2.fontSize};
      li {
        display: inline;
        list-style: none;
        &::after {
          content: '/';
          padding: 0 0.25ch;
        }
        &:last-child::after {
          content: '';
        }
      }
    `,
    headerInformation: css`
      display: flex;
      align-items: center;
      margin-top: ${theme.spacing()};
      margin-bottom: ${theme.spacing(3)};

      & > * {
        &::after {
          content: '|';
          padding: 0 ${theme.spacing()};
        }
        &:last-child::after {
          content: '';
          padding-right: 0;
        }
      }
      font-size: ${theme.typography.h4.fontSize};
    `,
    headerOrgName: css`
      font-size: ${theme.typography.h4.fontSize};
    `,
    signature: css`
      margin: ${theme.spacing(3)};
      margin-bottom: 0;
    `,
    textUnderline: css`
      text-decoration: underline;
    `,
  };
};
