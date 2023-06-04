export const fixedChargePageLimit = 1000

export interface FixedCharge {
  id: number;
  tax: number;
  amount: number;
  description: string;
}

export interface FixedChargesState {
  fixedCharges: FixedCharge[];
  hasFetched: boolean;
}

export interface FixedChargeState {
  fixedCharge: FixedCharge;
}
