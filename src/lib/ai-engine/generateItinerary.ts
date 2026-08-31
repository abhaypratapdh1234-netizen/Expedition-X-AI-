// ============================================================
// generateItinerary.ts — Pure fn: wizard inputs → DayPlan[]
// All logic deterministic. Swap for real API without UI changes.
// ============================================================

import type { DayPlan, ItineraryItem } from '../../services/tripService'
import { getItineraryTemplate } from './destinationData'
import type { ItineraryTemplate } from './destinationData'

export interface WizardInputs {
  destination: string
  party: string
  tripTypes: string[]
  budgetMin: number
  budgetMax: number
  accommodation: string
  transport: string
  food: string
  wakeUpTime: string
  walkingPreference: string
  energyLevel: string
  dietary: string[]
  activityDuration: string
  startDate: string
  durationDays: number
}

// Seeded pseudo-random for determinism
function seeded(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getAccommodationCostMultiplier(accommodation: string): number {
  return { Budget: 0.5, Mid: 1.0, Premium: 2.0, Luxury: 4.0 }[accommodation] ?? 1.0
}

function getStartHourFromWakeUp(wakeUp: string): number {
  return { '5 AM': 5, '7 AM': 7, '9 AM': 9, '11 AM': 11 }[wakeUp] ?? 9
}

function getItemsPerDay(energy: string): number {
  return { Relaxed: 3, Balanced: 5, 'Packed Schedule': 7 }[energy] ?? 5
}

function formatTime(hour: number, min: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h}:${min === 0 ? '00' : '30'} ${period}`
}

function parseDuration(durStr: string): number {
  if (durStr === '30 min') return 0.5
  if (durStr === '1 hr' || durStr === '1h') return 1
  if (durStr === '2 hr' || durStr === '2h') return 2
  if (durStr === 'Whole day') return 6
  const [h] = durStr.replace('h', '').split('.')
  return Number(h) || 1
}

function formatDuration(hours: number): string {
  if (hours === 0.5) return '30m'
  return `${hours}H`
}

function generateFiller(dest: string, type: 'attraction' | 'food', idx: number, seed: number, durationStr: string): ItineraryTemplate {
  if (type === 'food') {
    const foodTypes = ['Local Bistro', 'Street Food Market', 'Fine Dining Experience', 'Hidden Gem Cafe', 'Authentic Eatery', 'Rooftop Bar & Grill']
    return {
      name: `${dest} ${foodTypes[idx % foodTypes.length]} ${idx >= foodTypes.length ? idx : ''}`.trim(),
      type: 'food',
      duration: '1.5h',
      cost: Math.round(800 + seeded(seed + idx) * 2000),
      crowdPercent: Math.round(30 + seeded(seed + idx) * 40),
      weatherNote: 'Indoor seating',
      aiReason: 'AI recommended based on your dietary preferences',
      rating: 4.5
    }
  }
  
  const attrTypes = ['Cultural Walk', 'Art Museum', 'Panoramic Viewpoint', 'Historical District', 'Local Market Explore', 'Park Relaxation', 'Photography Tour', 'Boat Ride']
  return {
    name: `${dest} ${attrTypes[idx % attrTypes.length]} ${idx >= attrTypes.length ? idx : ''}`.trim(),
    type: 'attraction',
    duration: durationStr,
    cost: Math.round(400 + seeded(seed + idx) * 1500),
    crowdPercent: Math.round(20 + seeded(seed + idx) * 60),
    weatherNote: 'Clear conditions',
    aiReason: 'Curated match for your travel pace and interests',
    rating: 4
  }
}

export function generateItinerary(inputs: WizardInputs): DayPlan[] {
  const templates = getItineraryTemplate(inputs.destination)
  const startHour = getStartHourFromWakeUp(inputs.wakeUpTime)
  const itemsPerDay = getItemsPerDay(inputs.energyLevel)
  const accommodationMult = getAccommodationCostMultiplier(inputs.accommodation)
  
  // Base scaling to make total cost roughly fit user's max budget
  const roughTotalItems = inputs.durationDays * itemsPerDay
  const expectedCostPerItem = (inputs.budgetMax * 0.5) / (roughTotalItems || 1) 
  const budgetScale = Math.max(0.5, expectedCostPerItem / 1500)

  const days: DayPlan[] = []
  const seed = inputs.destination.length + inputs.party.length + inputs.budgetMax
  
  const usedAttractions = new Set<string>()
  const usedFoods = new Set<string>()

  // Prep pools
  const baseAttractions = templates.filter(t => t.type === 'attraction')
  const baseFoods = templates.filter(t => t.type === 'food')
  
  let fillerAttrCount = 0
  let fillerFoodCount = 0

  for (let dayIdx = 0; dayIdx < inputs.durationDays; dayIdx++) {
    const date = new Date(inputs.startDate)
    date.setDate(date.getDate() + dayIdx)
    const dateStr = date.toISOString().split('T')[0]

    const items: ItineraryItem[] = []
    let currentHour = startHour
    let currentMin = 0

    // Day 1: always starts with transport
    if (dayIdx === 0) {
      const transportTemplate = templates.find(t => t.type === 'transport') || {
        name: `Arrive at ${inputs.destination}`,
        type: 'transport' as const,
        duration: '1.5h',
        cost: 1200,
        crowdPercent: 40,
        weatherNote: '25°C, 5% rain',
        aiReason: 'Direct route optimized — saves 35 min vs alternative',
        rating: 3,
      }
      items.push({
        id: `d${dayIdx}-i0`,
        name: transportTemplate.name,
        type: 'transport',
        time: formatTime(currentHour, currentMin),
        cost: Math.round(transportTemplate.cost * budgetScale * (1 + seeded(seed) * 0.2)),
        duration: transportTemplate.duration,
        notes: inputs.transport === 'Public Transit' ? 'Cheapest route via train/bus' : transportTemplate.aiReason,
      })
      currentHour += 2
    }

    // Add hotel on first day
    const hotelTemplate = templates.find(t => t.type === 'hotel') || {
      name: `${inputs.destination} Hotel`,
      type: 'hotel' as const,
      duration: '1h',
      cost: 4000,
      crowdPercent: 15,
      weatherNote: '22°C, 5% rain',
      aiReason: 'Central location saves commute daily',
      rating: 4,
    }

    if (dayIdx === 0) {
      items.push({
        id: `d${dayIdx}-hotel`,
        name: hotelTemplate.name,
        type: 'hotel',
        time: formatTime(currentHour, 0),
        cost: Math.round(hotelTemplate.cost * accommodationMult * budgetScale),
        duration: '1H',
        notes: `Selected for ${inputs.party}. ${hotelTemplate.aiReason}`,
      })
      currentHour += 2
    }

    // Determine how many attractions vs food for this day
    const targetAttractions = Math.max(1, itemsPerDay - (dayIdx === 0 ? 2 : 1)) // reserve 1 for food
    
    for (let i = 0; i < targetAttractions; i++) {
      // Pick unique attraction
      let tmpl = baseAttractions.find(a => !usedAttractions.has(a.name))
      if (tmpl) {
        usedAttractions.add(tmpl.name)
      } else {
        // Run out of templates, generate filler
        tmpl = generateFiller(inputs.destination, 'attraction', fillerAttrCount++, seed + dayIdx + i, inputs.activityDuration)
      }

      // Adjust duration based on preference
      const prefDuration = parseDuration(inputs.activityDuration)
      const actualDur = Math.max(0.5, prefDuration + (seeded(seed + i) * 0.5 - 0.25)) // slight variance
      
      // Walking preference note
      let walkNote = ''
      if (inputs.walkingPreference === 'Hate Walking') walkNote = ' (Uber/Taxi recommended to entrance)'
      else if (inputs.walkingPreference === 'Love Walking') walkNote = ' (Great walking trails nearby)'

      items.push({
        id: `d${dayIdx}-a${i}`,
        name: tmpl.name,
        type: 'attraction',
        time: formatTime(Math.floor(currentHour), currentMin),
        cost: Math.round(tmpl.cost * budgetScale * (0.8 + seeded(dayIdx + i) * 0.4)),
        duration: formatDuration(actualDur),
        notes: tmpl.aiReason + walkNote,
      })
      
      currentHour += actualDur + 0.5 // Add 30m buffer between activities
    }

    // Add a meal
    let foodTmpl = baseFoods.find(f => !usedFoods.has(f.name))
    if (foodTmpl) {
      usedFoods.add(foodTmpl.name)
    } else {
      foodTmpl = generateFiller(inputs.destination, 'food', fillerFoodCount++, seed + dayIdx * 10, '1.5h')
    }

    // Dietary note
    let dietNote = ''
    if (inputs.dietary.length > 0) {
      dietNote = ` (${inputs.dietary.join(', ')} options verified)`
    }

    items.push({
      id: `d${dayIdx}-food`,
      name: foodTmpl.name + (inputs.food === 'Fine Dining' ? ' (Premium)' : ''),
      type: 'food',
      time: formatTime(Math.floor(currentHour), 0),
      cost: Math.round(foodTmpl.cost * budgetScale * (inputs.food === 'Fine Dining' ? 2 : inputs.food === 'Street Food' ? 0.4 : 1)),
      duration: '1.5H',
      notes: foodTmpl.aiReason + dietNote,
    })

    // Sort items by time properly (just in case)
    // Here we generated them sequentially, so they are already sorted.

    days.push({ day: dayIdx + 1, date: dateStr, items })
  }

  return days
}
