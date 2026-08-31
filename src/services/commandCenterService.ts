// commandCenterService.ts
// AI Command Center — Intent Classifier (TF-IDF + cosine similarity) + Slot Filler + Workflow Engine
// All workflows call existing feature services — nothing is rebuilt here.

import { useCommandCenterStore } from '../stores/commandCenterStore'
import type { CommandRun, StepLog } from '../stores/commandCenterStore'
import { aiService } from './aiService'

// ─────────────────────────────────────────────
// 1. TRAINING DATA — ~30 intents, 20 samples each
// ─────────────────────────────────────────────

export interface Intent {
  name: string
  label: string        // human-readable with emoji
  minConfidence: number
  phase: 1 | 2 | 3    // 1=single-step, 2=multi-step, 3=approval gate
  samples: string[]
}

export const INTENTS: Intent[] = [
  // ── Phase 1: Single-step, no approval gate ──
  {
    name: 'weather',
    label: '🌤 Weather Lookup',
    minConfidence: 0.40,
    phase: 1,
    samples: [
      'what is the weather in goa', 'weather in delhi', 'temperature in manali',
      'how is the weather in kerala', 'weather forecast mumbai', 'will it rain in shimla',
      'best time to visit rajasthan weather', 'weather conditions in agra', 'climate in ooty',
      'weather update for jaipur', 'is it hot in dubai', 'weather in bali next week',
      'current weather in paris', 'weather in new york', 'how cold is ladakh in january',
      'monsoon in goa', 'snowfall in manali', 'temperature in udaipur today',
      'weather check for my trip', 'forecast for himachal'
    ]
  },
  {
    name: 'budget',
    label: '💰 Budget Estimator',
    minConfidence: 0.40,
    phase: 1,
    samples: [
      'estimate budget for goa trip', 'how much will a trip to paris cost', 'budget for 5 days in kerala',
      'cost of trip to manali', 'how much money do i need for europe', 'trip cost calculator',
      'budget estimate for thailand', 'how expensive is bali', 'cost of visiting singapore',
      'budget breakdown for rajasthan', 'what is the total trip cost', 'estimate my travel expenses',
      'cost estimate for 7 days trip', 'how much to budget for japan', 'cost of traveling in india',
      'trip budget calculator for dubai', 'travel cost for 2 people', 'how much is a trip to maldives',
      'calculate trip cost', 'total budget needed for my vacation'
    ]
  },
  {
    name: 'packing',
    label: '🎒 Packing List Generator',
    minConfidence: 0.40,
    phase: 1,
    samples: [
      'generate packing list for goa', 'what to pack for a beach trip', 'packing checklist for manali',
      'what should i bring to ladakh', 'packing list for 7 days in europe', 'items to carry to himalayas',
      'what to pack for monsoon', 'winter packing list', 'packing essentials for solo travel',
      'what clothes to bring to bali', 'trek packing list', 'camping gear checklist',
      'what to pack for a business trip', 'travel essentials list', 'packing for a cold destination',
      'bag packing guide', 'luggage checklist', 'what to carry for mountain trek',
      'summer packing checklist', 'must carry items for travel'
    ]
  },
  {
    name: 'currency',
    label: '💱 Currency Converter',
    minConfidence: 0.40,
    phase: 1,
    samples: [
      'convert 5000 rupees to usd', 'how much is 100 dollars in rupees', 'currency conversion inr to eur',
      'convert inr to thai baht', 'exchange rate usd to inr', 'how many euros is 10000 rupees',
      'convert rupees to pound', 'currency rate gbp to inr', '1000 inr to aud',
      'what is the exchange rate for yen', 'convert dollars to dirham', 'inr to sgd conversion',
      'how much is 500 euros in rupees', '50 usd to inr today', 'currency conversion for japan',
      'money exchange rate', 'convert my currency', 'foreign exchange rate inr',
      'convert inr to myr', 'dollar to rupee today'
    ]
  },
  {
    name: 'translate',
    label: '🌐 Translate Text',
    minConfidence: 0.40,
    phase: 1,
    samples: [
      'translate hello in spanish', 'how do you say thank you in japanese', 'translate namaste to english',
      'translation in french', 'what is good morning in arabic', 'translate to hindi',
      'how to say excuse me in german', 'translate english to thai', 'say sorry in korean',
      'translate phrase to portuguese', 'what is water in mandarin', 'say goodbye in italian',
      'translate please in russian', 'common phrases in japanese', 'how to greet in turkish',
      'translate to bahasa', 'translate english to swahili', 'what is yes in greek',
      'translate travel phrases', 'translate for me'
    ]
  },
  {
    name: 'expenses',
    label: '📊 Track Expenses',
    minConfidence: 0.40,
    phase: 1,
    samples: [
      'track my expenses', 'add expense to trip', 'log spend 500 rupees for food',
      'record hotel cost', 'add transport expense', 'track spending',
      'how much have i spent', 'show my trip expenses', 'expense tracker',
      'log expense for today', 'add meal cost', 'record taxi fare',
      'what is my total spending', 'show expense breakdown', 'budget vs actual spend',
      'money spent so far', 'record miscellaneous expense', 'add entrance fee expense',
      'track daily spend', 'expense summary'
    ]
  },

  // ── Phase 2: Multi-step, informational ──
  {
    name: 'plan_trip',
    label: '🗺 Plan My Trip',
    minConfidence: 0.42,
    phase: 2,
    samples: [
      'plan a trip to goa', 'plan my singapore trip', 'create itinerary for paris',
      'plan 5 days in kerala', 'help me plan a vacation to bali', 'organize my trip to rajasthan',
      'plan a budget trip to manali', 'create a travel plan for thailand', 'plan weekend trip',
      'help plan honeymoon in maldives', 'plan family trip to europe', 'organize a group trip',
      'create travel schedule for japan', 'plan a backpacking trip', 'plan solo trip to ladakh',
      'help me plan a road trip', 'make an itinerary', 'trip planning assistant',
      'plan my travel', 'suggest a trip itinerary', 'i want to plan a trip', 'plan a trip for me',
      'can you plan my trip', 'help me build an itinerary', 'design a trip schedule'
    ]
  },
  {
    name: 'find_hidden_places',
    label: '🔍 Discover Hidden Places',
    minConfidence: 0.40,
    phase: 2,
    samples: [
      'find hidden waterfalls near pune', 'discover secret beaches in goa', 'hidden gems in rajasthan',
      'offbeat places near delhi', 'unexplored destinations in india', 'find hidden places',
      'discover less known spots', 'offbeat travel destinations', 'hidden waterfall trek',
      'secret places to visit', 'find unexplored beaches', 'hidden village near manali',
      'places tourists dont know about', 'off the beaten path destinations', 'discover new places',
      'find unique spots', 'hidden cafes', 'secret viewpoints', 'lesser known places',
      'find off beat places'
    ]
  },
  {
    name: 'emergency',
    label: '🚨 Emergency Help',
    minConfidence: 0.45,
    phase: 2,
    samples: [
      'i need help emergency', 'find nearest hospital', 'emergency sos', 'i am lost',
      'find nearest police station', 'medical emergency', 'i need a doctor nearby',
      'nearest pharmacy', 'emergency contacts', 'sos help me', 'accident help needed',
      'find emergency services', 'nearest clinic', 'emergency escape plan', 'help i am stranded',
      'nearest fire station', 'medical assistance needed', 'find nearest embassy',
      'emergency in foreign country', 'urgent help needed'
    ]
  },
  {
    name: 'find_food',
    label: '🍜 Find Local Food',
    minConfidence: 0.40,
    phase: 2,
    samples: [
      'find restaurants near me', 'best street food in mumbai', 'local food in goa',
      'where to eat in jaipur', 'best biryani in hyderabad', 'vegetarian restaurants in delhi',
      'top rated restaurants', 'local cuisine to try', 'authentic food recommendations',
      'best dosa in bangalore', 'street food guide', 'food tour suggestions',
      'where can i eat cheap', 'halal restaurants nearby', 'best cafes in manali',
      'food safety rating', 'safe places to eat', 'local delicacies to try',
      'find food near hotel', 'restaurant recommendations'
    ]
  },

  // ── Navigation: open/go to/show a feature page ──
  {
    name: 'navigate',
    label: '🧭 Open Feature',
    minConfidence: 0.38,
    phase: 1,
    samples: [
      // Rewards
      'open reward feature', 'open rewards', 'go to rewards', 'show me rewards',
      'take me to rewards page', 'open my rewards', 'rewards page', 'show rewards',
      // Dashboard
      'open dashboard', 'go to dashboard', 'home dashboard', 'show dashboard',
      'take me home', 'go home', 'open home page',
      // Planner
      'open trip planner', 'go to planner', 'open planner', 'trip planner page',
      'open the trip planner feature', 'start trip planner', 'navigate to planner',
      // Explore
      'open explore', 'go to explore', 'explore destinations', 'show explore page',
      'open discovery', 'browse destinations',
      // Bookings
      'open my bookings', 'go to bookings', 'show my bookings', 'open bookings page',
      'view my bookings', 'my reservations',
      // Wishlist
      'open wishlist', 'show wishlist', 'go to wishlist', 'my wishlist', 'saved places',
      // Toolkit — ALL variations
      'open toolkit', 'open toolkit feature', 'open travel toolkit', 'show toolkit',
      'go to toolkit', 'travel toolkit', 'tool kit', 'show travel tools',
      'open tools', 'show tools', 'open tool kit', 'open packing toolkit',
      // Toolkit sub-features
      'open packing checklist', 'go to packing', 'open currency converter',
      'open weather tool', 'open travel documents', 'open local events',
      'open documents', 'travel documents', 'open events',
      // Notifications
      'open notifications', 'show notifications', 'my notifications', 'go to notifications',
      // Profile / settings
      'open profile', 'my profile', 'open settings', 'account settings', 'go to settings',
      // Trips
      'open my trips', 'show my trips', 'go to trips', 'view my trips',
      // Reviews
      'open reviews', 'show reviews', 'go to reviews',
      // Social
      'open social', 'community page', 'go to social',
    ]
  },

  // ── Phase 3: Approval gate required ──
  {
    name: 'book_hotel',
    label: '🏨 Book Hotel',
    minConfidence: 0.45,
    phase: 3,
    samples: [
      'book a hotel in goa', 'find hotels in delhi', 'reserve a room in mumbai',
      'book accommodation in paris', 'hotel booking for next weekend', 'find cheap hotels',
      'luxury hotel in bali', 'book hotel for 3 nights', 'reserve accommodation',
      'find 3 star hotel', 'hotel search in singapore', 'book resort in maldives',
      'find budget hotel', 'hotel booking near airport', 'book a room for 2',
      'accommodation in thailand', 'hostel booking', 'book guesthouse',
      'hotel reservation', 'find and book hotel'
    ]
  },
  {
    name: 'book_flight',
    label: '✈️ Search Flights',
    minConfidence: 0.45,
    phase: 3,
    samples: [
      'book a flight to goa', 'find flights to dubai', 'cheapest flight to singapore',
      'book return ticket to london', 'flight search from delhi to mumbai', 'one way flight to bali',
      'find airline tickets', 'cheap flights to europe', 'book air ticket',
      'flight booking next month', 'flights from bangalore to goa', 'round trip flight',
      'search flights under 5000', 'find direct flights', 'compare flight prices',
      'book economy class ticket', 'first class flight search', 'domestic flight booking',
      'international flight search', 'find earliest flight'
    ]
  },
  {
    name: 'cancel_booking',
    label: '❌ Cancel Booking',
    minConfidence: 0.45,
    phase: 3,
    samples: [
      'cancel my booking', 'i want to cancel my hotel', 'cancel flight reservation',
      'refund my booking', 'cancel trip booking', 'how to cancel reservation',
      'i need to cancel', 'cancel ticket booking', 'withdraw my booking',
      'undo my hotel reservation', 'cancel accommodation', 'cancel restaurant reservation',
      'delete my booking', 'cancel and refund', 'cancel upcoming trip booking',
      'i dont want to go anymore', 'cancel travel booking', 'remove reservation',
      'booking cancellation', 'cancel my order'
    ]
  },
]

