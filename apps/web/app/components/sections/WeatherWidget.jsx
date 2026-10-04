import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  CloudRain,
  CloudLightning,
  CloudSun,
  Cloud,
  MapPin,
  Droplets,
  Wind,
  Sparkles,
  ChevronDown,
  RotateCw,
} from 'lucide-react';

const HANOI_COORDS = {
  latitude: 21.0285,
  longitude: 105.8542,
  city: { vi: 'Hà Nội', en: 'Hanoi' },
};

export function mapWmoToCondition(code, isDay = 1) {
  // 95, 96, 99: Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return {
      type: 'thunderstorm',
      icon: CloudLightning,
      text: { vi: 'Dông sét, sấm chớp', en: 'Thunderstorm' },
    };
  }

  // Rain & Drizzle & Showers
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      type: 'rain',
      icon: CloudRain,
      text: { vi: 'Mưa rào rải rác', en: 'Rain Showers' },
    };
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      type: 'rain',
      icon: CloudRain,
      text: { vi: 'Mưa tuyết', en: 'Snowfall' },
    };
  }

  // Fog & Overcast & Cloudy
  if ([2, 3, 45, 48].includes(code)) {
    return {
      type: 'cloudy',
      icon: Cloud,
      text: { vi: 'Nhiều mây, âm u', en: 'Partly Cloudy' },
    };
  }

  // Clear / Sunny
  return {
    type: 'sunny',
    icon: isDay ? Sun : CloudSun,
    text: isDay
      ? { vi: 'Trời quang, nắng đẹp', en: 'Clear & Sunny' }
      : { vi: 'Trời quang, mát dịu', en: 'Clear Night' },
  };
}

