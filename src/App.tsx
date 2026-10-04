import { useState } from "react";
import type { WeatherData } from "./types/type";


export default function App() {



  const dummyWeather = {
    city: 'Istanbul',
    country: 'Turkey',
    date: 'sunday',
    temp: 22,
    feelsLike: 20,
    condition: 'sunny',
    humidity: 45,
    windSpeed: 14,
    pressure: 1015,
  }

  const [searchCity, setSearchCity] = useState('');

  const [weather, setWeather] = useState<WeatherData>(dummyWeather);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>();

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Sunny';
    if (code <= 3) return 'Partly Cloudy'
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    return 'Cloudy';
  }

  const fetchWeather = async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

   try {
      // 1. جلب إحداثيات المدينة (خط الطول والعرض)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2. جلب بيانات الطقس باستخدام الإحداثيات
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m`
      );
      const data = await weatherRes.json();
      const current = data.current;

      // 3. تحديث الـ State بالبيانات الحية
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

      setSearchCity(''); // تفريغ حقل البحث بعد النجاح
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }

  }
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-2xl">

        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-100">
              weather forecast
            </h1>
            <p className="text-xs text-stone-500 mt-0-5">
              sunday. 4 october
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-stone-800 rounded text-stone-400">
            Live
          </span>
        </div>

        <div className="flex gap-4 mb-6">
          <input type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="search for city name"
            className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3.5 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-stone-500 transition-colors"
          />

          <button
          onClick={() => fetchWeather(searchCity)}
          disabled={loading}
          className="bg-stone-200 hover:bg-white text-stone-900 text-sm font-bold px-4 py-2 rounded-lg transition-all active:scale-95">
            {loading ? 'searching...' : 'search'}
          </button>
        </div>

        <div className="border border-stone-800 bg-stone-950/40 rounded-lg p-5">

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-100 ">{dummyWeather.city}</h2>
              <span className="text-sm text-stone-500 ">{dummyWeather.country}</span>
            </div>
            <span className="text-sm text-stone-400 bg-stone-900 px-2.5 py-1 rounded border border-stone-800">
              {dummyWeather.condition}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-6 mb-5">
            <div className="flex items-baseline">
              <span className="text-7xl font-light text-stone-100 tracking-tighter">
                {dummyWeather.temp}
              </span>
              <span className="text-3xl font-light text-stone-500 ml-1">°C</span>
            </div>
            <div className="text-right text-xs text-stone-500 space-y-1">
              <div>Feels like {dummyWeather.temp}</div>
              <div className="text-amber-500/80 text-lg">sunny ☀️</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-stone-900/60 border border-stone-800/50">
              <span className="block text-[11px] text-stone-500 uppercase">Humidity</span>
              <span className="text-sm font-semibold text-stone-200 mt-1 block">
                {dummyWeather.humidity} %
              </span>
            </div>

            <div className="p-2 rounded bg-stone-900/60 border border-stone-800/50">
              <span className="block text-[11px] text-stone-500 uppercase">wind speed</span>
              <span className="text-sm font-semibold text-stone-200 mt-1 block">{dummyWeather.windSpeed} km/h</span>
            </div>

            <div className="p-2 rounded bg-stone-900/60 border border-stone-800/50">
              <span className="block text-[11px] text-stone-500 uppercase">pressure</span>
              <span className="text-sm font-semibold text-stone-200 mt-1 block">{dummyWeather.pressure} hpa</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}