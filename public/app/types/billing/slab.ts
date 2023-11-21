export const slabPageLimit = 50;
export interface Slab {
  id:         number;
  profile_id: number;
  tax:        number;
	slabs:      number;
  tag:        string;
	rates:      Rate[];
}

export interface CreateSlabDTO {
  tax:     number; 
  tag:    string;
  rates:   Rate[];
}

export interface UpdateSlabDTO {
  id:     number;
  tag:    string;
  tax:    number; 
  rates:  Rate[];
}

export interface Rate {
  id:           string
  from:         number;
	to:           number;
	final:        boolean;
	amount:       number;
	description:  string;
}

export interface SlabState {
  slab: Slab;
}

export interface SlabsState {
  slabs: Slab[];
  slabsCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}