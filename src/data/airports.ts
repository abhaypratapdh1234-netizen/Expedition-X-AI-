/**
 * airports.ts — Master Airport & Destination Directory
 * Supports full city name searches, code lookups, aliases, and smart resolution.
 */

export interface AirportOption {
  code: string
  city: string
  name: string
  country: string
  aliases?: string[]
}

export const POPULAR_AIRPORTS: AirportOption[] = [
  // India - Top Hubs & Metros
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', country: 'India', aliases: ['New Delhi', 'NCR'] },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India', aliases: ['Bombay'] },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India', aliases: ['Bangalore', 'Banglore'] },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India', aliases: ['Secunderabad', 'Shamshabad'] },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India', aliases: ['Madras'] },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport', country: 'India', aliases: ['Calcutta', 'Dum Dum'] },
  { code: 'GOI', city: 'Goa (Dabolim)', name: 'Goa Dabolim International Airport', country: 'India', aliases: ['Goa', 'South Goa', 'Vasco'] },
  { code: 'GOX', city: 'Goa (Mopa)', name: 'Manohar International Airport', country: 'India', aliases: ['North Goa', 'Mopa'] },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport', country: 'India', aliases: ['Ahmadabad', 'Gandhinagar'] },
  { code: 'PNQ', city: 'Pune', name: 'Pune International Airport', country: 'India', aliases: ['Poona', 'Lohegaon'] },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', country: 'India', aliases: ['Cochin', 'Nedumbassery', 'Kerala'] },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', country: 'India', aliases: ['Pink City', 'Sanganer', 'Rajasthan'] },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International Airport', country: 'India', aliases: ['Amausi', 'Awadh'] },
  { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee International Airport', country: 'India', aliases: ['Golden Temple', 'Punjab'] },
  { code: 'IXC', city: 'Chandigarh', name: 'Shaheed Bhagat Singh International Airport', country: 'India', aliases: ['Mohali', 'Panchkula'] },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International Airport', country: 'India', aliases: ['Banaras', 'Kashi', 'Babatpur'] },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', country: 'India', aliases: ['Kashmir', 'Dal Lake'] },
  { code: 'IXL', city: 'Leh', name: 'Kushok Bakula Rimpochee Airport', country: 'India', aliases: ['Ladakh'] },
  { code: 'IXZ', city: 'Port Blair', name: 'Veer Savarkar International Airport', country: 'India', aliases: ['Andaman', 'Nicobar'] },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport', country: 'India', aliases: ['Trivandrum', 'Kerala'] },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport', country: 'India', aliases: ['Assam', 'Borjhar'] },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport', country: 'India', aliases: ['Bhubneshwar', 'Odisha', 'Puri'] },
  { code: 'IDR', city: 'Indore', name: 'Devi Ahilyabai Holkar Airport', country: 'India', aliases: ['Madhya Pradesh'] },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan Airport', country: 'India', aliases: ['Bihar'] },
  { code: 'DED', city: 'Dehradun', name: 'Jolly Grant Airport', country: 'India', aliases: ['Rishikesh', 'Haridwar', 'Uttarakhand', 'Mussoorie'] },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra International Airport', country: 'India', aliases: ['Darjeeling', 'Siliguri', 'Sikkim'] },
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport', country: 'India', aliases: ['Dabok', 'Lake City'] },
  { code: 'IXE', city: 'Mangalore', name: 'Mangaluru International Airport', country: 'India', aliases: ['Mangaluru', 'Bajpe'] },
  { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International Airport', country: 'India', aliases: ['Kovai', 'Ooty'] },
  { code: 'VTZ', city: 'Visakhapatnam', name: 'Visakhapatnam Airport', country: 'India', aliases: ['Vizag', 'Andhra Pradesh'] },
  { code: 'IXJ', city: 'Jammu', name: 'Jammu Airport', country: 'India', aliases: ['Satwari', 'Vaishno Devi'] },
  { code: 'BDQ', city: 'Vadodara', name: 'Vadodara Airport', country: 'India', aliases: ['Baroda'] },
  { code: 'STV', city: 'Surat', name: 'Surat International Airport', country: 'India', aliases: ['Diamond City'] },
  { code: 'NAG', city: 'Nagpur', name: 'Dr. Babasaheb Ambedkar International Airport', country: 'India', aliases: ['Orange City'] },

  // International - Major Global Destinations
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates', aliases: ['UAE', 'Emirates'] },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Zayed International Airport', country: 'United Arab Emirates', aliases: ['UAE'] },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar', aliases: ['Qatar'] },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore', aliases: ['Changi'] },
  { code: 'BKK', city: 'Bangkok (BKK)', name: 'Suvarnabhumi Airport', country: 'Thailand', aliases: ['Bangkok', 'Siam'] },
  { code: 'DMK', city: 'Bangkok (DMK)', name: 'Don Mueang International Airport', country: 'Thailand', aliases: ['Don Muang'] },
  { code: 'DPS', city: 'Bali', name: 'Ngurah Rai International Airport', country: 'Indonesia', aliases: ['Denpasar', 'Kuta', 'Ubud'] },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia', aliases: ['KL', 'KLIA'] },
  { code: 'LHR', city: 'London (Heathrow)', name: 'London Heathrow Airport', country: 'United Kingdom', aliases: ['London', 'England', 'UK'] },
  { code: 'LGW', city: 'London (Gatwick)', name: 'London Gatwick Airport', country: 'United Kingdom', aliases: ['Gatwick', 'UK'] },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France', aliases: ['Paris', 'Roissy'] },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands', aliases: ['Schiphol', 'Holland'] },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany', aliases: ['Frankfurt am Main'] },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland', aliases: ['Kloten', 'Swiss'] },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino Airport', country: 'Italy', aliases: ['Fiumicino'] },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey', aliases: ['Constantinople', 'Turkiye'] },
  { code: 'JFK', city: 'New York (JFK)', name: 'John F. Kennedy International Airport', country: 'United States', aliases: ['New York', 'NYC', 'Queens'] },
  { code: 'EWR', city: 'New York (Newark)', name: 'Newark Liberty International Airport', country: 'United States', aliases: ['New Jersey', 'NYC'] },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'United States', aliases: ['SF', 'Bay Area', 'California'] },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'United States', aliases: ['LA', 'California', 'Hollywood'] },
  { code: 'ORD', city: 'Chicago', name: 'O\'Hare International Airport', country: 'United States', aliases: ['Chicago O\'Hare'] },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada', aliases: ['Ontario'] },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada', aliases: ['British Columbia'] },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia', aliases: ['Mascot', 'NSW'] },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia', aliases: ['Tullamarine', 'Victoria'] },
  { code: 'HND', city: 'Tokyo (Haneda)', name: 'Tokyo Haneda Airport', country: 'Japan', aliases: ['Tokyo', 'Japan'] },
  { code: 'NRT', city: 'Tokyo (Narita)', name: 'Narita International Airport', country: 'Japan', aliases: ['Chiba'] },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong', aliases: ['Chek Lap Kok'] },
  { code: 'MLE', city: 'Maldives', name: 'Velana International Airport', country: 'Maldives', aliases: ['Male', 'Hulhule'] },
  { code: 'CMB', city: 'Colombo', name: 'Bandaranaike International Airport', country: 'Sri Lanka', aliases: ['Katunayake'] },
  { code: 'KTM', city: 'Kathmandu', name: 'Tribhuvan International Airport', country: 'Nepal', aliases: ['Himalayas'] },
]

