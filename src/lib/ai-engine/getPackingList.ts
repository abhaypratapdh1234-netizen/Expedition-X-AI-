// getPackingList.ts — Pure fn: destination + tripTypes → packing checklist
import { getDestinationStat } from './destinationData'

export interface PackingItem {
  id: string
  label: string
  emoji: string
  category: 'documents' | 'health' | 'clothing' | 'tech' | 'misc'
  checked: boolean
}

export function getPackingList(destination: string, tripTypes: string[] = []): PackingItem[] {
  const stat = getDestinationStat(destination) || {}
  const safeTripTypes = tripTypes || []
  const tempRange = stat.tempRange || ''
  const weather = stat.weather || ''
  const isHot = tempRange.includes('35') || tempRange.includes('40') || tempRange.includes('33')
  const isCold = tempRange.includes('5') || tempRange.includes('10') || tempRange.includes('15')
  const isRainy = weather.includes('rain') || weather.includes('Tropical')
  const isAdventure = safeTripTypes.includes('Adventure') || safeTripTypes.includes('Nature')
  const isLuxury = safeTripTypes.includes('Luxury')
  const isBeach = destination === 'Goa' || destination === 'Bali'

  const items: PackingItem[] = [
    { id: 'passport', label: 'Passport / ID', emoji: '🛂', category: 'documents', checked: false },
    { id: 'visa', label: 'Visa / E-Ticket', emoji: '✈️', category: 'documents', checked: false },
    { id: 'insurance', label: 'Travel Insurance', emoji: '🛡️', category: 'documents', checked: false },
    { id: 'powerbank', label: 'Power Bank (20,000mAh)', emoji: '🔋', category: 'tech', checked: false },
    { id: 'adapter', label: 'Universal Adapter', emoji: '🔌', category: 'tech', checked: false },
    { id: 'meds', label: 'Medicines (prescription + OTC)', emoji: '💊', category: 'health', checked: false },
    { id: 'sanitizer', label: 'Hand Sanitizer', emoji: '🧴', category: 'health', checked: false },
  ]

  if (isHot || isBeach) {
    items.push({ id: 'sunscreen', label: 'Sunscreen SPF 50+', emoji: '☀️', category: 'health', checked: false })
    items.push({ id: 'hat', label: 'Wide-brim Hat', emoji: '🧢', category: 'clothing', checked: false })
  }

  if (isCold) {
    items.push({ id: 'jacket', label: 'Warm Jacket', emoji: '🧥', category: 'clothing', checked: false })
    items.push({ id: 'thermals', label: 'Thermal Innerwear', emoji: '🩱', category: 'clothing', checked: false })
  }

  if (isRainy) {
    items.push({ id: 'umbrella', label: 'Compact Umbrella', emoji: '☂️', category: 'misc', checked: false })
    items.push({ id: 'raincoat', label: 'Lightweight Raincoat', emoji: '🌧️', category: 'clothing', checked: false })
  }

  if (isBeach) {
    items.push({ id: 'swimwear', label: 'Swimwear', emoji: '🩱', category: 'clothing', checked: false })
    items.push({ id: 'towel', label: 'Quick-dry Towel', emoji: '🏖️', category: 'misc', checked: false })
  }

  if (isAdventure) {
    items.push({ id: 'trekpoles', label: 'Trekking Poles', emoji: '🥾', category: 'misc', checked: false })
    items.push({ id: 'firstaid', label: 'First Aid Kit', emoji: '🩹', category: 'health', checked: false })
  }

  if (isLuxury) {
    items.push({ id: 'formalwear', label: 'Formal Attire', emoji: '👔', category: 'clothing', checked: false })
  }

  // Universal
  items.push({ id: 'sim', label: 'Local SIM Card / eSIM', emoji: '📱', category: 'tech', checked: false })
  items.push({ id: 'cash', label: 'Local Currency (cash)', emoji: '💵', category: 'misc', checked: false })
  items.push({ id: 'locks', label: 'TSA-approved Luggage Locks', emoji: '🔒', category: 'misc', checked: false })

  return items
}
