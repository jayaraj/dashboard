export interface Slab {
  id:         number;
  profile_id: number;
  tax:        number;
	slabs:      number;
	rates:      Rate[];
}

export interface CreateSlabDTO {
  tax:     number; 
  rates:   Rate[];
}

export interface UpdateSlabDTO {
  id:     number;
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
