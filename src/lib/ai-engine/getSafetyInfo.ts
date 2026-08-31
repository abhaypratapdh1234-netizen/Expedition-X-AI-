// getSafetyInfo.ts — Pure fn: destination → safety warning or null
import { getDestinationStat } from './destinationData'

export interface SafetyInfo {
  warning: string
  severity: 'low' | 'medium' | 'high'
  emergencyContacts: {
    police: string
    ambulance: string
    embassy: string
    touristHelpline: string
  }
}

const EMERGENCY_CONTACTS: Record<string, SafetyInfo['emergencyContacts']> = {
  Paris:      { police: '17', ambulance: '15', embassy: '+33 1 4551 7000 (India)', touristHelpline: '3975' },
  Goa:        { police: '100', ambulance: '108', embassy: 'N/A (India)', touristHelpline: '1800-111-363' },
  Dubai:      { police: '999', ambulance: '998', embassy: '+971 4 397 1333 (India)', touristHelpline: '800-Dubai' },
  Tokyo:      { police: '110', ambulance: '119', embassy: '+81 3 3262 2391 (India)', touristHelpline: '03-5321-3077' },
  Bali:       { police: '110', ambulance: '118', embassy: '+62 361 241 4095 (India)', touristHelpline: '0361-754090' },
  'New Delhi': { police: '100', ambulance: '108', embassy: 'N/A (India)', touristHelpline: '1800-111-363' },
  default:    { police: '100 / 112', ambulance: '108', embassy: 'Contact your country embassy', touristHelpline: 'Check local guides' },
}

export function getSafetyInfo(destination: string): SafetyInfo | null {
  const stat = getDestinationStat(destination) || {}
  const contacts = EMERGENCY_CONTACTS[destination] || EMERGENCY_CONTACTS['default']
  const safetyScore = stat.safetyScore || 8

  if (!stat.safetyWarning && safetyScore >= 8) return null

  return {
    warning: stat.safetyWarning || `Exercise normal precautions. Safety score: ${safetyScore}/10`,
    severity: safetyScore >= 7 ? 'low' : safetyScore >= 5 ? 'medium' : 'high',
    emergencyContacts: contacts,
  }
}

export function getEmergencyContacts(destination: string): SafetyInfo['emergencyContacts'] {
  return EMERGENCY_CONTACTS[destination] || EMERGENCY_CONTACTS['default']
}
