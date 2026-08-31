/**
 * openMeteoApi.ts — Free Open-Meteo weather API integration
 * No API key required. Rate limits: very generous (10k req/day free).
 * Docs: https://open-meteo.com/en/docs
 */

export interface DayForecast {
  date: string          // ISO date string
  tempMax: number       // °C
  tempMin: number       // °C
  precipSum: number     // mm
  windspeedMax: number  // km/h
  weatherCode: number   // WMO code
  condition: WeatherCondition
  risk: 'low' | 'moderate' | 'high'
}

export type WeatherCondition =
  | 'sunny' | 'partly_cloudy' | 'cloudy' | 'fog'
  | 'drizzle' | 'rain' | 'heavy_rain' | 'thunderstorm'
  | 'snow' | 'hail'

// WMO weather code → condition mapping
function wmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'sunny'
  if (code <= 2) return 'partly_cloudy'
  if (code === 3) return 'cloudy'
  if (code <= 49) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain'
  if (code <= 84) return 'heavy_rain'
  if (code <= 99) return 'thunderstorm'
  return 'cloudy'
}

function getWeatherRisk(condition: WeatherCondition, precip: number, wind: number): 'low' | 'moderate' | 'high' {
  if (condition === 'thunderstorm' || condition === 'heavy_rain' || wind > 60) return 'high'
  if (condition === 'rain' || condition === 'snow' || precip > 5 || wind > 40) return 'moderate'
  return 'low'
}

export const CONDITION_ICONS: Record<WeatherCondition, string> = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  heavy_rain: '⛈️',
  thunderstorm: '⛈️',
  snow: '❄️',
  hail: '🌨️',
}

export interface WeatherFetchResult {
  forecasts: DayForecast[]
  source: string
  fetchedAt: string
  lat: number
  lon: number
}

// Geocode a city name using Nominatim (free OSM geocoder)
export async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ExpeditionXAI/1.0 (contact@expeditionx.ai)' }
    })
    const data = await res.json()
    if (data.length === 0) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

// Main fetch from Open-Meteo (no key needed)
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days: number = 7
): Promise<WeatherFetchResult> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat.toString())
  url.searchParams.set('longitude', lon.toString())
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode')
  url.searchParams.set('forecast_days', days.toString())
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const data = await res.json()

  const { daily } = data
  const forecasts: DayForecast[] = daily.time.map((date: string, i: number) => {
    const code = daily.weathercode[i]
    const condition = wmoToCondition(code)
    const precip = daily.precipitation_sum[i] ?? 0
    const wind = daily.windspeed_10m_max[i] ?? 0
    return {
      date,
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipSum: Math.round(precip * 10) / 10,
      windspeedMax: Math.round(wind),
      weatherCode: code,
      condition,
      risk: getWeatherRisk(condition, precip, wind),
    }
  })

  return {
    forecasts,
    source: 'Open-Meteo (open-meteo.com) — free, no API key',
    fetchedAt: new Date().toISOString(),
    lat,
    lon,
  }
}

// Fetch weather by city name (geocodes first, then fetches)
export async function fetchWeatherByCity(city: string, days = 7): Promise<WeatherFetchResult | null> {
  const coords = await geocodeCity(city)
  if (!coords) return null
  return fetchWeatherForecast(coords.lat, coords.lon, days)
}

// Plan B rule engine: given a forecast, suggest indoor/alternative activities
export interface PlanBSuggestion {
  reason: string
  alternatives: { label: string; emoji: string; description: string }[]
}

export function computePlanB(forecast: DayForecast, destination: string): PlanBSuggestion | null {
  // Rain threshold: >3mm precipitation
  if (forecast.condition === 'heavy_rain' || forecast.condition === 'thunderstorm' || forecast.precipSum > 3) {
    return {
      reason: `Heavy rain forecast (${forecast.precipSum}mm) — outdoor plans may be disrupted`,
      alternatives: [
        { label: 'Museums & Galleries', emoji: '🏛️', description: 'Explore local art, history, or science museums' },
        { label: 'Café Hopping', emoji: '☕', description: 'Discover local café culture, regional beverages' },
        { label: 'Indoor Markets', emoji: '🛍️', description: 'Covered bazaars, malls, artisan craft markets' },
        { label: 'Cooking Class', emoji: '👨‍🍳', description: 'Learn local cuisine preparation from a chef' },
      ]
    }
  }
  // Heat threshold: >38°C
  if (forecast.tempMax > 38) {
    return {
      reason: `Extreme heat (${forecast.tempMax}°C) — outdoor activity before 10 AM or after 5 PM only`,
      alternatives: [
        { label: 'Early Morning Walk', emoji: '🌅', description: 'Visit sunrise spots before 7 AM when it\'s cool' },
        { label: 'Air-Conditioned Venues', emoji: '❄️', description: 'Malls, cinemas, air-conditioned museums' },
        { label: 'Water Bodies', emoji: '💧', description: 'Lakes, rivers, or shaded riverside promenades' },
        { label: 'Rest & Local Food', emoji: '🍛', description: 'Afternoon siesta, explore local cuisine indoors' },
      ]
    }
  }
  // Strong wind: >50km/h
  if (forecast.windspeedMax > 50) {
    return {
      reason: `High winds (${forecast.windspeedMax}km/h) — boat trips and exposed viewpoints inadvisable`,
      alternatives: [
        { label: 'Sheltered Viewpoints', emoji: '🏔️', description: 'Find viewpoints with wind-breaking tree cover' },
        { label: 'Heritage Walks', emoji: '🏯', description: 'Narrow lanes and historic quarters block wind' },
        { label: 'Local Markets', emoji: '🎪', description: 'Covered local markets are safe and vibrant' },
        { label: 'Spa & Wellness', emoji: '💆', description: 'Ayurvedic or traditional wellness treatments' },
      ]
    }
  }
  return null // No backup needed — weather is fine
}
