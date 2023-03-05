export interface Slab {
  id: number;
  type: string;
  tax: number;
	slabs: number;
	rates:    Rate[];
}

export interface Rate {
  id: string
  from: number;
	to: number;
	final: boolean;
	amount: number;
	description: string;
}

export interface SlabState {
  slab: Slab;
}
