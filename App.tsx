
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Wind, Droplets, Thermometer, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from './types';
import { fetchLocation, fetchWeather } from './services/weatherService';
import { WeatherIcon } from './components/WeatherIcons';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (city: string) => {
    if (!city) return;
    setLoading(true);
    setError(null);

    try {
      const location = await fetchLocation(city);
      if (!location) {
        setError("City not found. Please try another name.");
        setLoading(false);
        return;
      }

      const weatherData = await fetchWeather(location.lat, location.lon, location.name, location.country);
      setWeather(weatherData);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || "Your Location";
            const weatherData = await fetchWeather(latitude, longitude, city, data.address.country || "");
            setWeather(weatherData);
          } catch (err) {
            setError("Could not detect your location's weather.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Location access denied.");
          setLoading(false);
        }
      );
    }
  };

  useEffect(() => {
    handleSearch("New York");
  }, [handleSearch]);

  const chartData = weather ? weather.daily.time.map((t, i) => ({
    name: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
    max: weather.daily.temperatureMax[i],
    min: weather.daily.temperatureMin[i]
  })) : [];

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 flex flex-col items-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      
      {/* Search Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Weather Cast</h1>
          </div>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
            className="relative w-full md:w-96"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all glass-panel"
            />
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              className="absolute right-3 top-2.5 p-1 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
              title="Get current location"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Syncing with atmospheric sensors...</p>
          </div>
        ) : weather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            
            {/* Main Weather Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                  <WeatherIcon code={weather.conditionCode} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">{weather.city}, {weather.country}</span>
                  </div>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-7xl font-bold tracking-tighter">{Math.round(weather.temperature)}°</span>
                    <span className="text-2xl text-slate-400 pb-2">C</span>
                  </div>
                  <div className="text-xl font-medium text-blue-400 mb-8">{weather.condition}</div>

                  <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                        <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                        Feels Like
                      </div>
                      <div className="text-lg font-bold">{Math.round(weather.feelsLike)}°</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        Humidity
                      </div>
                      <div className="text-lg font-bold">{weather.humidity}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                        <Wind className="w-3.5 h-3.5 text-emerald-400" />
                        Wind
                      </div>
                      <div className="text-lg font-bold">{Math.round(weather.windSpeed)} km/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel p-6 rounded-3xl">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Temperature Trend</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="max" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorMax)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weekly Forecast */}
              <div className="glass-panel p-6 rounded-3xl h-full">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Weekly Forecast</h3>
                <div className="space-y-6">
                  {weather.daily.time.slice(1, 7).map((t, i) => (
                    <div key={t} className="flex items-center justify-between group">
                      <div className="w-12 text-sm font-medium text-slate-400">
                        {new Date(t).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="scale-75 group-hover:scale-90 transition-transform">
                          <WeatherIcon code={weather.daily.weatherCode[i + 1]} />
                        </div>
                      </div>
                      <div className="w-20 flex justify-end gap-3 text-sm font-bold">
                        <span>{Math.round(weather.daily.temperatureMax[i + 1])}°</span>
                        <span className="text-slate-500">{Math.round(weather.daily.temperatureMin[i + 1])}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default App;