export function WeatherWidget({ locale = 'vi', onConditionChange, currentCondition }) {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState(HANOI_COORDS.city[locale]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWeather = async (lat, lon, cityName = null) => {
    try {
      setLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();

      const current = data.current || {};
      const conditionInfo = mapWmoToCondition(current.weather_code ?? 0, current.is_day ?? 1);

      const weatherData = {
        temp: Math.round(current.temperature_2m ?? 25),
        humidity: current.relative_humidity_2m ?? 75,
        windSpeed: current.wind_speed_10m ?? 8,
        isDay: current.is_day ?? 1,
        code: current.weather_code ?? 0,
        type: conditionInfo.type,
        conditionText: conditionInfo.text[locale] || conditionInfo.text.vi,
        Icon: conditionInfo.icon,
      };

      setWeather(weatherData);
      if (cityName) setLocationName(cityName);

      // Only notify parent if not manually overridden by user
      if (!isManualOverride && onConditionChange) {
        onConditionChange(conditionInfo.type);
      }
    } catch {
      // Graceful fallback: Default to typical pleasant weather
      const fallbackCondition = mapWmoToCondition(0, 1);
      setWeather({
        temp: 26,
        humidity: 70,
        windSpeed: 10,
        isDay: 1,
        code: 0,
        type: 'sunny',
        conditionText: fallbackCondition.text[locale] || fallbackCondition.text.vi,
        Icon: fallbackCondition.icon,
      });
      if (!isManualOverride && onConditionChange) {
        onConditionChange('sunny');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for Hanoi
    fetchWeather(HANOI_COORDS.latitude, HANOI_COORDS.longitude, HANOI_COORDS.city[locale]);

    // Try geolocation if supported in client browser
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          fetchWeather(lat, lon, locale === 'en' ? 'Your Location' : 'Vị trí hiện tại');
        },
        () => {
          // Keep Hanoi coordinates on denial
        },
        { timeout: 6000 }
      );
    }
  }, [locale]);

  const selectEffect = type => {
    if (type === 'auto') {
      setIsManualOverride(false);
      if (weather && onConditionChange) {
        onConditionChange(weather.type);
      }
    } else {
      setIsManualOverride(true);
      if (onConditionChange) {
        onConditionChange(type);
      }
    }
    setIsOpen(false);
  };

  const IconComponent = weather?.Icon || CloudSun;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Weather Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface/80 hover:bg-surface border border-border backdrop-blur-md shadow-sm transition-all duration-200 text-fg hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        title={locale === 'en' ? 'Click to change weather effect' : 'Nhấp để đổi hiệu ứng thời tiết'}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/70 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>

        <IconComponent className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />

        <span className="font-semibold text-fg">
          {loading ? '...' : `${weather?.temp ?? 26}°C`}
        </span>

        <span className="text-border">|</span>

        <span className="text-fg-muted truncate max-w-[130px] sm:max-w-none">
          {loading ? (locale === 'en' ? 'Loading weather...' : 'Đang cập nhật...') : weather?.conditionText}
        </span>

        <span className="text-border hidden sm:inline">•</span>

        <span className="text-fg-subtle text-[11px] hidden sm:flex items-center gap-1">
          <MapPin className="w-3 h-3 text-fg-muted" />
          {locationName}
        </span>

        <ChevronDown
          className={`w-3 h-3 text-fg-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Interactive Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-72 sm:w-80 rounded-2xl bg-surface border border-border shadow-xl backdrop-blur-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-fg">
                  {locationName}
                </h4>
                <p className="text-[10px] text-fg-muted">
                  {locale === 'en' ? 'Realtime Weather Data (Open-Meteo)' : 'Dữ liệu thời tiết thực (Open-Meteo)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchWeather(HANOI_COORDS.latitude, HANOI_COORDS.longitude)}
              className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-sunken transition-colors"
              title={locale === 'en' ? 'Refresh weather' : 'Cập nhật lại'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Details */}
          <div className="grid grid-cols-3 gap-2 py-3 border-b border-border text-center">
            <div className="bg-surface-sunken/60 rounded-xl p-2">
              <span className="text-[10px] text-fg-muted block">
                {locale === 'en' ? 'Temp' : 'Nhiệt độ'}
              </span>
              <span className="text-sm font-bold text-fg">{weather?.temp ?? '--'}°C</span>
            </div>
            <div className="bg-surface-sunken/60 rounded-xl p-2">
              <span className="text-[10px] text-fg-muted block flex items-center justify-center gap-1">
                <Droplets className="w-2.5 h-2.5" />
                {locale === 'en' ? 'Humidity' : 'Độ ẩm'}
              </span>
              <span className="text-sm font-bold text-fg">{weather?.humidity ?? '--'}%</span>
            </div>
            <div className="bg-surface-sunken/60 rounded-xl p-2">
              <span className="text-[10px] text-fg-muted block flex items-center justify-center gap-1">
                <Wind className="w-2.5 h-2.5" />
                {locale === 'en' ? 'Wind' : 'Gió'}
              </span>
              <span className="text-sm font-bold text-fg">{weather?.windSpeed ?? '--'} km/h</span>
            </div>
          </div>

          {/* Effect Simulator Mode Switcher */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-fg">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {locale === 'en' ? 'Test Visual Effect' : 'Thử hiệu ứng thời tiết'}
              </span>
              {isManualOverride && (
                <button
                  type="button"
                  onClick={() => selectEffect('auto')}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {locale === 'en' ? 'Reset to Live' : 'Về tự động'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => selectEffect('sunny')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  currentCondition === 'sunny' && isManualOverride
                    ? 'bg-primary text-primary-fg'
                    : 'bg-surface-sunken hover:bg-surface-sunken/80 text-fg'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-warning shrink-0" />
                <span>{locale === 'en' ? 'Sunny Rays' : 'Nắng ấm'}</span>
              </button>

              <button
                type="button"
                onClick={() => selectEffect('rain')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  currentCondition === 'rain' && isManualOverride
                    ? 'bg-primary text-primary-fg'
                    : 'bg-surface-sunken hover:bg-surface-sunken/80 text-fg'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{locale === 'en' ? 'Rainy Day' : 'Mưa rơi'}</span>
              </button>

              <button
                type="button"
                onClick={() => selectEffect('thunderstorm')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  currentCondition === 'thunderstorm' && isManualOverride
                    ? 'bg-primary text-primary-fg'
                    : 'bg-surface-sunken hover:bg-surface-sunken/80 text-fg'
                }`}
              >
                <CloudLightning className="w-3.5 h-3.5 text-warning shrink-0" />
                <span>{locale === 'en' ? 'Lightning' : 'Sấm chớp'}</span>
              </button>

              <button
                type="button"
                onClick={() => selectEffect('cloudy')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  currentCondition === 'cloudy' && isManualOverride
                    ? 'bg-primary text-primary-fg'
                    : 'bg-surface-sunken hover:bg-surface-sunken/80 text-fg'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-fg-muted shrink-0" />
                <span>{locale === 'en' ? 'Cloudy Mist' : 'Mây mù'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
