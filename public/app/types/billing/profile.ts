
export const profilePageLimit = 50;

export interface Profile {
  id: number;
  updated_at: string;
  org_id: number;
  name: string;
  description: string;
}

export interface CreateProfileDTO {
  name: string;
  description: string;
}

export interface UpdateProfileDTO {
  name: string;
  description: string;
}

export interface ProfilesState {
  profiles: Profile[];
  profilesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface ProfileState {
  profile: Profile;
}
