import { apiClient } from './apiClient'
import { DESTINATIONS } from '../data/mockData'

// ─── City name extractor ────────────────────────────────────────────────────
const KNOWN_CITIES: Record<string, string> = {
  // India
  'goa': 'Goa,IN', 'delhi': 'New Delhi,IN', 'new delhi': 'New Delhi,IN',
  'mumbai': 'Mumbai,IN', 'bombay': 'Mumbai,IN', 'manali': 'Manali,IN',
  'jaipur': 'Jaipur,IN', 'udaipur': 'Udaipur,IN', 'jodhpur': 'Jodhpur,IN',
  'rajasthan': 'Jaipur,IN', 'kerala': 'Kochi,IN', 'kochi': 'Kochi,IN',
  'munnar': 'Munnar,IN', 'alleppey': 'Alleppey,IN', 'kolkata': 'Kolkata,IN',
  'bengaluru': 'Bengaluru,IN', 'bangalore': 'Bengaluru,IN',
  'hyderabad': 'Hyderabad,IN', 'chennai': 'Chennai,IN', 'madras': 'Chennai,IN',
  'pune': 'Pune,IN', 'ahmedabad': 'Ahmedabad,IN', 'surat': 'Surat,IN',
  'varanasi': 'Varanasi,IN', 'banaras': 'Varanasi,IN', 'kashi': 'Varanasi,IN',
  'agra': 'Agra,IN', 'shimla': 'Shimla,IN', 'dharamsala': 'Dharamsala,IN',
  'kasol': 'Kasol,IN', 'leh': 'Leh,IN', 'ladakh': 'Leh,IN',
  'amritsar': 'Amritsar,IN', 'rishikesh': 'Rishikesh,IN', 'haridwar': 'Haridwar,IN',
  'ooty': 'Ooty,IN', 'coorg': 'Coorg,IN', 'mysore': 'Mysuru,IN',
  'darjeeling': 'Darjeeling,IN', 'gangtok': 'Gangtok,IN',
  'puri': 'Puri,IN', 'bhubaneswar': 'Bhubaneswar,IN', 'raipur': 'Raipur,IN',
  // International
  'bali': 'Bali,ID', 'bangkok': 'Bangkok,TH', 'thailand': 'Bangkok,TH',
  'phuket': 'Phuket,TH', 'singapore': 'Singapore,SG', 'dubai': 'Dubai,AE',
  'paris': 'Paris,FR', 'london': 'London,GB', 'rome': 'Rome,IT',
  'amsterdam': 'Amsterdam,NL', 'barcelona': 'Barcelona,ES', 'istanbul': 'Istanbul,TR',
  'nepal': 'Kathmandu,NP', 'kathmandu': 'Kathmandu,NP', 'pokhara': 'Pokhara,NP',
  'maldives': 'Male,MV', 'colombo': 'Colombo,LK', 'sri lanka': 'Colombo,LK',
  'new york': 'New York,US', 'tokyo': 'Tokyo,JP', 'sydney': 'Sydney,AU',
}

function extractCityFromQuery(q: string): string | null {
  const lower = q.toLowerCase()
  // Longest match first to avoid partial matches
  const sorted = Object.keys(KNOWN_CITIES).sort((a, b) => b.length - a.length)
  for (const city of sorted) {
    if (lower.includes(city)) return KNOWN_CITIES[city]
  }
  return null
}