/**
 * Smart search for destinations/airports matching user text.
 * Matches code, city, full name, country, and common aliases.
 */
export function searchAirports(query: string, limit = 7): AirportOption[] {
  const q = (query || '').trim().toLowerCase()
  if (!q) {
    // Return top popular hubs if query is empty
    return POPULAR_AIRPORTS.slice(0, limit)
  }

  const matches: { airport: AirportOption; score: number }[] = []

  for (const ap of POPULAR_AIRPORTS) {
    let score = -1
    const codeLower = ap.code.toLowerCase()
    const cityLower = ap.city.toLowerCase()
    const nameLower = ap.name.toLowerCase()
    const countryLower = ap.country.toLowerCase()

    // 1. Exact 3-letter IATA code match
    if (codeLower === q) {
      score = 100
    }
    // 2. Code starts with query
    else if (codeLower.startsWith(q)) {
      score = 80
    }
    // 3. City exact match
    else if (cityLower === q) {
      score = 90
    }
    // 4. City starts with query
    else if (cityLower.startsWith(q)) {
      score = 70
    }
    // 5. City contains query
    else if (cityLower.includes(q)) {
      score = 50
    }
    // 6. Name contains query
    else if (nameLower.includes(q)) {
      score = 40
    }
    // 7. Aliases match
    else if (ap.aliases?.some(a => a.toLowerCase().includes(q))) {
      score = 35
    }
    // 8. Country contains query
    else if (countryLower.includes(q)) {
      score = 25
    }

    if (score > 0) {
      matches.push({ airport: ap, score })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, limit).map(m => m.airport)
}

/**
 * Resolves any user-entered string into a 3-letter IATA code.
 * E.g.:
 * - "DEL" -> "DEL"
 * - "Delhi" -> "DEL"
 * - "Delhi (DEL)" -> "DEL"
 * - "Mumbai" -> "BOM"
 * - "London" -> "LHR"
 * - "New York" -> "JFK"
 */
export function resolveAirportCode(input: string): string {
  if (!input) return 'DEL'
  const trimmed = input.trim()

  // 1. Extract (XYZ) if user selected from dropdown
  const parenMatch = trimmed.match(/\(([A-Z]{3})\)/i)
  if (parenMatch) {
    return parenMatch[1].toUpperCase()
  }

  // 2. If it's already a 3-letter code
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  // 3. Look up in directory
  const results = searchAirports(trimmed, 1)
  if (results.length > 0) {
    return results[0].code
  }

  // 4. Fallback to 3 uppercase letters or DEL
  const clean = trimmed.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
  return clean.length === 3 ? clean : 'DEL'
}

/**
 * Returns formatted label: e.g. "Delhi (DEL)"
 */
export function formatAirportDisplay(ap: AirportOption): string {
  return `${ap.city} (${ap.code})`
}
