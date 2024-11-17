import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import UserApiResponse from '../models/UserApiResponse';
import User from '../models/User';
import {ToastrService} from 'ngx-toastr';
import {WeatherResponse} from '../models/WeatherResponse';
import { map, tap} from 'rxjs';
import {Button} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {DividerModule} from 'primeng/divider';
import {ToastModule} from 'primeng/toast';
import {UserFromApi} from '../models/UserFromApi';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Button, CardModule, DividerModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'test app';
  // Http provider
  http = inject(HttpClient);
  // Users array implements from User interface
  users: User[] = [];

  // Constructor takes private toasterService
  constructor(private toaster: ToastrService) {
  }

  // Process on init component
  ngOnInit() {
    // First, get users and wait for it to complete
    this.getUsers()
  }

  // Request to API to get 10 users
  getUsers() {
    this.http.get<UserApiResponse>('https://randomuser.me/api/?results=10')
      // Pipe the observable and map the response to the users array
      .pipe(
        // Map the response to the users array
        map(response => response.results.map((user, index) => this.transformUser(user, index))),
        // Catch any errors and show a toast
        tap({
          error: () => this.toaster.error('Error fetching users', 'Error')
        })
      )
      // Subscribe to the observable and assign the users to the array and weather data
      .subscribe(users => {
        // Set users array
        this.users = users;
        // Get users weather data
        this.getUsersWeatherData();
      });
  }



  getUsersWeatherData() {
    // Iterate over users and set weather conditions
    this.users.map( user => {
      // Url with user data
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${user.location.coordinates.latitude}` +
        `&longitude=${user.location.coordinates.longitude}&current_weather=true&hourly=temperature_2m`;

      // Get weather data from the API
      this.http.get<WeatherResponse>(url)
        .pipe(
          // Set user weather data
          map(response => this.setUserWeather(user, response)),
          // Catch any errors and show a toast
          tap({
            error: () => this.toaster.error('Error fetching weather data', 'Error')
          })
        )
        .subscribe();
    })
  }

  // Transform user from API to User
  transformUser(userFromApi: UserFromApi, index: number): User {
    return {
      id: index,
      name: `${userFromApi.name.first} ${userFromApi.name.last}`,
      gender: userFromApi.gender,
      email: userFromApi.email,
      picture: userFromApi.picture,
      location: userFromApi.location,
      weather: undefined
    };
  }

  setUserWeather(user: User, response: WeatherResponse): void {
    user.weather = {
      weather_code: response.current_weather.weathercode,
      condition: {
        description: this.getWeatherDescription(response.current_weather.weathercode).description,
        icon: this.getWeatherDescription(response.current_weather.weathercode).icon,
      },
      current_temperature: response.current_weather.temperature,
      max_temperature: Math.max(...response.hourly.temperature_2m),
      min_temperature: Math.min(...response.hourly.temperature_2m),
    };
  }

  // Weather VMO code description and icons
  getWeatherDescription(weatherCode: number): { description: string, icon: string } {
    switch (weatherCode) {
      case 0: return { description: "Clear sky", icon: "fa-sun" };
      case 1: return { description: "Mostly clear", icon: "fa-cloud-sun" };
      case 2: return { description: "Partly cloudy", icon: "fa-cloud-sun" };
      case 3: return { description: "Cloudy", icon: "fa-cloud" };
      case 45: return { description: "Foggy", icon: "fa-smog" };
      case 48: return { description: "Depositing rime fog", icon: "fa-smog" };
      case 51: case 53: case 55: return { description: "Drizzle", icon: "fa-cloud-rain" };
      case 56: case 57: return { description: "Freezing drizzle", icon: "fa-snowflake" };
      case 61: case 63: case 65: return { description: "Rain", icon: "fa-cloud-showers-heavy" };
      case 66: case 67: return { description: "Freezing rain", icon: "fa-snowflake" };
      case 71: case 73: case 75: return { description: "Snow fall", icon: "fa-snowflake" };
      case 77: return { description: "Snow grains", icon: "fa-snowflake" };
      case 80: case 81: case 82: return { description: "Showers", icon: "fa-cloud-showers-heavy" };
      case 85: case 86: return { description: "Snow showers", icon: "fa-snowflake" };
      case 95: return { description: "Thunderstorms", icon: "fa-bolt" };
      case 96: case 99: return { description: "Thunderstorms with hail", icon: "fa-bolt" };
      default: return { description: "Unknown weather", icon: "fa-question" };
    }
  }
}