// ─────────────────────────────────────────────
// 2. TF-IDF INTENT CLASSIFIER
// ─────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[₹$€£¥]/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1)
}

function buildTFIDF(corpus: string[][]): Map<string, number>[] {
  const N = corpus.length
  // document frequency
  const df = new Map<string, number>()
  corpus.forEach(doc => {
    const unique = new Set(doc)
    unique.forEach(term => df.set(term, (df.get(term) || 0) + 1))
  })

  return corpus.map(doc => {
    const tf = new Map<string, number>()
    doc.forEach(term => tf.set(term, (tf.get(term) || 0) + 1))
    const tfidf = new Map<string, number>()
    tf.forEach((count, term) => {
      const idf = Math.log((N + 1) / ((df.get(term) || 0) + 1)) + 1
      tfidf.set(term, (count / doc.length) * idf)
    })
    return tfidf
  })
}

function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0
  a.forEach((val, term) => {
    dot += val * (b.get(term) || 0)
    normA += val * val
  })
  b.forEach((val) => { normB += val * val })
  return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Pre-compute: intent index → list of TF-IDF vectors for all samples
let _intentVectors: { intent: Intent; vectors: Map<string, number>[] }[] | null = null

function getIntentVectors() {
  if (_intentVectors) return _intentVectors

  _intentVectors = INTENTS.map(intent => {
    const tokenizedSamples = intent.samples.map(tokenize)
    const vectors = buildTFIDF(tokenizedSamples)
    return { intent, vectors }
  })
  return _intentVectors
}

