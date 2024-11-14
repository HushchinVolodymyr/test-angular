export interface WeatherResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_weather_units: CurrentWeatherUnits
  current_weather: CurrentWeather
  hourly_units: HourlyUnits
  hourly: Hourly
}

export interface CurrentWeatherUnits {
  time: string
  interval: string
  temperature: string
  windspeed: string
  winddirection: string
  is_day: string
  weathercode: string
}

export interface CurrentWeather {
  time: string
  interval: number
  temperature: number
  windspeed: number
  winddirection: number
  is_day: number
  weathercode: number
}

export interface HourlyUnits {
  time: string
  temperature_2m: string
}

export interface Hourly {
  time: string[]
  temperature_2m: number[]
}
