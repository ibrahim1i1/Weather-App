import { useEffect, useState } from "react";
import type { WeatherData, BgMood } from "./types/type";
import { Sun, Moon } from "lucide-react";

export default function App() {
  const dummyWeather: WeatherData = {
    city: 'Istanbul',
    country: 'Turkey',
    temp: 22,
    feelsLike: 20,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 14,
    pressure: 1015,
  };

  const [searchCity, setSearchCity] = useState('');
  const [weather, setWeather] = useState<WeatherData>(dummyWeather);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<BgMood>(() => {
    return (localStorage.getItem('weather_mood') as BgMood) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('weather_mood', mood)
  })

  const toggleMood = () => {
    setMood((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Sunny ☀️';
    if (code <= 3) return 'Partly Cloudy ⛅';
    if (code <= 48) return 'Foggy 🌫️';
    if (code <= 67) return 'Rainy 🌧️';
    if (code <= 77) return 'Snowy ❄️';
    return 'Cloudy ☁️';
  };

  const fetchWeather = async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m`
      );
      const data = await weatherRes.json();
      const current = data.current;

      setWeather({
        city: name,
        country: country || '',
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        condition: getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        pressure: Math.round(current.surface_pressure),
      });

      setSearchCity('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch weather');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Istanbul');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(searchCity);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${
      mood === 'dark' ? 'bg-stone-950 text-stone-200' : 'bg-slate-100 text-slate-800 relative'
    }`}>
      <div className={`w-full max-w-md rounded-xl p-6 shadow-xl border ${
        mood === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-sky-500 border-sky-400 text-white'
      }`}>

        <button
          className={`absolute top-5 right-5 px-4 py-2 rounded-lg cursor-pointer p-1 ${mood === 'dark' ? 'bg-stone-700' : 'bg-blue-300'}`}
          onClick={toggleMood}
        >
          {mood === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-white" />
          )}
        </button>

        <div className={`flex items-center justify-between border-b pb-4 mb-5 ${
          mood === 'dark' ? 'border-stone-800' : 'border-sky-400'
        }`}>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              weather forecast
            </h1>
            <p className={`text-xs mt-0.5 ${
              mood === 'dark' ? 'text-stone-400' : 'text-sky-100'
            }`}>
              sunday, 4 october
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded mr-8 ${
            mood === 'dark' ? 'bg-stone-800 text-stone-400' : 'bg-sky-600 text-white font-semibold'
          }`}>
            Live
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="search for city name..."
            className={`flex-1 rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-colors border ${
              mood === 'dark'
                ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600'
                : 'bg-sky-600 border-sky-400 text-white placeholder-sky-200'
            }`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
              mood === 'dark'
                ? 'bg-stone-200 hover:bg-white text-stone-900'
                : 'bg-white text-sky-600 hover:bg-sky-50'
            }`}
          >
            {loading ? 'searching...' : 'search'}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        <div className={`border rounded-lg p-5 ${
          mood === 'dark' ? 'border-stone-800 bg-stone-950/40' : 'border-sky-400 bg-sky-600/30'
        }`}>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{weather.city}</h2>
              <span className={`text-sm ${
                mood === 'dark' ? 'text-stone-500' : 'text-sky-100'
              }`}>{weather.country}</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded border ${
              mood === 'dark'
                ? 'bg-stone-900 text-stone-300 border-stone-800'
                : 'bg-sky-600 text-white border-sky-400'
            }`}>
              {weather.condition}
            </span>
          </div>

          <div className={`flex items-baseline justify-between border-b pb-6 mb-5 ${
            mood === 'dark' ? 'border-stone-800/80' : 'border-sky-400'
          }`}>
            <div className="flex items-baseline">
              <span className="text-7xl font-light tracking-tighter">
                {weather.temp}
              </span>
              <span className={`text-3xl font-light ml-1 ${
                mood === 'dark' ? 'text-stone-500' : 'text-sky-200'
              }`}>°C</span>
            </div>
            <div className={`text-right text-xs space-y-1 ${
              mood === 'dark' ? 'text-stone-500' : 'text-sky-100'
            }`}>
              <div>Feels like {weather.feelsLike}°</div>
              <div className={`text-sm font-medium ${
                mood === 'dark' ? 'text-stone-300' : 'text-white'
              }`}>{weather.condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-2 rounded border ${
              mood === 'dark' ? 'bg-stone-900/60 border-stone-800/50' : 'bg-sky-600/40 border-sky-400'
            }`}>
              <span className={`block text-[11px] uppercase ${
                mood === 'dark' ? 'text-stone-500' : 'text-sky-200'
              }`}>Humidity</span>
              <span className="text-sm font-semibold mt-1 block">
                {weather.humidity}%
              </span>
            </div>

            <div className={`p-2 rounded border ${
              mood === 'dark' ? 'bg-stone-900/60 border-stone-800/50' : 'bg-sky-600/40 border-sky-400'
            }`}>
              <span className={`block text-[11px] uppercase ${
                mood === 'dark' ? 'text-stone-500' : 'text-sky-200'
              }`}>Wind</span>
              <span className="text-sm font-semibold mt-1 block">
                {weather.windSpeed} km/h
              </span>
            </div>

            <div className={`p-2 rounded border ${
              mood === 'dark' ? 'bg-stone-900/60 border-stone-800/50' : 'bg-sky-600/40 border-sky-400'
            }`}>
              <span className={`block text-[11px] uppercase ${
                mood === 'dark' ? 'text-stone-500' : 'text-sky-200'
              }`}>Pressure</span>
              <span className="text-sm font-semibold mt-1 block">
                {weather.pressure} hPa
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}