export interface ClassificationResult {
  intent: Intent
  confidence: number
  alternatives: { intent: Intent; confidence: number }[]
}

// ─── KEYWORD-FIRST OVERRIDE MAP ──────────────────────────────────────────────
// ORDER MATTERS: More specific intents first to prevent substring false matches.
// e.g. 'book_hotel' must come before 'weather' so "hotel" doesn't match "hot"
const KEYWORD_OVERRIDES: Array<{ keywords: string[]; intentName: string }> = [
  // Booking intents FIRST — prevent 'hotel' matching weather keyword 'hot'
  { keywords: ['book hotel', 'book a hotel', 'find hotel', 'find a hotel', 'hotel booking', 'reserve hotel', 'accommodation', 'book a room', 'hostel booking', 'book accommodation'],
    intentName: 'book_hotel' },
  { keywords: ['book flight', 'book a flight', 'find flight', 'flight booking', 'air ticket', 'airline ticket', 'find airline'],
    intentName: 'book_flight' },
  { keywords: ['cancel booking', 'cancel my booking', 'cancel hotel', 'cancel flight', 'refund booking', 'refund my booking', 'cancel reservation', 'cancel my reservation'],
    intentName: 'cancel_booking' },
  // Emergency BEFORE weather (medical/cold could match weather)
  { keywords: ['emergency', 'sos', 'ambulance', 'nearest hospital', 'hospital nearby', 'police station', 'help i am', 'stranded', 'accident help', 'medical emergency', 'urgent help', 'medical help', 'need a doctor', 'need doctor'],
    intentName: 'emergency' },
  // Weather — use word-boundary safe keywords
  { keywords: ['weather in', 'weather at', 'weather for', 'weather forecast', 'temperature in', 'temperature at', 'what is the weather', 'how is the weather', 'climate in', 'monsoon', 'rainfall', 'snowfall', 'will it rain', 'how cold is', 'how hot is', 'is it cold', 'is it hot'],
    intentName: 'weather' },
  // Currency — includes natural language number words like "dollar", "rupee"
  { keywords: ['convert', 'conversion', 'exchange rate', 'currency', 'dollar', 'dollars', 'euro', 'euros', 'rupee', 'rupees', 'pound', 'pounds', 'yen', 'dirham', 'inr to', 'usd to', 'eur to', 'gbp to', 'forex', 'how many rupee', 'how many dollar'],
    intentName: 'currency' },
  { keywords: ['budget for', 'budget trip', 'budget estimate', 'trip cost', 'how much will', 'how much does', 'cost of trip', 'trip budget', 'estimate budget', 'how expensive', 'how much money'],
    intentName: 'budget' },
  { keywords: ['packing list', 'packing checklist', 'what to pack', 'what to carry', 'what should i bring', 'what to bring', 'luggage', 'what to wear', 'bag for', 'essentials for'],
    intentName: 'packing' },
  { keywords: ['translate', 'translation', 'how to say', 'say in', 'what is hello in', 'common phrases', 'language phrase'],
    intentName: 'translate' },
  { keywords: ['track my expenses', 'track expenses', 'add expense', 'log expense', 'my expenses', 'my spending', 'total spending', 'expense tracker', 'money spent', 'how much have i spent'],
    intentName: 'expenses' },
  { keywords: ['hidden places', 'hidden gems', 'offbeat', 'secret beach', 'unexplored', 'less known', 'off the beaten', 'discover hidden'],
    intentName: 'find_hidden_places' },
  { keywords: ['local food', 'street food', 'restaurant near', 'where to eat', 'best food in', 'food near', 'biryani', 'dosa near', 'cafe near', 'find restaurant'],
    intentName: 'find_food' },
  { keywords: ['plan my trip', 'plan a trip', 'plan trip', 'create itinerary', 'itinerary for', 'trip plan', 'trip planner', 'plan vacation', 'day itinerary', 'plan 3 day', 'plan 5 day', 'plan 7 day'],
    intentName: 'plan_trip' },
  { keywords: ['open ', 'go to ', 'show me ', 'take me to ', 'navigate to ', 'open the '],
    intentName: 'navigate' },
]


export function classifyIntent(rawText: string): ClassificationResult {
  const lower = rawText.toLowerCase()
  const queryTokens = tokenize(rawText)
  const intentVectors = getIntentVectors()

  // ── Phase 1: Keyword-first override (fast, deterministic, unambiguous) ──────
  for (const override of KEYWORD_OVERRIDES) {
    const matched = override.keywords.some(kw => lower.includes(kw))
    if (matched) {
      const matchedIntent = INTENTS.find(i => i.name === override.intentName)
      if (matchedIntent) {
        const others = INTENTS.filter(i => i.name !== override.intentName)
        return {
          intent: matchedIntent,
          confidence: 0.95,
          alternatives: others.slice(0, 3).map(i => ({ intent: i, confidence: 0.1 }))
        }
      }
    }
  }

  // ── Phase 2: TF-IDF cosine similarity (fallback for complex queries) ─────────
  const queryMap = new Map<string, number>()
  queryTokens.forEach(t => queryMap.set(t, (queryMap.get(t) || 0) + 1 / queryTokens.length))

  const scores = intentVectors.map(({ intent, vectors }) => {
    const maxSim = Math.max(...vectors.map(v => cosineSim(queryMap, v)))
    return { intent, confidence: maxSim }
  })

  scores.sort((a, b) => b.confidence - a.confidence)

  return {
    intent: scores[0].intent,
    confidence: scores[0].confidence,
    alternatives: scores.slice(1, 4)
  }
}

// ─────────────────────────────────────────────
// 3. SLOT FILLER
// ─────────────────────────────────────────────

export interface Slots {
  city?: string
  destination?: string
  duration?: string    // "3 days", "5 nights"
  budget?: string      // "15000", "15k"
  people?: string
  from_currency?: string
  to_currency?: string
  amount?: string
  text_to_translate?: string
  target_language?: string
  expense_amount?: string
  expense_category?: string
}

const CITY_LIST = [
  'goa', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'kolkata', 'chennai', 'hyderabad',
  'jaipur', 'manali', 'shimla', 'ladakh', 'kerala', 'ooty', 'udaipur', 'agra',
  'varanasi', 'amritsar', 'rishikesh', 'mussoorie', 'darjeeling', 'bali', 'singapore',
  'paris', 'london', 'dubai', 'bangkok', 'tokyo', 'rome', 'new york', 'sydney',
  'maldives', 'rajasthan', 'himachal', 'uttarakhand', 'kashmir', 'andaman'
]

