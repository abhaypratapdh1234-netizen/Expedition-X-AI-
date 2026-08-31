// ============================================================
// destinationData.ts — Seeded mock data for all destinations
// Swap this file for a real API call without touching UI code.
// ============================================================

export interface DestinationStat {
  weather: string
  tempRange: string
  bestMonths: string
  crowdLevel: 'low' | 'medium' | 'high'
  safetyScore: number // 1-10
  budgetMin: number
  budgetMax: number
  currency: string
  lat: number
  lng: number
  emoji: string
  country: string
  description: string
  localTips: string[]
  safetyWarning?: string
}

export interface FoodCard {
  id: string
  name: string
  rating: number
  tags: string[]
  priceRange: string
  description: string
}

export interface ItineraryTemplate {
  name: string
  type: 'attraction' | 'hotel' | 'food' | 'transport'
  duration: string
  cost: number
  crowdPercent: number
  weatherNote: string
  aiReason: string
  rating: number
}

export const DESTINATIONS: Record<string, DestinationStat> = {
  Paris: {
    weather: '⛅ Mild',
    tempRange: '15–24°C',
    bestMonths: 'Apr–Jun, Sep–Oct',
    crowdLevel: 'high',
    safetyScore: 7,
    budgetMin: 80000,
    budgetMax: 200000,
    currency: '€',
    lat: 48.8566,
    lng: 2.3522,
    emoji: '🗼',
    country: 'France',
    description: 'The city of light, romance, and world-class gastronomy.',
    localTips: [
      'Carry a Navigo Découverte pass for unlimited Metro rides',
      'Book Eiffel Tower tickets at least 2 weeks in advance',
      'Museums are free on the first Sunday of each month',
      'Tipping is appreciated but not mandatory (5–10%)',
      'Most shops close on Sundays — plan accordingly',
    ],
    safetyWarning: undefined,
  },
  Goa: {
    weather: '☀️ Tropical',
    tempRange: '25–33°C',
    bestMonths: 'Nov–Feb',
    crowdLevel: 'medium',
    safetyScore: 8,
    budgetMin: 15000,
    budgetMax: 60000,
    currency: '₹',
    lat: 15.2993,
    lng: 74.124,
    emoji: '🌴',
    country: 'India',
    description: 'Sun, sea, seafood, and soul — India\'s beach paradise.',
    localTips: [
      'Rent a scooter — it\'s the best way to explore',
      'Avoid swimming during monsoon (high currents)',
      'North Goa is lively; South Goa is serene — pick your vibe',
      'Cash is still preferred at local shacks',
      'Carry reef-safe sunscreen',
    ],
    safetyWarning: undefined,
  },
  Dubai: {
    weather: '🌤 Sunny & Dry',
    tempRange: '24–40°C',
    bestMonths: 'Nov–Mar',
    crowdLevel: 'medium',
    safetyScore: 9,
    budgetMin: 60000,
    budgetMax: 250000,
    currency: 'AED',
    lat: 25.2048,
    lng: 55.2708,
    emoji: '🏙️',
    country: 'UAE',
    description: 'Luxury, record-breakers, and desert adventures in one city.',
    localTips: [
      'Dress modestly in public areas and malls',
      'Download Careem or Uber — taxis are cheap and clean',
      'Friday brunch is a cultural institution — try one',
      'Ramadan timings change everything — check dates',
      'Tap water is safe; buy bottled for taste preference',
    ],
  },
  Tokyo: {
    weather: '🌸 Temperate',
    tempRange: '10–30°C',
    bestMonths: 'Mar–May, Sep–Nov',
    crowdLevel: 'high',
    safetyScore: 10,
    budgetMin: 70000,
    budgetMax: 180000,
    currency: '¥',
    lat: 35.6762,
    lng: 139.6503,
    emoji: '⛩️',
    country: 'Japan',
    description: 'Ancient temples meet neon-lit future in this perfectly organized megalopolis.',
    localTips: [
      'Get an IC card (Suica/Pasmo) for all transit',
      'Cash is still king at many shops and restaurants',
      'Don\'t eat or drink while walking in public',
      'Queues are sacred — always queue properly',
      'Download Google Translate with Japanese for offline use',
    ],
  },
  Bali: {
    weather: '🌦 Tropical',
    tempRange: '26–35°C',
    bestMonths: 'May–Sep',
    crowdLevel: 'high',
    safetyScore: 7,
    budgetMin: 25000,
    budgetMax: 100000,
    currency: 'IDR',
    lat: -8.4095,
    lng: 115.1889,
    emoji: '🌺',
    country: 'Indonesia',
    description: 'Rice terraces, temple ceremonies, surf, and serenity.',
    localTips: [
      'Don\'t wear shoes inside temples — carry a sarong',
      'Bargaining is expected at markets (start at 50%)',
      'Traffic in Kuta/Seminyak is brutal — leave early',
      'Drink only bottled or filtered water',
      'Respect ongoing Hindu ceremonies — observe silently',
    ],
    safetyWarning: 'Avoid Kuta main strip after midnight — tourist scams reported.',
  },
  'New Delhi': {
    weather: '☀️ Dry & Dusty',
    tempRange: '5–45°C',
    bestMonths: 'Oct–Mar',
    crowdLevel: 'high',
    safetyScore: 6,
    budgetMin: 8000,
    budgetMax: 35000,
    currency: '₹',
    lat: 28.6139,
    lng: 77.209,
    emoji: '🕌',
    country: 'India',
    description: 'Millennia of history, Mughal grandeur, and epic street food.',
    localTips: [
      'Use the Delhi Metro — it\'s clean, fast, and cheap',
      'Pre-book auto-rickshaws via Rapido or Ola',
      'Avoid tap water strictly — carry bottled',
      'Dress conservatively near religious sites',
      'Connaught Place gets very crowded on weekends',
    ],
    safetyWarning: 'Avoid travelling alone after 10 PM in unfamiliar areas.',
  },
}

