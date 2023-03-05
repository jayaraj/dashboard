import { FixedCharge, FixedChargesState, FixedChargeState} from 'app/types';

export const getFixedChargeCount = (state: FixedChargesState) => state.fixedCharges.length;
export const getFixedCharge = (state: FixedChargeState, currentFixedChargeId: any): FixedCharge | null => {
  if (state.fixedCharge.id === parseInt(currentFixedChargeId, 10)) {
    return state.fixedCharge;
  }
  return null;
};

export const getFixedCharges = (state: FixedChargesState) => {
  return state.fixedCharges;
};