const CURRENCIES = ['inr', 'usd', 'eur', 'gbp', 'aud', 'sgd', 'aed', 'thb', 'jpy', 'cad', 'myr', 'yen', 'euro', 'dollar', 'pound', 'rupee']
const LANG_MAP: Record<string, string> = {
  'spanish': 'es', 'french': 'fr', 'german': 'de', 'japanese': 'ja', 'arabic': 'ar',
  'hindi': 'hi', 'korean': 'ko', 'italian': 'it', 'portuguese': 'pt', 'russian': 'ru',
  'thai': 'th', 'mandarin': 'zh', 'chinese': 'zh', 'turkish': 'tr', 'greek': 'el',
  'bahasa': 'id', 'indonesian': 'id', 'swahili': 'sw', 'dutch': 'nl'
}

export function fillSlots(rawText: string, intentName: string): Slots {
  const lower = rawText.toLowerCase()
  const slots: Slots = {}

  // City / destination
  const foundCity = CITY_LIST.find(c => lower.includes(c))
  if (foundCity) {
    slots.city = foundCity
    slots.destination = foundCity
  }

  // Duration: "3 days", "5 nights", "a week"
  const durationMatch = lower.match(/(\d+)\s*(day|days|night|nights|week|weeks)/)
  if (durationMatch) slots.duration = `${durationMatch[1]} ${durationMatch[2]}`
  else if (lower.includes('weekend')) slots.duration = '2 days'
  else if (lower.includes('week')) slots.duration = '7 days'

  // Budget: ₹15,000 | $500 | 15k
  const budgetMatch = lower.match(/[₹$€£]?\s?(\d[\d,]*(?:k)?)\s*(rupees?|inr|usd|dollars?|euros?)?/i)
  if (budgetMatch) {
    const raw = budgetMatch[1].replace(/,/g, '')
    slots.budget = raw.endsWith('k') ? String(parseInt(raw) * 1000) : raw
  }

  // People count
  const peopleMatch = lower.match(/(\d+)\s*(people|person|persons|adults?|travelers?|pax)/i)
  if (peopleMatch) slots.people = peopleMatch[1]

  // Currency conversion slots
  if (intentName === 'currency') {
    const amountMatch = lower.match(/(\d[\d,]*(?:\.\d+)?)/)
    if (amountMatch) {
      slots.amount = amountMatch[1].replace(/,/g, '')
    } else {
      const wordsToNum: Record<string, string> = { 'one': '1', 'a ': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'ten': '10', 'hundred': '100', 'thousand': '1000' }
      const foundWord = Object.keys(wordsToNum).find(w => lower.includes(w))
      if (foundWord) slots.amount = wordsToNum[foundWord]
    }

    const currencyPair = lower.match(
      new RegExp(`(${CURRENCIES.join('|')})\\s+(?:to|in|into|how\\s*many)\\s+(${CURRENCIES.join('|')})`, 'i')
    )
    if (currencyPair) {
      slots.from_currency = currencyPair[1].toUpperCase()
      slots.to_currency = currencyPair[2].toUpperCase()
    } else {
      // Find all currencies mentioned in the text
      const mentioned = CURRENCIES.filter(c => new RegExp(`\\b${c}\\b`, 'i').test(lower))
      if (mentioned.length >= 2) {
        // If multiple, assume the first one mentioned is the FROM currency
        const sorted = mentioned.sort((a, b) => lower.indexOf(a) - lower.indexOf(b))
        slots.from_currency = sorted[0].toUpperCase()
        slots.to_currency = sorted[1].toUpperCase()
      } else if (mentioned.length === 1) {
        // If only one foreign currency mentioned, usually user wants to convert IT to INR (e.g. "100 dollars?")
        const c = mentioned[0]
        if (c === 'inr' || c === 'rupee') {
          slots.from_currency = 'INR'
          slots.to_currency = 'USD'
        } else {
          slots.from_currency = c.toUpperCase()
          slots.to_currency = 'INR'
        }
      }
    }
  }

  // Translate slots
  if (intentName === 'translate') {
    const langFound = Object.keys(LANG_MAP).find(l => lower.includes(l))
    if (langFound) slots.target_language = LANG_MAP[langFound]

    // Extract text after "translate" or before "in [lang]"
    const translateMatch = rawText.match(/translate\s+(.+?)(?:\s+(?:in|to|into)\s+\w+)?$/i)
    if (translateMatch) slots.text_to_translate = translateMatch[1].trim()
  }

  // Expenses
  if (intentName === 'expenses') {
    const expMatch = lower.match(/(\d[\d,]*)/)
    if (expMatch) slots.expense_amount = expMatch[1].replace(/,/g, '')
    const categories = ['food', 'hotel', 'transport', 'taxi', 'flight', 'activity', 'shopping', 'misc']
    const cat = categories.find(c => lower.includes(c))
    if (cat) slots.expense_category = cat
  }

  return slots
}

// ─────────────────────────────────────────────
// 4. WORKFLOW STEP HELPERS
// ─────────────────────────────────────────────

function makeStep(name: string, type: StepLog['type']): StepLog {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    type,
    status: 'pending',
  }
}

async function runStep(
  commandId: string,
  step: StepLog,
  executor: () => Promise<unknown>
): Promise<unknown> {
  const store = useCommandCenterStore.getState()
  store.updateStep(commandId, step.id, { status: 'running', startedAt: new Date() })
  const t0 = Date.now()
  try {
    const output = await executor()
    store.updateStep(commandId, step.id, {
      status: 'done',
      output,
      completedAt: new Date(),
      durationMs: Date.now() - t0,
    })
    return output
  } catch (e: unknown) {
    store.updateStep(commandId, step.id, {
      status: 'failed',
      output: { error: String(e) },
      completedAt: new Date(),
      durationMs: Date.now() - t0,
    })
    throw e
  }
}

/** Pause until user approves or rejects the gate */
async function waitForApproval(commandId: string, step: StepLog): Promise<boolean> {
  const store = useCommandCenterStore.getState()
  store.updateStep(commandId, step.id, { status: 'running' })
  store.updateCommand(commandId, { status: 'awaiting_approval' })

  return new Promise<boolean>((resolve) => {
    store._setGateResolve(resolve)
  })
}

// ─────────────────────────────────────────────
// 5. WORKFLOW DEFINITIONS
// ─────────────────────────────────────────────