// Per-destination itinerary templates (per trip type)
export const ITINERARY_TEMPLATES: Record<string, Record<string, ItineraryTemplate[]>> = {
  Paris: {
    default: [
      { name: 'Eiffel Tower Visit', type: 'attraction', duration: '2h', cost: 2800, crowdPercent: 82, weatherNote: '24°C, 10% rain', aiReason: 'Morning slot beats 85% of daily crowd — 40 min saved', rating: 5 },
      { name: 'Louvre Museum', type: 'attraction', duration: '3h', cost: 1800, crowdPercent: 70, weatherNote: '23°C, 10% rain', aiReason: 'Timed entry at 9 AM avoids midday queues', rating: 5 },
      { name: 'Seine River Cruise', type: 'attraction', duration: '1.5h', cost: 2000, crowdPercent: 45, weatherNote: '22°C, 15% rain', aiReason: 'Sunset slot offers best photography light', rating: 4 },
      { name: 'Le Marais Lunch', type: 'food', duration: '1.5h', cost: 3500, crowdPercent: 35, weatherNote: '24°C, 5% rain', aiReason: 'Highly rated, authentic French bistro nearby', rating: 4 },
      { name: 'Hotel Le Marais', type: 'hotel', duration: '1h', cost: 8000, crowdPercent: 20, weatherNote: '19°C, 10% rain', aiReason: 'Central location cuts commute by 28 min/day', rating: 4 },
      { name: 'CDG Airport Transfer', type: 'transport', duration: '1h', cost: 1500, crowdPercent: 50, weatherNote: '18°C, 5% rain', aiReason: 'RER B is fastest and cheapest at this time', rating: 3 },
      { name: 'Versailles Palace', type: 'attraction', duration: '4h', cost: 2200, crowdPercent: 60, weatherNote: '26°C, 5% rain', aiReason: 'Tuesday visit avoids weekend peak crowds by 35%', rating: 5 },
      { name: 'Montmartre Walk', type: 'attraction', duration: '2h', cost: 0, crowdPercent: 40, weatherNote: '23°C, 10% rain', aiReason: 'Free! Best views of Paris, low crowd in morning', rating: 5 },
      { name: 'Sacré-Cœur Basilica', type: 'attraction', duration: '1h', cost: 0, crowdPercent: 55, weatherNote: '23°C, 10% rain', aiReason: 'Entry is free; dome view saves ₹600 vs paid alternatives', rating: 4 },
      { name: 'Café de Flore Breakfast', type: 'food', duration: '1h', cost: 2200, crowdPercent: 30, weatherNote: '17°C, 15% rain', aiReason: 'Historic café; morning seating available without wait', rating: 4 },
    ],
  },
  Goa: {
    default: [
      { name: 'Baga Beach Morning', type: 'attraction', duration: '2h', cost: 0, crowdPercent: 30, weatherNote: '29°C, 5% rain', aiReason: 'Morning beach at Baga is near-empty — ideal for swim', rating: 4 },
      { name: 'Fort Aguada', type: 'attraction', duration: '1.5h', cost: 100, crowdPercent: 25, weatherNote: '31°C, 5% rain', aiReason: 'Low crowd, great sea views, historical significance', rating: 4 },
      { name: 'Souza Lobo Restaurant', type: 'food', duration: '1.5h', cost: 1200, crowdPercent: 45, weatherNote: '30°C, 5% rain', aiReason: 'Best seafood platter in North Goa, local favourite', rating: 5 },
      { name: 'Dudhsagar Falls Trip', type: 'attraction', duration: '5h', cost: 800, crowdPercent: 55, weatherNote: '28°C, 20% rain', aiReason: 'Early morning jeep tour avoids midday rush', rating: 5 },
      { name: 'Anjuna Flea Market', type: 'attraction', duration: '2h', cost: 500, crowdPercent: 65, weatherNote: '32°C, 5% rain', aiReason: 'Wednesday market has best handicraft selection', rating: 4 },
      { name: 'Resort Calangute', type: 'hotel', duration: '1h', cost: 3500, crowdPercent: 20, weatherNote: '27°C, 10% rain', aiReason: 'Beach-facing, saves 15 min walk to beach daily', rating: 4 },
      { name: 'Spice Plantation Tour', type: 'attraction', duration: '3h', cost: 600, crowdPercent: 30, weatherNote: '30°C, 10% rain', aiReason: 'Includes lunch — saves ₹600 vs separate restaurant', rating: 4 },
    ],
  },
  Tokyo: {
    default: [
      { name: 'Senso-ji Temple, Asakusa', type: 'attraction', duration: '1.5h', cost: 0, crowdPercent: 60, weatherNote: '22°C, 10% rain', aiReason: 'Arrive at 7 AM before crowds — temple gates open 24/7', rating: 5 },
      { name: 'teamLab Borderless', type: 'attraction', duration: '3h', cost: 4500, crowdPercent: 55, weatherNote: '23°C, 5% rain', aiReason: 'Pre-book tickets; weekday morning slots have 40% less wait', rating: 5 },
      { name: 'Sushi Saito (Lunch)', type: 'food', duration: '1h', cost: 8000, crowdPercent: 20, weatherNote: '24°C, 5% rain', aiReason: 'Reservations essential; highest-rated sushi in Minato', rating: 5 },
      { name: 'Shibuya Crossing', type: 'attraction', duration: '30min', cost: 0, crowdPercent: 85, weatherNote: '22°C, 15% rain', aiReason: 'Best viewed from Shibuya Sky observation deck — ₹2100', rating: 5 },
      { name: 'Shinjuku Gyoen Garden', type: 'attraction', duration: '2h', cost: 400, crowdPercent: 35, weatherNote: '21°C, 10% rain', aiReason: 'Best cherry blossom spot; mornings have lowest crowd density', rating: 5 },
      { name: 'Hotel Shinjuku Granbell', type: 'hotel', duration: '1h', cost: 10000, crowdPercent: 15, weatherNote: '18°C, 10% rain', aiReason: 'Proximity to Shinjuku saves 35 min daily on transit', rating: 4 },
      { name: 'Tsukiji Outer Market', type: 'food', duration: '1.5h', cost: 2000, crowdPercent: 65, weatherNote: '20°C, 10% rain', aiReason: 'Best fresh sushi breakfast — go before 10 AM', rating: 5 },
      { name: 'Akihabara Electronics', type: 'attraction', duration: '2h', cost: 3000, crowdPercent: 50, weatherNote: '23°C, 5% rain', aiReason: 'Afternoon slot — morning staff are most helpful here', rating: 4 },
    ],
  },
  Bali: {
    default: [
      { name: 'Ubud Monkey Forest', type: 'attraction', duration: '2h', cost: 1000, crowdPercent: 55, weatherNote: '28°C, 20% rain', aiReason: 'Morning visit — monkeys are active, crowd is low', rating: 4 },
      { name: 'Tegallalang Rice Terrace', type: 'attraction', duration: '1.5h', cost: 300, crowdPercent: 40, weatherNote: '27°C, 15% rain', aiReason: 'Golden hour photography spot — arrive at 5:30 PM', rating: 5 },
      { name: 'Warung Babi Guling', type: 'food', duration: '1h', cost: 800, crowdPercent: 50, weatherNote: '30°C, 10% rain', aiReason: 'Authentic suckling pig — local favourite, closes at 2 PM', rating: 5 },
      { name: 'Tanah Lot Temple', type: 'attraction', duration: '2h', cost: 600, crowdPercent: 70, weatherNote: '29°C, 15% rain', aiReason: 'Sunset visit is 40 min longer light than midday', rating: 5 },
      { name: 'Kuta Beach Surf Lesson', type: 'attraction', duration: '2h', cost: 1500, crowdPercent: 55, weatherNote: '31°C, 5% rain', aiReason: 'Morning waves are beginner-friendly — 8–10 AM best', rating: 4 },
      { name: 'The Layar Villas', type: 'hotel', duration: '1h', cost: 9000, crowdPercent: 10, weatherNote: '26°C, 10% rain', aiReason: 'Private pool villa — saves ₹1500/day vs Seminyak hotel restaurants', rating: 5 },
      { name: 'Spa Canggu Session', type: 'attraction', duration: '2h', cost: 1200, crowdPercent: 20, weatherNote: '28°C, 10% rain', aiReason: 'Afternoon sessions 40% cheaper than morning peak', rating: 4 },
    ],
  },
  Dubai: {
    default: [
      { name: 'Burj Khalifa (At The Top)', type: 'attraction', duration: '2h', cost: 8500, crowdPercent: 75, weatherNote: '35°C, 0% rain', aiReason: 'Sunset slot is most popular — book 1 week ahead', rating: 5 },
      { name: 'Dubai Mall Shopping', type: 'attraction', duration: '3h', cost: 5000, crowdPercent: 80, weatherNote: '35°C, 0% rain', aiReason: 'Weekday morning has fewest crowds and best service', rating: 4 },
      { name: 'Desert Safari', type: 'attraction', duration: '5h', cost: 4500, crowdPercent: 45, weatherNote: '40°C, 0% rain', aiReason: 'Evening safari avoids peak heat and includes BBQ dinner', rating: 5 },
      { name: 'Dubai Creek Dhow Cruise', type: 'attraction', duration: '2h', cost: 3000, crowdPercent: 35, weatherNote: '28°C, 0% rain', aiReason: 'Night cruise shows Old Dubai vs New Dubai skyline', rating: 4 },
      { name: 'Nobu Dubai (Dinner)', type: 'food', duration: '2h', cost: 15000, crowdPercent: 30, weatherNote: '28°C, 0% rain', aiReason: 'Award-winning Japanese fusion — book 3 days ahead', rating: 5 },
      { name: 'Address Downtown Hotel', type: 'hotel', duration: '1h', cost: 20000, crowdPercent: 10, weatherNote: '26°C, 0% rain', aiReason: 'Burj Khalifa views, walking distance saves ₹800/day on taxis', rating: 5 },
      { name: 'Gold Souk Tour', type: 'attraction', duration: '1.5h', cost: 1000, crowdPercent: 55, weatherNote: '33°C, 0% rain', aiReason: 'Morning bargaining rates 15% better than afternoon', rating: 4 },
    ],
  },
}

