import { ConfigurationType, ConfigurationTypesState, ConfigurationTypeState} from 'app/types';

export const getSearchQuery = (state: ConfigurationTypesState) => state.searchQuery;
export const getConfigurationTypeSearchPage = (state: ConfigurationTypesState) => state.searchPage;
export const getConfigurationTypesCount = (state: ConfigurationTypesState) => state.configurationTypesCount;

export const getConfigurationType = (state: ConfigurationTypeState, currentConfigurationTypeId: any): ConfigurationType | null => {
  if (state.configurationType.id === parseInt(currentConfigurationTypeId, 10)) {
    return state.configurationType;
  }
  return null;
};

export const getConfigurationTypeByAssociationAndType = (state: ConfigurationTypeState, association: string, type: string): ConfigurationType | null => {
  if (state.configurationType.associated_with === association && state.configurationType.type === type) {
    return state.configurationType;
  }
  return null;
};

export const getConfigurationTypes = (state: ConfigurationTypesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.configurationTypes.filter((configurationType) => {
    return regex.test(configurationType.type);
  });
};