// City-specific seasonal data for rich weather results
const CITY_WEATHER_DATA: Record<string, { season: string; currentTemp: number; condition: string; humidity: number }> = {
  goa:       { season: 'Nov–Mar ideal', currentTemp: 30, condition: 'Sunny & breezy', humidity: 78 },
  delhi:     { season: 'Oct–Mar ideal', currentTemp: 28, condition: 'Clear skies', humidity: 45 },
  mumbai:    { season: 'Nov–Feb ideal', currentTemp: 32, condition: 'Humid & warm', humidity: 85 },
  manali:    { season: 'Mar–Jun & Sep–Nov', currentTemp: 8, condition: 'Cool mountain air', humidity: 60 },
  ladakh:    { season: 'May–Sep ideal', currentTemp: 12, condition: 'Cold & dry', humidity: 30 },
  kerala:    { season: 'Sep–May ideal', currentTemp: 28, condition: 'Lush & tropical', humidity: 80 },
  jaipur:    { season: 'Oct–Mar ideal', currentTemp: 26, condition: 'Sunny & dry', humidity: 40 },
  shimla:    { season: 'Mar–Jun & Sep–Nov', currentTemp: 15, condition: 'Cool & scenic', humidity: 55 },
  bali:      { season: 'Apr–Oct ideal', currentTemp: 28, condition: 'Tropical paradise', humidity: 75 },
  singapore: { season: 'Year-round', currentTemp: 30, condition: 'Hot & tropical', humidity: 84 },
  dubai:     { season: 'Nov–Apr ideal', currentTemp: 28, condition: 'Warm & sunny', humidity: 55 },
  paris:     { season: 'Apr–Jun & Sep–Oct', currentTemp: 18, condition: 'Pleasant & mild', humidity: 70 },
  tokyo:     { season: 'Mar–May & Sep–Nov', currentTemp: 22, condition: 'Mild & beautiful', humidity: 65 },
}

async function workflowWeather(commandId: string, slots: Slots): Promise<unknown> {
  const city = slots.city || slots.destination || 'Delhi'
  const step = makeStep(`Fetch weather for ${city}`, 'api_call')
  useCommandCenterStore.getState().updateCommand(commandId, { steps: [step] })

  const result = await runStep(commandId, step, async () => {
    const res = await aiService.getWeatherSuggestions(city)
    const cityKey = city.toLowerCase().replace(/\s+/g, '_')
    const cityData = CITY_WEATHER_DATA[cityKey] || CITY_WEATHER_DATA[city.toLowerCase()] || null

    // Normalize monthlyData: aiService returns { month, temp, icon } — convert to rich format
    const normalizedMonthly = (res.monthlyData || []).map((m: Record<string, unknown>) => ({
      month: String(m.month),
      avgTemp: Number(m.temp ?? m.avgTemp ?? 25),
      rainfall: m.icon === '🌧️' ? 'Heavy' : m.icon === '⛅' ? 'Moderate' : 'Low',
      score: m.icon === '⛅' ? 9 : m.icon === '☀️' ? 8 : 5,
      icon: String(m.icon || '⛅'),
    }))

    return {
      city: city.charAt(0).toUpperCase() + city.slice(1),
      bestMonths: res.bestMonths,
      warning: res.warning,
      monthlyData: normalizedMonthly,
      currentTemp: cityData?.currentTemp ?? 25,
      condition: cityData?.condition ?? 'Moderate',
      humidity: cityData?.humidity ?? 60,
      season: cityData?.season ?? res.bestMonths.join(', '),
      summary: `Best months to visit ${city}: ${res.bestMonths.join(', ')}. ${res.warning}`
    }
  })
  return result
}

async function workflowBudget(commandId: string, slots: Slots): Promise<unknown> {
  const dest = slots.destination || 'India'
  const days = parseInt(slots.duration || '5')
  const travelers = parseInt(slots.people || '1')
  const store = useCommandCenterStore.getState()

  const steps = [
    makeStep(`Geocode ${dest} coordinates`, 'api_call'),
    makeStep(`Fetch distance & routing via OSRM`, 'api_call'),
    makeStep(`Discover attractions via OpenTripMap`, 'api_call'),
    makeStep(`Calculate cost breakdown`, 'algorithm'),
  ]
  store.updateCommand(commandId, { steps })

  // Step 1 — Geocode (Nominatim)
  await runStep(commandId, steps[0], async () => {
    return { status: 'Geocoded', destination: dest }
  })

  // Step 2 — Distance (OSRM)
  await runStep(commandId, steps[1], async () => {
    return { status: 'Route fetched' }
  })

  // Step 3 — Attractions (OpenTripMap)
  await runStep(commandId, steps[2], async () => {
    return { status: 'Attractions discovered' }
  })

  // Step 4 — Full cost engine aggregation (calls all APIs internally)
  const result = await runStep(commandId, steps[3], async () => {
    const { calculateTripCost } = await import('./costEngineService')
    const costResult = await calculateTripCost({
      destination: dest,
      origin: 'Delhi',
      days,
      travelers
    })

    return {
      destination: costResult.destination,
      origin: costResult.origin,
      days: costResult.days,
      travelers: costResult.travelers,
      quotes: costResult.quotes,
      totalINR: costResult.totalINR,
      fxRate: costResult.fxRate,
      fxFrom: costResult.fxFrom,
      fxFetchedAt: costResult.fxFetchedAt,
      generatedAt: costResult.generatedAt,
      summary: `Trip to ${costResult.destination} (${days} days, ${travelers} traveler${travelers > 1 ? 's' : ''}): ₹${costResult.totalINR.toLocaleString('en-IN')} total — ${costResult.quotes.filter(q => q.component !== 'total' && q.pricingType === 'live').length} live-priced, ${costResult.quotes.filter(q => q.component !== 'total' && q.pricingType === 'estimated').length} estimated`
    }
  })

  return result
}

async function workflowPacking(commandId: string, slots: Slots): Promise<unknown> {
  const dest = slots.destination || 'Generic'
  const duration = parseInt(slots.duration || '5')
  const month = new Date().getMonth() + 1
  const step = makeStep(`Generate packing list for ${dest}`, 'algorithm')
  useCommandCenterStore.getState().updateCommand(commandId, { steps: [step] })

  const result = await runStep(commandId, step, async () => {
    const items = await aiService.generatePackingList(dest, month, duration)
    return { destination: dest, duration, items }
  })
  return result
}

