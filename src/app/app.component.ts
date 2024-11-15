import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import UserApiResponse from '../models/UserApiResponse';
import User from '../models/User';
import { ToastrService } from 'ngx-toastr';
import { WeatherResponse } from '../models/WeatherResponse';
import { firstValueFrom } from 'rxjs';
import {Button} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {DividerModule} from 'primeng/divider';
import {ToastModule} from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Button, CardModule, DividerModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'test app';
  // Http provider
  http = inject(HttpClient);
  // Users array implements from User interface
  users: User[] = [];

  // Constructor takes private toasterService
  constructor(private toaster: ToastrService) {}

  // Process on init component
  async ngOnInit(): Promise<void> {
    // First, get users and wait for it to complete
    await this.getUsers();
  }

  // Request to API to get 10 users
  async getUsers() {
    try {
      // Request to server
      const response = await firstValueFrom(this.http.get<UserApiResponse>('https://randomuser.me/api/?results=10'));

      // Delete users id they exist
      if (this.users) this.users = [];

      // Convert user data from server response
      response.results.map((api_user, index) => {
        // Create user object and fill with data
        let user: User = {
          id: index,
          name: api_user.name.title + ' ' + api_user.name.first + ' ' + api_user.name.last,
          gender: api_user.gender,
          email: api_user.email,
          picture: api_user.picture,
          location: api_user.location
        };

        // Push user to users array with formatted data
        this.users.push(user);
      });
    } catch (error: any) {
      this.toaster.error('Server error occurred while fetching users!', error);
      console.error(error);
    }

    // Take users weather
    await this.getUsersWeatherData();
  }

  // New comment

  // Get users weather data
  async getUsersWeatherData() {
    // Iterate over users and set weather conditions
    for (let user of this.users) {



      try {
        const url =`https://api.open-meteo.com/v1/forecast?latitude=${user.location.coordinates.latitude}` +
          `&longitude=${user.location.coordinates.longitude}&current_weather=true&hourly=temperature_2m`;

        // Send request to server and await response
        const response = await firstValueFrom(this.http.get<WeatherResponse>(url));

        // Format data and set to user
        if (!user.weather) {
          // If weather data does not exist, create and fill
          user.weather = {
            weather_code: response.current_weather.weathercode,
            condition: {
              description: this.getWeatherDescription(response.current_weather.weathercode).description,
              icon: this.getWeatherDescription(response.current_weather.weathercode).icon,
            } ,
            current_temperature: response.current_weather.temperature,
            max_temperature: Math.max(...response.hourly.temperature_2m),
            min_temperature: Math.min(...response.hourly.temperature_2m),
          };
        } else {
          // If weather data exists, update it
          user.weather.weather_code = response.current_weather.weathercode;
          user.weather.condition.description = this.getWeatherDescription(response.current_weather.weathercode).description.toString();
          user.weather.condition.icon = this.getWeatherDescription(response.current_weather.weathercode).icon.toString();
          user.weather.current_temperature = response.current_weather.temperature;
          user.weather.max_temperature = Math.max(...response.hourly.temperature_2m);
          user.weather.min_temperature = Math.min(...response.hourly.temperature_2m);
        }
      } catch (error: any) {
        this.toaster.error('Server error occurred while fetching weather data!', error);
        console.error(error);
      }
    }

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
