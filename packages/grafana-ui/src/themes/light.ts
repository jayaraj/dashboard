import defaultTheme, { commonColorsPalette } from './default';
import { GrafanaThemeType, GrafanaTheme } from '@grafana/data';

const basicColors = {
  ...commonColorsPalette,
  black: '#000000',
  white: '#ffffff',
  dark1: '#1e2028',
  dark2: '#41444b',
  dark3: '#303133', // not used in light theme
  dark4: '#35373f', // not used in light theme
  dark5: '#41444b', // not used in light theme
  dark6: '#41444b', // not used in light theme
  dark7: '#41444b', // not used in light theme
  dark8: '#2f2f32', // not used in light theme
  dark9: '#343436', // not used in light theme
  dark10: '#424345', // not used in light theme
  gray1: '#52545c',
  gray2: '#767980',
  gray3: '#acb6bf',
  gray4: '#c7d0d9',
  gray5: '#dde4ed',
  gray6: '#e9edf2',
  gray7: '#f7f8fa',
  grayBlue: '#212327', // not used in light theme
  blueBase: '#3274d9',
  blueShade: '#1f60c4',
  blueLight: '#5794f2',
  blueFaint: '#f5f9ff',
  redBase: '#e02f44',
  redShade: '#c4162a',
  greenBase: '#3eb15b',
  greenShade: '#369b4f',
  blue: '#0083b3',
  red: '#d44939',
  yellow: '#ff851b',
  purple: '#9954bb',
  variable: '#007580',
  orange: '#ff7941',
  orangeDark: '#ed5700',
};

const lightTheme: GrafanaTheme = {
  ...defaultTheme,
  type: GrafanaThemeType.Light,
  isDark: false,
  isLight: true,
  name: 'Grafana Light',
  colors: {
    ...basicColors,
    variable: basicColors.blue,
    inputBlack: '#09090b',
    brandPrimary: basicColors.orange,
    brandSuccess: basicColors.greenBase,
    brandWarning: basicColors.orange,
    brandDanger: basicColors.redBase,
    queryRed: basicColors.redBase,
    queryGreen: basicColors.greenBase,
    queryPurple: basicColors.purple,
    queryKeyword: basicColors.blueBase,
    queryOrange: basicColors.orange,
    online: basicColors.greenShade,
    warn: '#f79520',
    critical: basicColors.redShade,

    // Backgrounds
    bodyBg: basicColors.gray7,
    pageBg: basicColors.white,
    pageHeaderBg: basicColors.gray95,
    panelBg: basicColors.white,

    // Text colors
    body: basicColors.gray1,
    text: basicColors.gray1,
    textStrong: basicColors.dark2,
    textWeak: basicColors.gray2,
    textEmphasis: basicColors.dark5,
    textFaint: basicColors.dark4,

    // Link colors
    link: basicColors.gray1,
    linkDisabled: basicColors.gray3,
    linkHover: basicColors.dark1,
    linkExternal: basicColors.blueLight,
    headingColor: basicColors.gray1,

    // Borders
    panelBorder: basicColors.gray95,
    pageHeaderBorder: basicColors.gray4,

    // Next-gen forms functional colors
    formLabel: basicColors.gray33,
    formDescription: basicColors.gray33,
    formLegend: basicColors.gray25,
    formInputBg: basicColors.white,
    formInputBgDisabled: basicColors.gray95,
    formInputBorder: basicColors.gray85,
    formInputBorderHover: basicColors.gray70,
    formInputBorderActive: basicColors.blue77,
    formInputBorderInvalid: basicColors.red88,
    formInputText: basicColors.gray25,
    formInputPlaceholderText: basicColors.gray70,
    formInputDisabledText: basicColors.gray33,
    formInputTextStrong: basicColors.gray25,
    formInputTextWhite: basicColors.white,
    formFocusOutline: basicColors.blueLight,
    formValidationMessageText: basicColors.white,
    formValidationMessageBg: basicColors.red88,
    formSwitchBg: basicColors.gray85,
    formSwitchBgActive: basicColors.blueShade,
    formSwitchBgHover: basicColors.gray3,
    formSwitchBgActiveHover: basicColors.blueBase,
    formSwitchBgDisabled: basicColors.gray4,
    formSwitchDot: basicColors.white,
    formCheckboxBg: basicColors.white,
    formCheckboxBgChecked: basicColors.blueShade,
    formCheckboxBgCheckedHover: basicColors.blueBase,
    formCheckboxCheckmark: basicColors.white,
  },
  background: {
    dropdown: basicColors.white,
    scrollbar: basicColors.gray5,
    scrollbar2: basicColors.gray5,
    pageHeader: `linear-gradient(90deg, ${basicColors.white}, ${basicColors.gray7})`,
  },
  shadow: {
    pageHeader: `inset 0px -3px 10px ${basicColors.gray6}`,
  },
};

export default lightTheme;
