export type WeatherData = {
    city: string;
    country: string;
    temp: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
}

export type BgMood = 'dark' | 'light';