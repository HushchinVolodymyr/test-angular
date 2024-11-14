import {Location, Picture} from './UserFromApi';

export default interface User {
  id: number;
  name: string;
  gender: string;
  email: string;
  picture: Picture;
  location: Location;
  weather?: Weather;
}

export interface Weather {
  weather_code: number;
  condition: Conditions;
  min_temperature: number;
  max_temperature: number;
  current_temperature: number;
}

export interface Conditions {
  description: string;
  icon: string;
}