// Fallback template for unknown destinations
export const DEFAULT_TEMPLATE: ItineraryTemplate[] = [
  { name: 'City Walking Tour', type: 'attraction', duration: '2h', cost: 500, crowdPercent: 40, weatherNote: '25°C, 10% rain', aiReason: 'Best intro to the city with local guide', rating: 4 },
  { name: 'Local Restaurant Lunch', type: 'food', duration: '1h', cost: 800, crowdPercent: 30, weatherNote: '27°C, 5% rain', aiReason: 'Highly rated local cuisine nearby', rating: 4 },
  { name: 'Heritage Site Visit', type: 'attraction', duration: '2h', cost: 300, crowdPercent: 35, weatherNote: '25°C, 10% rain', aiReason: 'Low crowd on weekday mornings', rating: 4 },
  { name: 'City Hotel', type: 'hotel', duration: '1h', cost: 4000, crowdPercent: 15, weatherNote: '22°C, 5% rain', aiReason: 'Central location saves 30 min commute daily', rating: 4 },
]

export const FOOD_RECOMMENDATIONS: Record<string, FoodCard[]> = {
  Paris: [
    { id: 'p1', name: 'Café de Flore', rating: 4.5, tags: ['Historic', 'Breakfast', 'Vegetarian-friendly'], priceRange: '₹₹₹', description: 'Iconic Left Bank café with perfect croissants.' },
    { id: 'p2', name: 'L\'Ami Jean', rating: 4.8, tags: ['Authentic', 'Basque', 'Hidden Gem'], priceRange: '₹₹₹₹', description: 'No-reservation policy, worth the wait.' },
    { id: 'p3', name: 'Pierre Hermé', rating: 4.9, tags: ['Pastries', 'Fast', 'Vegetarian'], priceRange: '₹₹', description: 'World\'s best macarons. Period.' },
    { id: 'p4', name: 'Bouillon Chartier', rating: 4.3, tags: ['Cheap', 'Authentic', 'Historic'], priceRange: '₹', description: 'Classic French bistro food since 1896. Very cheap.' },
  ],
  Goa: [
    { id: 'g1', name: 'Souza Lobo', rating: 4.7, tags: ['Seafood', 'Authentic', 'Beach-side'], priceRange: '₹₹', description: 'Best prawn curry in North Goa.' },
    { id: 'g2', name: 'A Reverie', rating: 4.8, tags: ['Fine Dining', 'Romantic', 'Fusion'], priceRange: '₹₹₹₹', description: 'Hidden garden restaurant with chef-tasting menu.' },
    { id: 'g3', name: 'Infantaria', rating: 4.5, tags: ['Breakfast', 'Vegetarian', 'Cheap'], priceRange: '₹', description: 'Famous bebinca and local Goan bakery.' },
    { id: 'g4', name: 'Curlies Beach Shack', rating: 4.2, tags: ['Beach', 'Seafood', 'Casual'], priceRange: '₹₹', description: 'Best fish thali with a sea view.' },
  ],
  Tokyo: [
    { id: 't1', name: 'Sushi Saito', rating: 5.0, tags: ['Michelin', 'Sushi', 'Reservation Required'], priceRange: '₹₹₹₹₹', description: 'Arguably the world\'s best sushi.' },
    { id: 't2', name: 'Ichiran Ramen', rating: 4.6, tags: ['Fast', 'Ramen', 'Solo-friendly'], priceRange: '₹₹', description: 'Individual booths, best tonkotsu in Tokyo.' },
    { id: 't3', name: 'Tsukiji Market Stalls', rating: 4.7, tags: ['Fresh', 'Cheap', 'Breakfast', 'Authentic'], priceRange: '₹₹', description: 'Best fresh seafood at 7 AM.' },
    { id: 't4', name: 'Kappabashi Street', rating: 4.4, tags: ['Food Street', 'Cheap', 'Local'], priceRange: '₹', description: 'Cheap ramen + tempura street — locals eat here.' },
  ],
  Bali: [
    { id: 'b1', name: 'Warung Babi Guling Ibu Oka', rating: 4.8, tags: ['Authentic', 'Local', 'Cheap'], priceRange: '₹', description: 'Anthony Bourdain\'s favourite suckling pig.' },
    { id: 'b2', name: 'Locavore', rating: 4.9, tags: ['Fine Dining', 'Farm-to-Table', 'Romantic'], priceRange: '₹₹₹₹₹', description: 'Best restaurant in SEA, reserve 2 weeks ahead.' },
    { id: 'b3', name: 'Naughty Nuri\'s', rating: 4.6, tags: ['BBQ', 'Casual', 'Famous'], priceRange: '₹₹', description: 'Legendary pork ribs, massive cocktails.' },
    { id: 'b4', name: 'Cafe Organic', rating: 4.5, tags: ['Vegan', 'Healthy', 'Breakfast'], priceRange: '₹₹', description: 'Best açai bowls and cold-pressed juices.' },
  ],
  Dubai: [
    { id: 'd1', name: 'Nobu Dubai', rating: 4.9, tags: ['Fine Dining', 'Japanese', 'Luxury'], priceRange: '₹₹₹₹₹', description: 'World-famous Japanese fusion on the water.' },
    { id: 'd2', name: 'Al Ustad Special Kabab', rating: 4.7, tags: ['Authentic', 'Cheap', 'Iranian', 'Local'], priceRange: '₹', description: 'Hidden gem since 1978. Cash only, incredible kebabs.' },
    { id: 'd3', name: 'The Breakfast Club', rating: 4.5, tags: ['Breakfast', 'Trendy', 'Vegetarian-friendly'], priceRange: '₹₹₹', description: 'Most Instagrammed brunch in Dubai Marina.' },
    { id: 'd4', name: 'Ravi Restaurant', rating: 4.6, tags: ['Cheap', 'Pakistani', 'Local', 'Halal'], priceRange: '₹', description: 'Best biryani in Satwa — a Dubai institution.' },
  ],
}

