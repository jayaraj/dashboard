export const fixedChargesPageLimit = 50;

export interface FixedCharge {
  id: number;
  tax: number;
  amount: number;
  description: string;
}

export interface FixedChargesState {
  fixedCharges: FixedCharge[];
  fixedChargesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface FixedChargeState {
  fixedCharge: FixedCharge;
}

export interface FixedChargeDTO {
  tax: number;
  amount: number;
  description: string;
}
