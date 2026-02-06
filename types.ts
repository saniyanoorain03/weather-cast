
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  daily: {
    time: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
  };
}

export interface Location {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

export interface GeminiInsight {
  summary: string;
  clothing: string[];
  activities: string[];
  vibe: string;
}