export function getDestinationStat(destination: string): DestinationStat {
  if (!destination) destination = 'Unknown';
  
  // Case-insensitive lookup for preset destinations
  const presetKey = Object.keys(DESTINATIONS).find(k => k.toLowerCase() === destination.toLowerCase())
  if (presetKey) {
    return DESTINATIONS[presetKey]
  }

  // Deterministic fallback for any custom destination worldwide
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  const weathers = ['☀️ Sunny', '🌤 Mild', '🌧 Rainy', '❄️ Cold', '☁️ Overcast', '🌩 Tropical'];
  const tempRanges = ['25–35°C', '15–25°C', '10–20°C', '5–15°C', '20–30°C', '28–38°C'];
  const months = ['Oct–Mar', 'Apr–Sep', 'Nov–Feb', 'May–Aug', 'Year-round'];
  const crowds = ['low', 'medium', 'high'] as const;
  
  const weatherIdx = absHash % weathers.length;
  const tempIdx = (absHash >> 1) % tempRanges.length;
  const monthIdx = (absHash >> 2) % months.length;
  const crowdIdx = (absHash >> 3) % crowds.length;
  const safety = 5 + ((absHash >> 4) % 5); // 5 to 9
  const budgetMin = 10000 + ((absHash >> 5) % 40000); // 10k to 50k
  const budgetMax = budgetMin + 20000 + ((absHash >> 6) % 50000); // budgetMin + 20k to 70k

  return {
    weather: weathers[weatherIdx],
    tempRange: tempRanges[tempIdx],
    bestMonths: months[monthIdx],
    crowdLevel: crowds[crowdIdx],
    safetyScore: safety,
    budgetMin: budgetMin,
    budgetMax: budgetMax,
    currency: '₹',
    lat: 0,
    lng: 0,
    emoji: '🌍',
    country: 'Worldwide',
    description: `A stunning destination waiting to be explored.`,
    localTips: ['Check local weather before packing.', 'Try the local street food!'],
    safetyWarning: safety < 7 ? 'Exercise standard precautions.' : undefined
  }
}

export function getItineraryTemplate(destination: string): ItineraryTemplate[] {
  return ITINERARY_TEMPLATES[destination]?.default || DEFAULT_TEMPLATE
}

export function getFoodCards(destination: string): FoodCard[] {
  return FOOD_RECOMMENDATIONS[destination] || [
    { id: 'f1', name: 'Local Street Food', rating: 4.3, tags: ['Cheap', 'Authentic', 'Fast'], priceRange: '₹', description: 'Best local eats at the market.' },
    { id: 'f2', name: 'Rooftop Restaurant', rating: 4.5, tags: ['Views', 'Fine Dining'], priceRange: '₹₹₹', description: 'Panoramic city views with great food.' },
  ]
}