// ─── Real OpenWeatherMap Integration ────────────────────────────────────────
async function fetchLiveWeather(cityQuery: string): Promise<string | null> {
  const owKey = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (!owKey) return null
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${owKey}&units=metric`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const d = await res.json()

    const city = d.name
    const country = d.sys?.country
    const temp = Math.round(d.main?.temp)
    const feelsLike = Math.round(d.main?.feels_like)
    const humidity = d.main?.humidity
    const desc = d.weather?.[0]?.description
    const wind = d.wind?.speed ? `${Math.round(d.wind.speed * 3.6)} km/h` : 'N/A'
    const visibility = d.visibility ? `${(d.visibility / 1000).toFixed(1)} km` : 'N/A'
    const tempMin = Math.round(d.main?.temp_min)
    const tempMax = Math.round(d.main?.temp_max)

    // Weather emoji based on condition
    const weatherId = d.weather?.[0]?.id || 800
    let weatherEmoji = '⛅'
    if (weatherId >= 200 && weatherId < 300) weatherEmoji = '⛈️'
    else if (weatherId >= 300 && weatherId < 400) weatherEmoji = '🌦️'
    else if (weatherId >= 500 && weatherId < 600) weatherEmoji = '🌧️'
    else if (weatherId >= 600 && weatherId < 700) weatherEmoji = '❄️'
    else if (weatherId >= 700 && weatherId < 800) weatherEmoji = '🌫️'
    else if (weatherId === 800) weatherEmoji = '☀️'
    else if (weatherId > 800) weatherEmoji = '🌤️'

    // Travel advice based on weather
    let travelTip = ''
    if (temp > 35) travelTip = '🥵 Very hot — carry water, wear light clothes & sunscreen SPF 50+'
    else if (temp > 28) travelTip = '☀️ Warm & sunny — great for outdoor sightseeing!'
    else if (temp > 18) travelTip = '😊 Pleasant weather — perfect for exploring!'
    else if (temp > 8) travelTip = '🧥 Carry a light jacket for the evenings.'
    else travelTip = '🧣 Cold — pack thermals, heavy jacket & gloves!'

    if (weatherId >= 200 && weatherId < 600) {
      travelTip = '☔ Rain expected — carry an umbrella or raincoat!'
    }

    return `${weatherEmoji} **Live Weather — ${city}, ${country}**\n\n` +
      `🌡️ **Temperature:** ${temp}°C (feels like ${feelsLike}°C)\n` +
      `📊 **Range:** ${tempMin}°C – ${tempMax}°C\n` +
      `🌤️ **Condition:** ${desc?.charAt(0).toUpperCase()}${desc?.slice(1) || 'N/A'}\n` +
      `💧 **Humidity:** ${humidity}%\n` +
      `💨 **Wind Speed:** ${wind}\n` +
      `👁️ **Visibility:** ${visibility}\n\n` +
      `💡 **Travel Tip:** ${travelTip}`
  } catch {
    return null
  }
}

// ─── Intent detection ────────────────────────────────────────────────────────
function detectIntent(q: string): string {
  const lower = q.toLowerCase()
  if (/\b(weather|temperature|temp|climate|rain|snow|hot|cold|forecast|humid|wind|sunny|cloudy)\b/.test(lower)) return 'weather'
  if (/\b(food|eat|restaurant|cuisine|dine|street food|dish|snack|breakfast|lunch|dinner|taste)\b/.test(lower)) return 'food'
  if (/\b(hotel|stay|accommodation|hostel|resort|airbnb|lodge|homestay|book room|check in)\b/.test(lower)) return 'hotel'
  if (/\b(ticket|flight|train|bus|cheap fare|book ticket|travel by|how to reach|transport)\b/.test(lower)) return 'transport'
  if (/\b(budget|cost|how much|money|price|expensive|cheap|afford|rupee|inr|₹)\b/.test(lower)) return 'budget'
  if (/\b(pack|checklist|luggage|carry|bag|what to bring|essentials|wear)\b/.test(lower)) return 'packing'
  if (/\b(visa|passport|documents|permit|entry|customs)\b/.test(lower)) return 'visa'
  if (/\b(itinerary|plan|schedule|days|day by day|how many days|what to do|places to visit|must see|top places)\b/.test(lower)) return 'itinerary'
  if (/\b(attract|experience|suggest|recommend|things to do|activities|adventure|explore)\b/.test(lower)) return 'attractions'
  if (/\b(season|best time|when to visit|monsoon|winter|summer|good time|ideal time)\b/.test(lower)) return 'besttime'
  if (/^(hi|hello|hey|hola|namaste|sup|yo|good\s*(morning|evening|afternoon))/.test(lower)) return 'greeting'
  return 'general'
}

// ─── Location-aware, intent-specific responses ──────────────────────────────
function getLocationWeatherFallback(city: string): string {
  const c = city.toLowerCase()
  if (c.includes('goa')) return '🌴 **Goa Weather Guide**\n\n☀️ **Oct–Feb:** Best season! 20–30°C, low humidity, perfect beach weather\n🌧️ **Jun–Sep:** Heavy monsoon rains (150+ cm). Many beaches close.\n🌡️ **Mar–May:** Hot & humid, 30–35°C. Avoid if sensitive to heat.\n\n💡 For LIVE current weather, check back shortly!'
  if (c.includes('delhi') || c.includes('new delhi')) return '🏛️ **Delhi Weather Guide**\n\n❄️ **Nov–Feb:** Cold, 5–20°C. Foggy mornings. Best season to visit!\n🔥 **Apr–Jun:** Extremely hot, 35–45°C. Avoid outdoor activities in afternoon.\n🌧️ **Jul–Sep:** Monsoon, humid. Some flooding in low-lying areas.\n☀️ **Oct–Nov:** Pleasant 20–30°C. Perfect for sightseeing!'
  if (c.includes('manali')) return '🏔️ **Manali Weather Guide**\n\n❄️ **Dec–Feb:** −5°C to 5°C. Heavy snowfall. Roads may close. Perfect for snow lovers!\n🌸 **Mar–Jun:** 10–25°C. Rohtang opens. Best trekking season.\n🌧️ **Jul–Aug:** Monsoon with landslide risk. Travel carefully.\n☀️ **Sep–Oct:** 8–20°C. Clear skies. Last chance before winter closures.'
  if (c.includes('mumbai')) return '🌆 **Mumbai Weather Guide**\n\n🌧️ **Jun–Sep:** Heavy monsoon, 25–30°C, extremely humid. City floods possible.\n☀️ **Nov–Feb:** Pleasant 20–28°C. Best time to visit!\n🔥 **Mar–May:** Hot & very humid, 28–35°C. Uncomfortable for sightseeing.'
  if (c.includes('jaipur') || c.includes('rajasthan')) return '🏰 **Jaipur / Rajasthan Weather Guide**\n\n☀️ **Oct–Mar:** Perfect! 10–25°C, clear skies, ideal for forts & palaces.\n🔥 **Apr–Jun:** Extreme heat 35–45°C. Desert winds. Not recommended.\n🌧️ **Jul–Sep:** Monsoon with brief showers. Forts look stunning in the rain!'
  if (c.includes('kerala')) return '🌿 **Kerala Weather Guide**\n\n🌴 **Sep–Mar:** Best season! 22–30°C, lush greenery post-monsoon.\n🌧️ **Jun–Aug:** SW Monsoon (heavier). Best for backwater houseboats & Ayurveda.\n🔥 **Mar–May:** Hot & humid, 28–35°C. Coastal breeze provides some relief.'
  return '🌤️ **Weather Guide**\n\nI\'m fetching real-time weather data. In India:\n❄️ Oct–Feb: Best for most destinations (15–25°C)\n🔥 Apr–Jun: Hill stations only (plains 35–45°C)\n🌧️ Jul–Sep: Monsoon (green landscapes, some travel disruptions)'
}

function getLocationFoodFallback(city: string): string {
  const c = city.toLowerCase()
  if (c.includes('goa')) return '🌴 **Must-Try Food in Goa**\n\n🦞 **Seafood:** Fish Curry Rice (staple!), Prawn Balchão, Lobster at beach shacks\n🍺 **Drinks:** Feni (cashew liquor), King\'s Beer, fresh coconut water\n🍰 **Sweets:** Bebinca (layered cake), Dodol, Bolinhas\n🍛 **Snacks:** Ros Omelette, Chouriço Pav (Goan sausage bread)\n\n📍 **Where to eat:** Ritz Classic (Panaji), Vinayak (Margao), beach shacks at Anjuna & Palolem'
  if (c.includes('delhi') || c.includes('new delhi')) return '🏛️ **Must-Try Food in Delhi**\n\n🥘 **Mains:** Butter Chicken (Moti Mahal), Dal Makhani, Chole Bhature\n🥙 **Street Food:** Gol Gappe (Chandni Chowk), Dahi Bhalla, Aloo Tikki\n🍢 **Kebabs:** Kakori Kebab, Seekh Kebab at Karim\'s (Old Delhi)\n🍰 **Sweets:** Jalebi at Old Famous Jalebi Wala, Rabri Faluda\n\n📍 Paranthe Wali Gali & Chandni Chowk for best street food experience!'
  if (c.includes('mumbai')) return '🌆 **Must-Try Food in Mumbai**\n\n🥔 **Icons:** Vada Pav (Ashok Vada Pav, Dadar), Pav Bhaji (Sardar, Tardeo)\n🦐 **Coastal:** Bombil (Bombay Duck) fry, Prawn Koliwada, Crab at Juhu\n🍜 **Snacks:** Bhelpuri at Chowpatty Beach, Misal Pav, Dabeli\n🍦 **Dessert:** Kulfi Falooda at Bachelorr\'s\n\n📍 Mohammad Ali Road for best Mughlai food during Ramzan!'
  return '🍛 **Food Recommendations**\n\nTell me which city you\'re visiting and I\'ll give you the best local food guide with specific restaurant names and dishes! 🍽️'
}

function getLocationHotelFallback(city: string): string {
  const c = city.toLowerCase()
  if (c.includes('goa')) return '🏨 **Where to Stay in Goa**\n\n🏖️ **North Goa (Party / Backpackers):** Anjuna, Baga, Calangute\n• Budget: Zostel Goa (₹700/night), Jungle hostel\n• Mid: Sterling Varca (₹4,000), Alila Diwa Goa\n• Luxury: Taj Exotica (₹18,000+), W Goa\n\n🌴 **South Goa (Peaceful / Family):** Palolem, Colva, Cavelossim\n• Budget: Peaceland (₹1,200), Cosy Nook\n• Mid: Kenilworth Resort (₹5,000)\n• Luxury: Leela Goa (₹20,000+)'
  if (c.includes('delhi') || c.includes('new delhi')) return '🏨 **Where to Stay in Delhi**\n\n📍 **Connaught Place (Central):** Best for first-timers\n• Budget: Zostel Delhi (₹600), Hotel Palace Heights (₹1,500)\n• Mid: The Claridges (₹8,000), Bloomrooms\n• Luxury: The Imperial (₹20,000+), Taj Mahal Hotel\n\n📍 **Karol Bagh:** Budget-friendly, good transport links\n📍 **Hauz Khas Village:** Trendy, great for nightlife'
  return '🏨 **Hotel Guide**\n\n💰 Budget (₹500–1,500/night): OYO, Zostel, local guesthouses\n🏡 Mid-range (₹2,000–6,000/night): FabHotels, Treebo, boutique hotels\n✨ Luxury (₹8,000+/night): Taj, Oberoi, ITC, Marriott\n\nTell me your city for specific hotel recommendations! 🏙️'
}

function getLocationItineraryFallback(city: string): string {
  const c = city.toLowerCase()
  if (c.includes('goa')) return '📅 **Goa 4-Day Itinerary**\n\n**Day 1 – North Goa Beaches:** Fort Aguada → Calangute Beach → Anjuna flea market (Wed/Sat) → Curlies beach party\n**Day 2 – History & Culture:** Basilica of Bom Jesus (UNESCO) → Se Cathedral → Panjim Latin Quarter → Miramar Beach sunset\n**Day 3 – South Goa:** Butterfly Beach → Palolem Beach → Cabo de Rama Fort\n**Day 4 – Spice Plantation:** Sahakari Spice Farm tour → Old Goa churches → Mandovi River cruise\n\n💰 4-day budget: ₹12,000–18,000 (hostel) or ₹25,000–40,000 (mid hotel)'
  if (c.includes('delhi') || c.includes('new delhi')) return '📅 **Delhi 3-Day Itinerary**\n\n**Day 1 – Old Delhi:** Red Fort → Jama Masjid → Chandni Chowk food walk → Spice Market\n**Day 2 – New Delhi Monuments:** Humayun\'s Tomb → Qutub Minar → India Gate → Lodhi Art District\n**Day 3 – Culture & Shopping:** Akshardham Temple → Dilli Haat → Connaught Place → Hauz Khas Village\n\n💰 3-day budget: ₹8,000–12,000 (budget) or ₹20,000–30,000 (mid-range)'
  if (c.includes('mumbai')) return '📅 **Mumbai 3-Day Itinerary**\n\n**Day 1 – South Mumbai:** Gateway of India → Taj Mahal Palace → Colaba Causeway → Marine Drive evening walk\n**Day 2 – Cultural Mumbai:** Elephanta Caves (ferry from Gateway) → Dharavi tour → Chowpatty Beach bhelpuri\n**Day 3 – Modern Mumbai:** Bandra-Worli Sea Link → Juhu Beach → Bollywood studios → Bandstand promenade\n\n💰 3-day budget: ₹9,000–15,000'
  return '📅 **Let me build your itinerary!**\n\nTell me:\n• Which city/destination?\n• How many days?\n• Budget level (budget/mid/luxury)?\n• Interests (beaches, history, food, adventure)?\n\nI\'ll create a day-by-day plan! 🗺️'
}

// ─── Master intent + city aware fallback ─────────────────────────────────────
async function smartTravelResponse(query: string): Promise<string> {
  const intent = detectIntent(query)
  const city = extractCityFromQuery(query)

  // 1. WEATHER — try live API first, then city-specific fallback
  if (intent === 'weather') {
    if (city) {
      const liveWeather = await fetchLiveWeather(city)
      if (liveWeather) return liveWeather
      return getLocationWeatherFallback(city)
    }
    return '🌤️ **Which city\'s weather would you like?**\n\nJust ask like: "Weather in Goa" or "Temperature in Manali" and I\'ll give you live data! 🌍'
  }

  // 2. FOOD — location-specific
  if (intent === 'food') {
    return getLocationFoodFallback(city || '')
  }

  // 3. HOTEL — location-specific
  if (intent === 'hotel') {
    return getLocationHotelFallback(city || '')
  }

  // 4. ITINERARY — location-specific
  if (intent === 'itinerary') {
    return getLocationItineraryFallback(city || '')
  }

  // 5. TRANSPORT / TICKETS
  if (intent === 'transport') {
    const dest = city ? city.split(',')[0] : 'your destination'
    return `✈️🚆 **How to Reach ${dest}**\n\n**By Flight:** Check IndiGo, Air India, SpiceJet on Google Flights / MakeMyTrip. Book 4–6 weeks early for 40% savings!\n**By Train:** Search on IRCTC.co.in or Rail.one app. Book 120 days in advance. Rajdhani/Shatabdi for comfort.\n**By Bus:** RedBus & AbhiBus for Volvo/Multi-axle AC sleeper buses.\n\n💡 **Pro tip:** Tuesday/Wednesday flights are cheapest. Incognito mode shows untracked prices!`
  }

  // 6. BUDGET
  if (intent === 'budget') {
    const dest = city ? city.split(',')[0] : 'India'
    return `💰 **Budget Guide — ${dest}**\n\n**🎒 Budget Traveler (₹1,200–2,000/day)**\nHostels/OYO → local dhabas → public transport\n\n**🏨 Mid-Range (₹3,000–6,000/day)**\nBoutique hotels → good restaurants → cabs & autos\n\n**✨ Luxury (₹10,000+/day)**\nTaj/Oberoi hotels → fine dining → private cabs\n\n📊 **Average daily breakdown:**\n• Accommodation: ₹800–5,000\n• Food: ₹300–1,500\n• Transport: ₹200–800\n• Activities: ₹200–1,000`
  }

  // 7. PACKING
  if (intent === 'packing') {
    const dest = city ? city.split(',')[0] : 'your destination'
    const c = (city || '').toLowerCase()
    const isHill = c.includes('manali') || c.includes('ladakh') || c.includes('shimla') || c.includes('darjeeling') || c.includes('kasol') || c.includes('spiti')
    const isBeach = c.includes('goa') || c.includes('kerala') || c.includes('puri') || c.includes('bali') || c.includes('phuket')
    let extra = ''
    if (isHill) extra = '\n🏔️ **Hill station essentials:** Heavy jacket (min -5°C), thermal innerwear, waterproof trekking boots, gloves, woolen cap, hand warmers'
    if (isBeach) extra = '\n🏖️ **Beach essentials:** Swimwear, reef-safe sunscreen SPF 50, flip-flops, waterproof bag, rash guard, after-sun lotion'
    return `🎒 **Packing List for ${dest}**\n\n📋 **Always pack:**\n• ID/Passport + digital copies\n• Phone, charger, power bank\n• Cash + debit/credit card\n• Personal medicines + first aid\n• ORS sachets, antacid, pain relief${extra}\n\n🌞 **General clothes:** 3–4 outfits, comfortable walking shoes, light jacket for AC/evenings`
  }

  // 8. VISA
  if (intent === 'visa') {
    return `📄 **Visa Guide for Indian Travelers**\n\n✅ **Visa-free:** Maldives, Nepal, Bhutan, Mauritius, Indonesia (30 days), Cambodia\n🏷️ **Visa on arrival:** Thailand (15 days), UAE (30 days), Egypt\n🌍 **e-Visa:** Sri Lanka, UK, USA (requires ESTA), Schengen countries\n\n**Processing times:**\n• UAE/Thailand: Instant–24 hrs\n• Schengen (Europe): 2–4 weeks (apply 3 months early!)\n• USA/UK/Canada: 3–6 months + interview\n\n🔗 Always apply on official embassy websites!`
  }

  // 9. BEST TIME
  if (intent === 'besttime') {
    const dest = city ? city.split(',')[0] : ''
    const c = (city || '').toLowerCase()
    if (c.includes('goa')) return '📅 **Best Time to Visit Goa**\n\n✅ **Nov–Feb (Peak Season):** Perfect weather 22–30°C, all beaches open, water sports, festive atmosphere. Prices are highest.\n⚠️ **Mar–May:** Hot & humid. Fewer crowds, cheaper rates.\n❌ **Jun–Sep:** Monsoon — rough seas, some resorts close. But great for budget + lush scenery!'
    if (c.includes('manali')) return '📅 **Best Time to Visit Manali**\n\n☀️ **Mar–Jun:** Rohtang Pass opens. Adventure sports, pleasant 10–25°C. Most popular!\n🏄 **Jul–Aug:** Monsoon risk (landslides). River rafting is best!\n❄️ **Dec–Feb:** Skiing & snow. −5°C to 5°C. Rohtang closed but Solang Valley accessible.'
    if (c.includes('kerala')) return '📅 **Best Time to Visit Kerala**\n\n✅ **Sep–Mar:** Post-monsoon, lush green. Best for backwaters, beaches, wildlife. 22–30°C.\n🌧️ **Jun–Aug:** Heavy SW monsoon — great for Ayurveda retreats & houseboat stays!\n⚠️ **Apr–May:** Hot & very humid. Not ideal for outdoor exploration.'
    return `📅 **Best Time to Visit ${dest || 'India'}**\n\n❄️ **Oct–Feb:** Best for most Indian destinations — Rajasthan, Goa, Kerala, Tamil Nadu (15–25°C)\n☀️ **Mar–Jun:** Perfect for hill stations — Manali, Shimla, Darjeeling, Sikkim\n🌧️ **Jul–Sep:** Monsoon season — Kerala, Coorg & Northeast India are spectacular!`
  }

  // 10. ATTRACTIONS
  if (intent === 'attractions') {
    const dest = city ? city.split(',')[0] : ''
    const c = (city || '').toLowerCase()
    if (c.includes('goa')) return '🌴 **Top Things to Do in Goa**\n\n🏖️ Anjuna, Palolem & Butterfly Beach\n⛵ Water sports at Baga (parasailing, jet ski ₹500–1,500)\n🏛️ Basilica of Bom Jesus (UNESCO) & Se Cathedral\n🦋 Chorla Ghats jungle trek & Dudhsagar Waterfalls\n🌅 Arambol Beach sunset & drum circles\n🛍️ Anjuna Flea Market (Wednesday) & Saturday Night Market\n🚤 Mandovi River evening cruise with cultural show\n🍺 Beach shack hopping — Curlies, Thalassa, Antares'
    if (c.includes('delhi') || c.includes('new delhi')) return '🏛️ **Top Things to Do in Delhi**\n\n🏰 Red Fort & Chandni Chowk (Old Delhi half-day)\n🕌 Jama Masjid — India\'s largest mosque (free entry)\n🗿 Qutub Minar (UNESCO) & Humayun\'s Tomb\n🕊️ India Gate & Rajpath garden walk\n🛕 Akshardham Temple (evening light show ₹580)\n🎨 Lodhi Art District street art walk\n🛍️ Dilli Haat & Connaught Place shopping\n🍛 Karim\'s Old Delhi for iconic Mughlai food'
    return `🗺️ **Top Experiences${dest ? ` in ${dest}` : ' in India'}**\n\n🎭 Local festivals — Holi, Diwali, Durga Puja\n🌿 Wildlife — Ranthambore tiger safari, Kaziranga\n🧘 Wellness — Rishikesh yoga, Kerala Ayurveda\n🏄 Adventure — river rafting, paragliding, trekking\n🛕 Spiritual — Varanasi Ganga Aarti, Golden Temple\n\nTell me your city for specific activities! 📍`
  }

  // 11. GREETING
  if (intent === 'greeting') {
    return "Hello! 👋 I'm Max AI, your personal travel concierge powered by ExpeditionX!\n\nI can help you with:\n🌤️ **Live weather** for any city\n📅 **Day-by-day itineraries**\n💰 **Budget planning**\n🍛 **Local food guides**\n🏨 **Hotel recommendations**\n✈️ **Cheapest tickets & transport**\n\nWhere are you planning to go? Just ask me anything! 🗺️"
  }

  // 12. CITY-GENERAL (only if no specific intent detected)
  if (city) {
    const cityName = city.split(',')[0]
    const c = city.toLowerCase()
    if (c.includes('goa')) return '🌴 **Goa — Quick Guide**\n\n📅 Best time: Nov–Feb\n🏖️ Top beaches: Anjuna, Palolem, Arambol, Butterfly Beach\n🍴 Must eat: Fish curry rice, prawn balchão, bebinca\n🏨 Stay: Zostel (budget) → Alila Diwa (mid) → Taj Exotica (luxury)\n✈️ Nearest airport: Goa International (Dabolim) — 30 min from beaches\n\nAsk me specifically: weather, food, hotels, or itinerary for Goa! 🌊'
    if (c.includes('delhi') || c.includes('new delhi')) return '🏛️ **Delhi — Quick Guide**\n\n📅 Best time: Oct–Mar\n🏰 Top spots: Red Fort, Qutub Minar, India Gate, Humayun\'s Tomb\n🍴 Must eat: Chole Bhature, Dahi Bhalla, Karim\'s kebabs, Paranthe Wali Gali\n🏨 Stay: Zostel (budget) → Bloomrooms (mid) → The Imperial (luxury)\n✈️ Airport: IGI — Metro connects to city in 20 min (₹60)\n\nAsk about weather, food, itinerary, or hotels in Delhi!'
    if (c.includes('manali')) return '🏔️ **Manali — Quick Guide**\n\n📅 Best time: Mar–Jun (summer) | Dec–Feb (snow)\n🗻 Top spots: Rohtang Pass, Solang Valley, Hadimba Temple, Old Manali\n🍴 Must eat: Siddu (local bread), Dham thali, Tibetan momos\n🏨 Stay: Zostel Manali (budget) → Apple Country (mid) → Span Resort (luxury)\n✈️ Nearest airport: Bhuntar (50 km) or overnight bus/cab from Delhi\n\nAsk about weather, itinerary, packing, or hotels in Manali!'
    return `📍 **${cityName} — What would you like to know?**\n\nI can help with:\n🌤️ Weather in ${cityName}\n📅 Itinerary for ${cityName}\n🍛 Food guide for ${cityName}\n🏨 Hotels in ${cityName}\n💰 Budget for ${cityName}\n✈️ How to reach ${cityName}\n\nJust ask me specifically!`
  }

  // 13. General fallback
  return "🌍 I'm Max AI, your travel concierge!\n\nI can answer specific questions like:\n• \"Weather in Goa\"\n• \"Best food in Mumbai\"\n• \"3-day Delhi itinerary\"\n• \"Hotels in Manali under ₹2000\"\n• \"Cheapest flights to Kerala\"\n• \"When to visit Rajasthan\"\n\nWhere are you planning to go? 🗺️"
}

// ─── Main AI Service export ──────────────────────────────────────────────────
export const aiService = {
  async getCostConfidence(params: { totalEstimate: number }) {
    const base = params.totalEstimate
    return { low: Math.round(base * 0.85), high: Math.round(base * 1.2), mostLikely: base, confidenceScore: 0.94 }
  },

  async getRecommendations(userId: string) {
    try {
      return await apiClient.get<any[]>('/recommendations')
    } catch (e) {
      return DESTINATIONS.filter(d => d.trending).slice(0, 6).map(d => ({
        id: d.id,
        name: d.name,
        state: d.state,
        country: d.country,
        imageUrl: d.image || d.imageUrl,
        avgCost: d.costPerDay || d.avgCost || 3000
      }))
    }
  },

  async getSentimentScore(text: string) {
    const lower = text.toLowerCase()
    if (lower.includes('great') || lower.includes('amazing') || lower.includes('good')) return { score: 92, label: 'Positive' }
    if (lower.includes('bad') || lower.includes('worst') || lower.includes('crowded')) return { score: 35, label: 'Negative' }
    return { score: 70, label: 'Neutral' }
  },

  async generatePackingList(destId: string, month: number, duration: number) {
    try {
      const numId = parseInt(destId)
      if (!isNaN(numId)) {
        return await apiClient.get<any[]>(`/trips/${numId}/packing-checklist`)
      }
    } catch (error) {}

    const isWinter = month >= 10 || month <= 2
    const items = [
      { id: 'p1', label: 'T-Shirts (x' + Math.ceil(duration / 2) + ')', checked: false },
      { id: 'p2', label: 'Jeans/Trousers (x2)', checked: false },
      { id: 'p3', label: 'Undergarments (x' + duration + ')', checked: false },
      { id: 'p4', label: 'Toiletries Kit', checked: false },
      { id: 'p5', label: 'Power Bank', checked: false }
    ]
    if (isWinter) items.push({ id: 'p6', label: 'Heavy Jacket', checked: false })
    else items.push({ id: 'p6', label: 'Sunscreen & Sunglasses', checked: false })
    return items
  },

  async getWeatherSuggestions(destId: string) {
    try {
      const response = await apiClient.get<any>(`/weather?city=${destId}`)
      if (response && response.monthlyClimate) {
        return {
          bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          warning: response.weatherDesc,
          monthlyData: response.monthlyClimate.map((c: any) => ({ month: c.month, temp: c.avgTemp, icon: '⛅' }))
        }
      }
    } catch (e) { console.warn('Weather API failed') }

    return {
      bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      warning: 'Summers (May-Jun) can be extremely hot. Carry hydration salts.',
      monthlyData: [
        { month: 'Jan', temp: 14, icon: '⛅' },
        { month: 'Apr', temp: 32, icon: '☀️' },
        { month: 'Jul', temp: 34, icon: '🌧️' },
        { month: 'Oct', temp: 24, icon: '⛅' },
      ]
    }
  },

  async processChatQuery(query: string) {
    // 1 to 2 second realistic thinking delay so user sees typing animation and feels the AI thoughtfully formulating an answer
    const thinkingDelayMs = 1200 + Math.floor(Math.random() * 600) // between 1.2s and 1.8s
    const minThinkingTime = new Promise(resolve => setTimeout(resolve, thinkingDelayMs))

    const executeChat = async () => {
      // 1. Try Gemini API directly (any key format — let the API decide validity)
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (geminiKey && geminiKey.trim().length > 10) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: `You are ExpeditionX AI, an expert travel concierge for India and global destinations. Answer ONLY the specific question asked — do NOT give generic guides when a specific thing (like weather, food, hotels) is asked. Be accurate, concise, friendly, use emojis and bullet points. User query: ${query}` }] }],
                generationConfig: { maxOutputTokens: 600, temperature: 0.5 }
              })
            }
          )
          clearTimeout(timeout)
          if (res.ok) {
            const data = await res.json()
            const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text
            if (aiReply && aiReply.trim().length > 10) {
              return { intent: 'GEMINI_AI', response: aiReply, cardType: null, cardData: null }
            }
          }
        } catch (_) { /* fall through to smart fallback */ }
      }

      // 2. Smart intent-aware fallback with real OpenWeatherMap data
      const response = await smartTravelResponse(query)
      return { intent: 'SMART_FALLBACK', response, cardType: null, cardData: null }
    }

    const [_, result] = await Promise.all([minThinkingTime, executeChat()])
    return result
  },

  async generateSurpriseTrip() {
    try {
      const recommendations = await this.getRecommendations('1')
      if (recommendations && recommendations.length > 0) {
        return recommendations[Math.floor(Math.random() * recommendations.length)]
      }
    } catch (e) {}
    return null
  }
}