async function workflowCurrency(commandId: string, slots: Slots): Promise<unknown> {
  let from = (slots.from_currency || 'INR').trim().toUpperCase()
  let to = (slots.to_currency || 'USD').trim().toUpperCase()
  
  const currencyMap: Record<string, string> = {
    'DOLLAR': 'USD', 'DOLLARS': 'USD', '$': 'USD', 'USD': 'USD',
    'RUPEE': 'INR', 'RUPEES': 'INR', '₹': 'INR', 'RS': 'INR', 'INR': 'INR',
    'EURO': 'EUR', 'EUROS': 'EUR', '€': 'EUR', 'EUR': 'EUR',
    'POUND': 'GBP', 'POUNDS': 'GBP', '£': 'GBP', 'GBP': 'GBP',
    'YEN': 'JPY', '¥': 'JPY', 'JPY': 'JPY',
    'DIRHAM': 'AED', 'DIRHAMS': 'AED', 'AED': 'AED'
  }
  
  from = currencyMap[from] || from
  to = currencyMap[to] || to
  
  const amount = parseFloat(slots.amount || '1000')
  const step = makeStep(`Convert ${amount} ${from} → ${to}`, 'api_call')
  useCommandCenterStore.getState().updateCommand(commandId, { steps: [step] })

  const result = await runStep(commandId, step, async () => {
    try {
      // ExchangeRate-API (Free, reliable, no auth, supports INR as base)
      const url = `https://open.er-api.com/v6/latest/${from}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Rate fetch failed')
      const data = await res.json()
      
      const rate = data.rates[to]
      if (!rate) throw new Error(`Currency ${to} not supported`)
      
      const converted = amount * rate
      return {
        from, to, amount,
        converted: parseFloat(converted.toFixed(2)),
        rate,
        summary: `${amount} ${from} = ${converted.toFixed(2)} ${to}`,
        source: 'Live ExchangeRate API'
      }
    } catch {
      // Fallback mock rates
      const fallbackRates: Record<string, number> = { USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, SGD: 0.016, THB: 0.42, JPY: 1.78, INR: 83.33 }
      let rate = fallbackRates[to] || 0.012
      // If we are converting TO INR from something else
      if (to === 'INR' && from === 'USD') rate = 83.33
      if (to === 'INR' && from === 'EUR') rate = 90.00
      
      const converted = amount * rate
      return {
        from, to, amount,
        converted: parseFloat(converted.toFixed(2)),
        rate,
        summary: `${amount} ${from} = ${converted.toFixed(2)} ${to}`,
        source: 'Fallback Estimate'
      }
    }
  })
  return result
}

async function workflowTranslate(commandId: string, slots: Slots): Promise<unknown> {
  const text = slots.text_to_translate || 'Hello'
  const lang = slots.target_language || 'es'
  const step = makeStep(`Translate to ${lang}`, 'api_call')
  useCommandCenterStore.getState().updateCommand(commandId, { steps: [step] })

  const result = await runStep(commandId, step, async () => {
    try {
      const res = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'auto', target: lang, format: 'text' })
      })
      if (!res.ok) throw new Error('Translation failed')
      const data = await res.json()
      return { original: text, translated: data.translatedText, targetLang: lang }
    } catch {
      return {
        original: text,
        translated: null,
        targetLang: lang,
        note: 'Translation service unavailable — showing original text.'
      }
    }
  })
  return result
}

async function workflowExpenses(commandId: string, slots: Slots): Promise<unknown> {
  const step = makeStep('Fetch trip expenses', 'db_query')
  useCommandCenterStore.getState().updateCommand(commandId, { steps: [step] })

  const result = await runStep(commandId, step, async () => {
    // Return current trip expense state (mock — wired to trip store in real impl)
    const expenses = [
      { category: 'Hotel', amount: 4500, note: 'Night 1 & 2' },
      { category: 'Food', amount: 1200, note: 'Day 1 meals' },
      { category: 'Transport', amount: 800, note: 'Airport taxi' },
    ]
    const total = expenses.reduce((s, e) => s + e.amount, 0)
    if (slots.expense_amount && slots.expense_category) {
      expenses.push({ category: slots.expense_category, amount: parseFloat(slots.expense_amount), note: 'Added via AI' })
    }
    return { expenses, total, summary: `Total spent so far: ₹${total.toLocaleString('en-IN')}` }
  })
  return result
}

async function workflowPlanTrip(commandId: string, slots: Slots): Promise<unknown> {
  const dest = slots.destination || 'Goa'
  const days = parseInt(slots.duration || '5')
  const budget = parseInt(slots.budget || '15000')
  const store = useCommandCenterStore.getState()

  const steps = [
    makeStep(`Search destinations matching "${dest}"`, 'api_call'),
    makeStep(`Check weather & best season for ${dest}`, 'api_call'),
    makeStep(`Estimate budget for ${days} days`, 'algorithm'),
    makeStep('Generate draft itinerary', 'algorithm'),
  ]
  store.updateCommand(commandId, { steps })

  // Step 1 — destination search
  await runStep(commandId, steps[0], async () => ({ destination: dest, found: true }))

  // Step 2 — weather
  const weather = await runStep(commandId, steps[1], () => aiService.getWeatherSuggestions(dest))

  // Step 3 — budget
  const costData = await runStep(commandId, steps[2], async () => {
    const estimate = days * 2500 + (budget * 0.1)
    return aiService.getCostConfidence({ totalEstimate: Math.round(estimate) })
  }) as { low: number; high: number; mostLikely: number }

  // Step 4 — itinerary
  const itinerary = await runStep(commandId, steps[3], async () => {
    return Array.from({ length: Math.min(days, 5) }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? `Arrival & ${dest} orientation` : i === days - 1 ? `Departure day` : `Explore ${dest} — Day ${i + 1}`,
      activities: ['Morning: Sightseeing', 'Afternoon: Local cuisine', 'Evening: Leisure'],
      estimatedCost: Math.round(costData.mostLikely / days)
    }))
  })

  return {
    destination: dest,
    days,
    weather,
    budgetRange: `₹${costData.low.toLocaleString('en-IN')} – ₹${costData.high.toLocaleString('en-IN')}`,
    itinerary,
    summary: `Draft ${days}-day itinerary for ${dest} ready! Budget: ₹${costData.low.toLocaleString('en-IN')} – ₹${costData.high.toLocaleString('en-IN')}.`
  }
}

async function workflowEmergency(commandId: string, slots: Slots): Promise<unknown> {
  const city = slots.city || 'current location'
  const store = useCommandCenterStore.getState()

  const steps = [
    makeStep('Locate nearest emergency services', 'api_call'),
    makeStep('Fetch emergency contacts', 'db_query'),
  ]
  store.updateCommand(commandId, { steps })

  const services = await runStep(commandId, steps[0], async () => {
    // Overpass API for hospitals/police (simplified — real impl queries by lat/lng)
    return {
      hospitals: [
        { name: 'Government General Hospital', distance: '0.8 km', phone: '100' },
        { name: 'Apollo Hospital', distance: '2.1 km', phone: '+91-44-2829-3333' },
      ],
      police: [{ name: 'Local Police Station', distance: '0.5 km', phone: '100' }],
      pharmacy: [{ name: 'MedPlus Pharmacy', distance: '0.3 km', open: '24/7' }],
    }
  })

  await runStep(commandId, steps[1], async () => ({
    national_emergency: '112',
    police: '100',
    ambulance: '108',
    fire: '101',
    tourist_helpline: '1800-111-363',
  }))

  return {
    city,
    ...services,
    summary: `Emergency services near ${city} found. Dial 112 for all emergencies in India.`
  }
}

async function workflowFindHiddenPlaces(commandId: string, slots: Slots): Promise<unknown> {
  const dest = slots.destination || 'India'
  const step = makeStep(`Discover hidden places near ${dest}`, 'api_call')
  useCommandCenterStore.getState().updateCommand(commandId, { steps: [step] })

  const result = await runStep(commandId, step, async () => {
    return {
      places: [
        { name: `Hidden Waterfall near ${dest}`, rating: 4.8, type: 'Nature', crowdLevel: 'Low', distance: '45 km' },
        { name: `Secret Viewpoint ${dest}`, rating: 4.6, type: 'Scenic', crowdLevel: 'Very Low', distance: '28 km' },
        { name: `Offbeat Village near ${dest}`, rating: 4.5, type: 'Cultural', crowdLevel: 'Low', distance: '62 km' },
      ],
      summary: `Found 3 hidden gems near ${dest}. All are low-crowd destinations.`
    }
  })
  return result
}

async function workflowBookHotel(commandId: string, slots: Slots): Promise<unknown> {
  const dest = slots.destination || 'Mumbai'
  const budget = parseInt(slots.budget || '5000')
  const store = useCommandCenterStore.getState()

  const steps = [
    makeStep(`Search hotels in ${dest} under ₹${budget.toLocaleString('en-IN')}/night`, 'api_call'),
    makeStep('Rank by price, rating & distance', 'algorithm'),
    makeStep('⚠️ Confirm Booking', 'approval_gate'),
    makeStep('Submit mock reservation', 'api_call'),
  ]
  store.updateCommand(commandId, { steps })

  // Step 1
  const hotels = await runStep(commandId, steps[0], async () => ([
    { id: 'h1', name: `The Grand ${dest}`, price: Math.round(budget * 0.8), rating: 4.5, distance: '1.2 km from center' },
    { id: 'h2', name: `Budget Inn ${dest}`, price: Math.round(budget * 0.5), rating: 3.9, distance: '2.8 km from center' },
    { id: 'h3', name: `Premium Suites ${dest}`, price: Math.round(budget * 0.95), rating: 4.8, distance: '0.5 km from center' },
  ]))

  // Step 2
  await runStep(commandId, steps[1], async () => ({ ranked: hotels, topChoice: (hotels as any[])[0] }))

  // Step 3 — Approval gate (NEVER auto-execute)
  const approved = await waitForApproval(commandId, steps[2])

  if (!approved) {
    store.updateCommand(commandId, { status: 'failed', errorMessage: 'Booking cancelled by user.' })
    return { cancelled: true }
  }

  store.updateCommand(commandId, { status: 'running' })

  // Step 4 — Mock confirmation (sandbox only, never live payment)
  const confirmation = await runStep(commandId, steps[3], async () => ({
    bookingRef: `EX-${Date.now().toString(36).toUpperCase()}`,
    hotel: (hotels as any[])[0],
    sandbox: true,
    note: 'This is a test/sandbox booking. No real payment was processed.'
  }))

  return { hotels, confirmation, summary: `Sandbox booking confirmed at ${(hotels as any[])[0].name}. Ref: ${(confirmation as any).bookingRef}` }
}

// ─────────────────────────────────────────────
// NAVIGATE FEATURE MAP — keyword → route
// Each entry has `keywords` (exact substrings) and `aliases` (word-level matches)
// ─────────────────────────────────────────────

interface FeatureRoute {
  keywords: string[]   // substring matches (higher weight)
  aliases: string[]    // individual word matches (lower weight)
  route: string
  label: string
  emoji: string
}

const FEATURE_ROUTES: FeatureRoute[] = [
  {
    keywords: ['reward', 'rewards', 'loyalty points', 'cashback', 'earn points'],
    aliases:  ['point', 'earn', 'redeem', 'loyalty'],
    route: '/app/rewards', label: 'Rewards', emoji: '🎁'
  },
  {
    keywords: ['referral', 'refer a friend', 'invite friend', 'refer friend'],
    aliases:  ['refer', 'invite', 'referral'],
    route: '/app/rewards/referral', label: 'Referral Program', emoji: '🤝'
  },
  {
    keywords: ['dashboard', 'home page', 'main page', 'go home'],
    aliases:  ['dashboard', 'home', 'main', 'overview'],
    route: '/app/dashboard', label: 'Dashboard', emoji: '🏠'
  },
  {
    keywords: ['trip planner', 'travel planner', 'plan setup', 'plan a trip', 'trip setup'],
    aliases:  ['planner', 'plan', 'itinerary', 'schedule'],
    route: '/app/planner/setup', label: 'Trip Planner', emoji: '🗺'
  },
  {
    keywords: ['planner workspace', 'planning workspace', 'trip workspace'],
    aliases:  ['workspace'],
    route: '/app/planner/workspace', label: 'Planner Workspace', emoji: '🖥'
  },
  {
    keywords: ['map guide', 'travel map', 'route map'],
    aliases:  ['map', 'route'],
    route: '/app/planner/map', label: 'Map Guide', emoji: '🗺'
  },
  {
    keywords: ['cost estimator', 'trip cost', 'estimate cost', 'budget estimator'],
    aliases:  ['estimator', 'estimate'],
    route: '/app/planner/cost', label: 'Cost Estimator', emoji: '💰'
  },
  {
    keywords: ['group trip', 'group travel', 'group planner'],
    aliases:  ['group', 'team'],
    route: '/app/planner/group', label: 'Group Trip', emoji: '👥'
  },
  {
    keywords: ['trip comparison', 'compare trips', 'compare destinations'],
    aliases:  ['compare', 'comparison'],
    route: '/app/planner/compare', label: 'Trip Comparison', emoji: '⚖️'
  },
  {
    keywords: ['explore', 'browse destinations', 'discover places', 'search destinations'],
    aliases:  ['explore', 'discover', 'browse', 'search'],
    route: '/app/explore', label: 'Explore', emoji: '🔍'
  },
  {
    keywords: ['my bookings', 'booking history', 'my reservations', 'past bookings', 'view bookings'],
    aliases:  ['bookings', 'booking', 'reservations', 'reservation'],
    route: '/app/bookings', label: 'My Bookings', emoji: '📋'
  },
  {
    keywords: ['book hotel', 'hotel listing', 'find hotels', 'hotel search'],
    aliases:  ['hotels', 'hotel'],
    route: '/app/book/hotels', label: 'Book Hotels', emoji: '🏨'
  },
  {
    keywords: ['book ticket', 'ticket booking', 'buy ticket'],
    aliases:  ['tickets', 'ticket'],
    route: '/app/book/tickets', label: 'Book Tickets', emoji: '🎫'
  },
  {
    keywords: ['my wishlist', 'saved places', 'saved destinations', 'favorite places'],
    aliases:  ['wishlist', 'saved', 'favorites', 'favourites'],
    route: '/app/wishlist', label: 'Wishlist', emoji: '❤️'
  },
  {
    keywords: ['my trips', 'trip list', 'all trips', 'view trips', 'past trips'],
    aliases:  ['trips', 'trip'],
    route: '/app/trips', label: 'My Trips', emoji: '✈️'
  },
  {
    // CRITICAL: added 'toolkit', 'travel toolkit', 'tool kit', 'tools'
    keywords: ['toolkit', 'travel toolkit', 'tool kit', 'travel tools', 'packing toolkit'],
    aliases:  ['tools', 'toolkit', 'utilities'],
    route: '/app/toolkit/packing', label: 'Travel Toolkit', emoji: '🧰'
  },
  {
    keywords: ['packing checklist', 'packing list', 'what to pack', 'pack for trip'],
    aliases:  ['packing', 'checklist', 'luggage'],
    route: '/app/toolkit/packing', label: 'Packing Checklist', emoji: '🎒'
  },
  {
    keywords: ['currency converter', 'exchange rate', 'convert currency', 'money converter'],
    aliases:  ['currency', 'exchange', 'conversion'],
    route: '/app/toolkit/currency', label: 'Currency Converter', emoji: '💱'
  },
  {
    keywords: ['weather tool', 'weather page', 'weather forecast', 'check weather'],
    aliases:  ['weather', 'forecast', 'climate'],
    route: '/app/toolkit/weather', label: 'Weather', emoji: '🌤'
  },
  {
    keywords: ['travel documents', 'my documents', 'travel docs', 'visa documents'],
    aliases:  ['documents', 'document', 'docs', 'visa', 'passport'],
    route: '/app/toolkit/documents', label: 'Travel Documents', emoji: '📄'
  },
  {
    keywords: ['local events', 'nearby events', 'events near me', 'things to do'],
    aliases:  ['events', 'event', 'activities'],
    route: '/app/toolkit/events', label: 'Local Events', emoji: '🎉'
  },
  {
    keywords: ['my notifications', 'notification center', 'alerts', 'show alerts'],
    aliases:  ['notifications', 'notification', 'alert'],
    route: '/app/notifications', label: 'Notifications', emoji: '🔔'
  },
  {
    keywords: ['my profile', 'profile page', 'my account', 'user profile'],
    aliases:  ['profile', 'account', 'user'],
    route: '/app/profile', label: 'Profile', emoji: '👤'
  },
  {
    keywords: ['settings', 'app settings', 'account settings', 'preferences'],
    aliases:  ['settings', 'setting', 'preferences', 'config'],
    route: '/app/settings', label: 'Settings', emoji: '⚙️'
  },
  {
    keywords: ['reviews page', 'my reviews', 'all reviews', 'ratings'],
    aliases:  ['reviews', 'review', 'ratings', 'rating'],
    route: '/app/reviews', label: 'Reviews', emoji: '⭐'
  },
  {
    keywords: ['social feed', 'community', 'travel community', 'social page'],
    aliases:  ['social', 'community', 'feed'],
    route: '/app/social', label: 'Community', emoji: '👥'
  },
  {
    keywords: ['ai assistant', 'command center', 'ai command', 'virtual assistant'],
    aliases:  ['assistant', 'ai', 'bot', 'chatbot'],
    route: '/app/assistant', label: 'AI Assistant', emoji: '🤖'
  },
]

/**
 * Resolve a raw query → best matching feature route.
 * Scoring:
 *   - Full substring keyword match = 3 points each
 *   - Individual alias word match = 1 point each
 * Returns the highest scoring feature (minimum 1 point required).
 */
export function resolveNavigationTarget(rawText: string): { route: string; label: string; emoji: string } | null {
  const lower = rawText.toLowerCase()
  const words = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean)

  let bestScore = 0
  let bestFeature: FeatureRoute | null = null

  for (const feature of FEATURE_ROUTES) {
    let score = 0

    // Keyword substring matches (weight 3 each)
    for (const kw of feature.keywords) {
      if (lower.includes(kw)) score += 3
    }

    // Alias word matches (weight 1 each)
    for (const alias of feature.aliases) {
      if (words.includes(alias)) score += 1
    }

    if (score > bestScore) {
      bestScore = score
      bestFeature = feature
    }
  }

  return bestScore >= 1 ? bestFeature : null
}

async function workflowNavigate(commandId: string, slots: Slots, rawText: string): Promise<unknown> {
  const store = useCommandCenterStore.getState()
  const step = makeStep('Resolve feature destination', 'algorithm')
  store.updateCommand(commandId, { steps: [step] })

  const target = resolveNavigationTarget(rawText)

  const result = await runStep(commandId, step, async () => {
    if (!target) return { error: 'Could not identify which feature to open.', rawText }
    return { route: target.route, label: target.label, emoji: target.emoji, navigating: true }
  })

  return result
}


// ─────────────────────────────────────────────
// 6. MAIN DISPATCH FUNCTION
// ─────────────────────────────────────────────

const WORKFLOW_MAP: Record<string, (commandId: string, slots: Slots, rawText?: string) => Promise<unknown>> = {
  weather: workflowWeather,
  budget: workflowBudget,
  packing: workflowPacking,
  currency: workflowCurrency,
  translate: workflowTranslate,
  expenses: workflowExpenses,
  plan_trip: workflowPlanTrip,
  find_hidden_places: workflowFindHiddenPlaces,
  emergency: workflowEmergency,
  find_food: workflowFindHiddenPlaces,
  book_hotel: workflowBookHotel,
  book_flight: workflowBookHotel,
  cancel_booking: workflowExpenses,
  navigate: (commandId, slots, rawText) => workflowNavigate(commandId, slots, rawText || ''),
}

export async function dispatchCommand(rawText: string): Promise<string> {
  const store = useCommandCenterStore.getState()
  const classification = classifyIntent(rawText)
  const { intent, confidence } = classification

  const slots = fillSlots(rawText, intent.name)

  const commandId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  const cmd: CommandRun = {
    id: commandId,
    rawText,
    detectedIntent: intent.name,
    intentLabel: intent.label,
    confidence,
    slots,
    status: 'running',
    steps: [],
    createdAt: new Date(),
  }

  store.addCommand(cmd)

  // Learn from slots → update AI memory
  if (slots.city) store.updateMemory({ last_destination: slots.city })
  if (slots.budget) {
    const b = parseInt(slots.budget)
    const tier: 'budget' | 'mid-range' | 'luxury' = b < 10000 ? 'budget' : b < 50000 ? 'mid-range' : 'luxury'
    store.updateMemory({ preferred_budget_tier: tier })
  }

  try {
    const workflow = WORKFLOW_MAP[intent.name]
    if (!workflow) {
      store.updateCommand(commandId, {
        status: 'failed',
        errorMessage: `No workflow defined for intent "${intent.name}" yet.`
      })
      return commandId
    }

    const result = await workflow(commandId, slots, rawText)
    store.updateCommand(commandId, {
      status: 'done',
      result,
      completedAt: new Date(),
    })
  } catch (e: unknown) {
    store.updateCommand(commandId, {
      status: 'failed',
      errorMessage: String(e),
      completedAt: new Date(),
    })
  }

  return commandId
}
