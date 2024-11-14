import {UserFromApi} from './UserFromApi';

export default interface UserApiResponse {
  results: UserFromApi[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}


