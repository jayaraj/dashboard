import {
  ConfigurationType,
  ConfigurationTypesState,
  ConfigurationTypeState,
  OrgConfigurationState,
} from 'app/types/devicemanagement/configuration';

export const getSearchQuery = (state: ConfigurationTypesState) => state.searchQuery;
export const getConfigurationTypeSearchPage = (state: ConfigurationTypesState) => state.searchPage;
export const getConfigurationTypesCount = (state: ConfigurationTypesState) => state.configurationTypesCount;
export const getConfigurationTypes = (state: ConfigurationTypesState) => state.configurationTypes;
export const getOrgConfiguration = (state: OrgConfigurationState) => state.configuration;

export const getConfigurationType = (
  state: ConfigurationTypeState,
  currentConfigurationTypeId: any
): ConfigurationType | null => {
  if (state.configurationType.id === parseInt(currentConfigurationTypeId, 10)) {
    return state.configurationType;
  }
  return null;
};
