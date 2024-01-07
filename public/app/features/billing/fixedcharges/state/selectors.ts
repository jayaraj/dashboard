import { FixedCharge, FixedChargesState, FixedChargeState } from 'app/types/billing/fixedcharge';

export const getFixedChargesSearchQuery = (state: FixedChargesState) => state.searchQuery;
export const getFixedChargesSearchPage = (state: FixedChargesState) => state.searchPage;
export const getFixedChargesCount = (state: FixedChargesState) => state.fixedChargesCount;
export const getFixedCharges = (state: FixedChargesState) => state.fixedCharges;

export const getFixedCharge = (state: FixedChargeState, currentFixedChargeId: any): FixedCharge | null => {
  if (state.fixedCharge.id === parseInt(currentFixedChargeId, 10)) {
    return state.fixedCharge;
  }
  return null;
};
