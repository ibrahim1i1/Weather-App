import { useEffect, useState } from "react";
import type { WeatherData } from "./types/type";

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

  // دالة تحويل كود الطقس إلى نص وأيقونة مناسبة
  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Sunny ☀️';
    if (code <= 3) return 'Partly Cloudy ⛅';
    if (code <= 48) return 'Foggy 🌫️';
    if (code <= 67) return 'Rainy 🌧️';
    if (code <= 77) return 'Snowy ❄️';
    return 'Cloudy ☁️';
  };

  // 1. تعريف دالة الجلب أولاً
  const fetchWeather = async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // جلب إحداثيات المدينة
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // جلب الطقس عبر الإحداثيات
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

  // 2. استدعاء useEffect بعد تعريف الدالة
  useEffect(() => {
    fetchWeather('Istanbul');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(searchCity);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-2xl">

        {/* الترويسة */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-100">
              weather forecast
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              sunday, 4 october
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-stone-800 rounded text-stone-400">
            Live
          </span>
        </div>

        {/* شريط البحث كـ Form لدعم زر Enter */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="search for city name..."
            className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3.5 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-stone-200 hover:bg-white text-stone-900 text-sm font-bold px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'searching...' : 'search'}
          </button>
        </form>

        {/* تنبيه بالخطأ في حال عدم العثور على المدينة */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* بطاقة عرض البيانات */}
        <div className="border border-stone-800 bg-stone-950/40 rounded-lg p-5">

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-100">{weather.city}</h2>
              <span className="text-sm text-stone-500">{weather.country}</span>
            </div>
            <span className="text-xs text-stone-300 bg-stone-900 px-2.5 py-1 rounded border border-stone-800">
              {weather.condition}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-6 mb-5">
            <div className="flex items-baseline">
              <span className="text-7xl font-light text-stone-100 tracking-tighter">
                {weather.temp}
              </span>
              <span className="text-3xl font-light text-stone-500 ml-1">°C</span>
            </div>
            <div className="text-right text-xs text-stone-500 space-y-1">
              <div>Feels like {weather.feelsLike}°</div>
              <div className="text-stone-300 text-sm font-medium">{weather.condition}</div>
            </div>
          </div>

          {/* شبكة الإحصائيات */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-stone-900/60 border border-stone-800/50">
              <span className="block text-[11px] text-stone-500 uppercase">Humidity</span>
              <span className="text-sm font-semibold text-stone-200 mt-1 block">
                {weather.humidity}%
              </span>
            </div>

            <div className="p-2 rounded bg-stone-900/60 border border-stone-800/50">
              <span className="block text-[11px] text-stone-500 uppercase">Wind</span>
              <span className="text-sm font-semibold text-stone-200 mt-1 block">
                {weather.windSpeed} km/h
              </span>
            </div>

            <div className="p-2 rounded bg-stone-900/60 border border-stone-800/50">
              <span className="block text-[11px] text-stone-500 uppercase">Pressure</span>
              <span className="text-sm font-semibold text-stone-200 mt-1 block">
                {weather.pressure} hPa
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}