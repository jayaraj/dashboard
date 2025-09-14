export const fixedChargesPageLimit = 50;

export interface FixedCharge {
  id: number;
  tax: number;
  profile: string;
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
  profile: string;
  tax: number;
  amount: number;
  description: string;
}
