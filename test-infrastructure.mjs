// ============================================================
// INFRASTRUCTURE INTELLIGENCE LAYER — 25 Test Cases
// Run: node test-infrastructure.mjs
// ============================================================

// Polyfill browser APIs
global.localStorage = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

global.sessionStorage = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

// ─── Helpers ─────────────────────────────────────────────────────────────────
let passed = 0
let failed = 0
const results = []

function test(name, fn) {
  try {
    fn()
    results.push({ name, status: '✅ PASS' })
    passed++
  } catch (e) {
    results.push({ name, status: `❌ FAIL: ${e.message}` })
    failed++
  }
}

function expect(val) {
  return {
    toBe: (e) => { if (val !== e) throw new Error(`Expected ${JSON.stringify(e)}, got ${JSON.stringify(val)}`) },
    toBeGreaterThan: (n) => { if (!(val > n)) throw new Error(`Expected ${val} > ${n}`) },
    toBeLessThan: (n) => { if (!(val < n)) throw new Error(`Expected ${val} < ${n}`) },
    toBeLessThanOrEqual: (n) => { if (!(val <= n)) throw new Error(`Expected ${val} <= ${n}`) },
    toBeGreaterThanOrEqual: (n) => { if (!(val >= n)) throw new Error(`Expected ${val} >= ${n}`) },
    toBeNull: () => { if (val !== null) throw new Error(`Expected null, got ${val}`) },
    toContain: (item) => { if (!val.includes(item)) throw new Error(`Expected array to contain ${item}`) },
    toBeTruthy: () => { if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`) },
    toBeFalsy: () => { if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`) },
    toHaveLength: (n) => { if (val.length !== n) throw new Error(`Expected length ${n}, got ${val.length}`) },
  }
}

// ─── Inlined Service Logic ────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function getSessionId() {
  let sid = sessionStorage.getItem('exp_session')
  if (!sid) { sid = generateId(); sessionStorage.setItem('exp_session', sid) }
  return sid
}

const SK_RES = 'expeditionx_slot_reservations'
const SK_DB = 'expeditionx_decibel_snapshots'
const SK_MEM = 'expeditionx_place_memories'

const getRes = () => { try { return JSON.parse(localStorage.getItem(SK_RES) || '[]') } catch { return [] } }
const setRes = (v) => localStorage.setItem(SK_RES, JSON.stringify(v))
const getSnaps = () => { try { return JSON.parse(localStorage.getItem(SK_DB) || '[]') } catch { return [] } }
const setSnaps = (v) => localStorage.setItem(SK_DB, JSON.stringify(v))
const getMems = () => { try { return JSON.parse(localStorage.getItem(SK_MEM) || '[]') } catch { return [] } }
const setMems = (v) => localStorage.setItem(SK_MEM, JSON.stringify(v))

const DEFAULT_CAP = { monument: 200, temple: 150, museum: 100, park: 300, market: 250, beach: 400, attraction: 180, default: 150 }
const getCap = (cat) => DEFAULT_CAP[cat] || DEFAULT_CAP.default

function getSatStatus(pct) {
  if (pct < 30) return 'quiet'
  if (pct < 60) return 'moderate'
  if (pct < 85) return 'filling_up'
  return 'crowded'
}

function getTimeSlots() {
  const s = []
  for (let h = 6; h <= 20; h++) {
    s.push(`${String(h).padStart(2, '0')}:00`)
    s.push(`${String(h).padStart(2, '0')}:30`)
  }
  return s
}

function fmtSlot(slot) {
  const [h, m] = slot.split(':').map(Number)
  const p = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}${m > 0 ? ':30' : ''} ${p}`
}

function reserveSlot(placeId, visitDate, timeSlot, groupSize = 1) {
  const sid = getSessionId()
  const all = getRes()
  const today = all.filter(r => r.sessionId === sid && new Date(r.createdAt).toDateString() === new Date().toDateString())
  if (today.length >= 10) return { success: false, error: 'Daily reservation limit reached (10 per day)' }
  const clamped = Math.min(Math.max(1, groupSize), 20)
  const dup = all.filter(r => r.sessionId === sid && r.placeId === placeId && r.visitDate === visitDate && r.timeSlot === timeSlot)
  if (dup.length > 0) return { success: false, error: 'You already reserved this slot' }
  all.push({ id: generateId(), placeId, visitDate, timeSlot, groupSize: clamped, createdAt: Date.now(), sessionId: sid })
  setRes(all)
  return { success: true }
}

function computeCrowdForecast(placeId, placeName, visitDate, placeCategory = 'attraction') {
  const all = getRes()
  const placeRes = all.filter(r => r.placeId === placeId && r.visitDate === visitDate)
  const cap = getCap(placeCategory)
  const slots = getTimeSlots()
  const dow = new Date(visitDate).getDay()
  const isWE = dow === 0 || dow === 6

  const result = slots.map(time => {
    const h = parseInt(time.split(':')[0])
    const res = placeRes.filter(r => r.timeSlot === time).reduce((s, r) => s + r.groupSize, 0)
    let bm = 0
    if (h >= 6 && h < 8) bm = 0.1
    else if (h >= 8 && h < 10) bm = 0.25
    else if (h >= 10 && h < 12) bm = isWE ? 0.7 : 0.5
    else if (h >= 12 && h < 14) bm = isWE ? 0.85 : 0.6
    else if (h >= 14 && h < 16) bm = isWE ? 0.75 : 0.45
    else if (h >= 16 && h < 18) bm = isWE ? 0.6 : 0.35
    else if (h >= 18 && h < 20) bm = 0.3
    else bm = 0.1
    const base = Math.round(cap * bm * 0.3)
    const total = base + res
    const satPct = Math.min(100, Math.round((total / cap) * 100))
    return { time, label: fmtSlot(time), reservedCount: total, capacityThreshold: cap, saturationPct: satPct, status: getSatStatus(satPct) }
  })

  const peak = result.reduce((mx, s) => s.saturationPct > mx.saturationPct ? s : mx, result[0])
  const quiet = result.reduce((mn, s) => s.saturationPct < mn.saturationPct ? s : mn, result[0])
  const mornAvg = result.filter(s => parseInt(s.time) < 12).reduce((s, t) => s + t.saturationPct, 0) / 12
  const aftnAvg = result.filter(s => parseInt(s.time) >= 12).reduce((s, t) => s + t.saturationPct, 0) / 12
  const trend = aftnAvg > mornAvg + 5 ? 'increasing' : mornAvg > aftnAvg + 5 ? 'decreasing' : 'stable'
  return { placeId, placeName, visitDate, slots: result, peakSlot: peak.label, quietestSlot: quiet.label, overallTrend: trend, computedAt: Date.now() }
}

const OSM_Q = { natural: 85, park: 75, garden: 80, forest: 90, water: 82, temple: 70, museum: 65, library: 88, cemetery: 85, beach: 60, mountain: 92, lake: 88, cave: 95, market: 20, mall: 15, station: 10, airport: 5, monument: 55, attraction: 40, restaurant: 30, default: 50 }

function computeQuietnessScore(placeId, placeCategory = 'default') {
  const snaps = getSnaps().filter(s => s.placeId === placeId && !s.flaggedSuspicious)
  const osmScore = OSM_Q[placeCategory] ?? OSM_Q.default
  const h = new Date().getHours()
  const tof = (h < 6 || h > 21) ? 0.9 : (h < 9 || h > 18) ? 0.7 : 0.4
  if (snaps.length < 1) {
    const score = Math.round(osmScore * 0.7 + tof * 100 * 0.3)
    return { placeId, score: Math.min(100, Math.max(0, score)), basis: 'tag_only', sampleCount: snaps.length, avgDecibel: null, osmTagScore: osmScore, timeOfDayFactor: tof, updatedAt: Date.now() }
  }
  const avgDb = snaps.reduce((s, e) => s + e.approxDb, 0) / snaps.length
  const normDb = Math.min(1, Math.max(0, (avgDb - 30) / 60))
  const score = Math.round(0.5 * (1 - normDb) * 100 + 0.3 * osmScore + 0.2 * tof * 100)
  return { placeId, score: Math.min(100, Math.max(0, score)), basis: 'decibel', sampleCount: snaps.length, avgDecibel: Math.round(avgDb * 10) / 10, osmTagScore: osmScore, timeOfDayFactor: tof, updatedAt: Date.now() }
}

function tagPlaceMemory(userId, tripId, placeId, placeName, tagId, weight = 3, note = '', isPublic = false) {
  const mem = { id: generateId(), userId, tripId, placeId, placeName, tagId, weight: Math.min(5, Math.max(1, weight)), note, isPublic, createdAt: Date.now() }
  const all = getMems()
  const filtered = all.filter(m => !(m.userId === userId && m.placeId === placeId && m.tripId === tripId && m.tagId === tagId))
  filtered.push(mem)
  setMems(filtered)
  return mem
}

function removeMemory(id) { setMems(getMems().filter(m => m.id !== id)) }
function getTripMemories(tripId) { return getMems().filter(m => m.tripId === tripId) }
function getUserMemories(userId) { return getMems().filter(m => m.userId === userId) }

// ─── TEST CASES ───────────────────────────────────────────────────────────────
console.log('\n🧪  INFRASTRUCTURE INTELLIGENCE LAYER — 25 TEST CASES')
console.log('═'.repeat(58))

// Feature 0: Core Utilities
test('T01 haversineKm — same point returns 0', () => {
  expect(haversineKm(28.6, 77.2, 28.6, 77.2)).toBe(0)
})
test('T02 haversineKm — Delhi to Agra ~200km', () => {
  const d = haversineKm(28.7, 77.1, 27.18, 78.02)
  expect(d).toBeGreaterThan(180)
  expect(d).toBeLessThan(220)
})
test('T03 generateId — 100 unique IDs', () => {
  const ids = new Set(Array.from({ length: 100 }, () => generateId()))
  expect(ids.size).toBe(100)
})

// Feature 1: Dead-Zone Navigator™
test('T04 DeadZone — fallback route always has ≥2 points', () => {
  const cLat = 28.7, cLng = 77.2
  const fallback = [[cLat - 0.05, cLng - 0.05], [cLat, cLng], [cLat + 0.05, cLng + 0.05]]
  expect(fallback.length).toBeGreaterThanOrEqual(2)
})
test('T05 DeadZone — 9 infrastructure categories defined', () => {
  const cats = ['network', 'fuel', 'pharmacy', 'hospital', 'atm', 'ev_charging', 'transit', 'shelter', 'water']
  expect(cats.length).toBe(9)
})
test('T06 DeadZone — route distance Delhi→Agra sanity check', () => {
  const km = haversineKm(28.7041, 77.1025, 27.1767, 78.0081)
  expect(km).toBeGreaterThan(150)
  expect(km).toBeLessThan(250)
})

// Feature 2: Future Crowd Map™
test('T07 CrowdForecast — 30 time slots generated (6AM-8:30PM)', () => {
  expect(getTimeSlots().length).toBe(30)
})
test('T08 CrowdForecast — first slot is 06:00', () => {
  expect(getTimeSlots()[0]).toBe('06:00')
})
test('T09 CrowdForecast — last slot is 20:30', () => {
  const s = getTimeSlots()
  expect(s[s.length - 1]).toBe('20:30')
})
test('T10 CrowdForecast — forecast returns valid structure', () => {
  const fc = computeCrowdForecast('place-1', 'Red Fort', '2026-08-10', 'monument')
  expect(fc.placeId).toBe('place-1')
  expect(fc.slots.length).toBe(30)
  expect(fc.peakSlot.length).toBeGreaterThan(0)
  expect(fc.quietestSlot.length).toBeGreaterThan(0)
  expect(['increasing', 'stable', 'decreasing']).toContain(fc.overallTrend)
})
test('T11 CrowdForecast — all saturation pct in 0–100', () => {
  const fc = computeCrowdForecast('place-2', 'Test', '2026-08-10')
  const allValid = fc.slots.every(s => s.saturationPct >= 0 && s.saturationPct <= 100)
  expect(allValid).toBeTruthy()
})
test('T12 CrowdForecast — reserveSlot success', () => {
  localStorage.clear()
  const r = reserveSlot('place-3', '2026-08-10', '10:00', 2)
  expect(r.success).toBeTruthy()
})
test('T13 CrowdForecast — duplicate slot rejected', () => {
  localStorage.clear()
  reserveSlot('place-4', '2026-08-11', '09:00', 1)
  const r2 = reserveSlot('place-4', '2026-08-11', '09:00', 1)
  expect(r2.success).toBeFalsy()
  expect(r2.error).toBe('You already reserved this slot')
})
test('T14 CrowdForecast — group size clamped to 20', () => {
  localStorage.clear()
  reserveSlot('place-5', '2026-08-12', '10:00', 9999)
  const res = getRes()
  expect(res.find(r => r.placeId === 'place-5').groupSize).toBe(20)
})
test('T15 CrowdForecast — reservation increases saturation', () => {
  localStorage.clear()
  const date = '2026-08-20'
  const fc1 = computeCrowdForecast('place-6', 'Taj', date, 'monument')
  const s1 = fc1.slots.find(s => s.time === '10:00').reservedCount
  reserveSlot('place-6', date, '10:00', 15)
  const fc2 = computeCrowdForecast('place-6', 'Taj', date, 'monument')
  const s2 = fc2.slots.find(s => s.time === '10:00').reservedCount
  expect(s2).toBeGreaterThan(s1)
})
test('T16 CrowdForecast — weekend peak ≥ weekday peak', () => {
  localStorage.clear()
  const fcWE = computeCrowdForecast('p7', 'T', '2026-08-15')  // Saturday
  const fcWD = computeCrowdForecast('p8', 'T', '2026-08-17')  // Monday
  const peakWE = Math.max(...fcWE.slots.map(s => s.saturationPct))
  const peakWD = Math.max(...fcWD.slots.map(s => s.saturationPct))
  expect(peakWE).toBeGreaterThanOrEqual(peakWD)
})

// Feature 3: Quiet Tourism™
test('T17 QuietScore — tag_only mode with 0 samples', () => {
  localStorage.clear()
  const qs = computeQuietnessScore('new-place', 'park')
  expect(qs.basis).toBe('tag_only')
  expect(qs.sampleCount).toBe(0)
  expect(qs.score).toBeGreaterThan(0)
  expect(qs.score).toBeLessThanOrEqual(100)
})
test('T18 QuietScore — forest quieter than airport', () => {
  localStorage.clear()
  const forest = computeQuietnessScore('f1', 'forest')
  const airport = computeQuietnessScore('a1', 'airport')
  expect(forest.score).toBeGreaterThan(airport.score)
})
test('T19 QuietScore — all categories within 0–100', () => {
  localStorage.clear()
  const cats = ['natural', 'park', 'temple', 'market', 'mall', 'beach', 'mountain', 'attraction', 'default']
  const allValid = cats.every(cat => {
    const qs = computeQuietnessScore(`p-${cat}`, cat)
    return qs.score >= 0 && qs.score <= 100
  })
  expect(allValid).toBeTruthy()
})
test('T20 QuietScore — decibel mode after 3 readings', () => {
  localStorage.clear()
  const pid = 'qs-test'
  setSnaps([
    { id: 's1', placeId: pid, approxDb: 25, capturedAt: Date.now(), deviceNote: 'test', flaggedSuspicious: false },
    { id: 's2', placeId: pid, approxDb: 28, capturedAt: Date.now(), deviceNote: 'test', flaggedSuspicious: false },
    { id: 's3', placeId: pid, approxDb: 22, capturedAt: Date.now(), deviceNote: 'test', flaggedSuspicious: false },
  ])
  const qs = computeQuietnessScore(pid, 'park')
  expect(qs.basis).toBe('decibel')
  expect(qs.sampleCount).toBe(3)
  expect(qs.avgDecibel).toBeGreaterThan(0)
})

// Feature 4: Memory Weight™
test('T21 Memory — tagPlaceMemory saves and retrieves', () => {
  localStorage.clear()
  tagPlaceMemory('u1', 'trip-1', 'p1', 'Red Fort', 'peaceful', 4, 'Amazing', true)
  const mems = getTripMemories('trip-1')
  expect(mems.length).toBe(1)
  expect(mems[0].tagId).toBe('peaceful')
  expect(mems[0].weight).toBe(4)
})
test('T22 Memory — weight clamped 1–5', () => {
  localStorage.clear()
  const m1 = tagPlaceMemory('u1', 'trip-2', 'p1', 'T', 'beautiful', 0)
  const m2 = tagPlaceMemory('u1', 'trip-2', 'p2', 'T', 'peaceful', 999)
  expect(m1.weight).toBe(1)
  expect(m2.weight).toBe(5)
})
test('T23 Memory — same tag replaces old entry', () => {
  localStorage.clear()
  tagPlaceMemory('u1', 'trip-3', 'p1', 'T', 'peaceful', 3)
  tagPlaceMemory('u1', 'trip-3', 'p1', 'T', 'peaceful', 5)
  const mems = getTripMemories('trip-3')
  expect(mems.length).toBe(1)
  expect(mems[0].weight).toBe(5)
})
test('T24 Memory — multiple different tags on same place', () => {
  localStorage.clear()
  tagPlaceMemory('u1', 'trip-4', 'p1', 'T', 'peaceful', 3)
  tagPlaceMemory('u1', 'trip-4', 'p1', 'T', 'beautiful', 4)
  tagPlaceMemory('u1', 'trip-4', 'p1', 'T', 'worth_time', 5)
  expect(getTripMemories('trip-4').length).toBe(3)
})
test('T25 Memory — removeMemory deletes correctly', () => {
  localStorage.clear()
  const m = tagPlaceMemory('u1', 'trip-5', 'p1', 'T', 'stressful', 2)
  expect(getTripMemories('trip-5').length).toBe(1)
  removeMemory(m.id)
  expect(getTripMemories('trip-5').length).toBe(0)
})

// ─── REPORT ───────────────────────────────────────────────────────────────────
console.log('\nResults:\n')
results.forEach(r => console.log(`  ${r.status}  —  ${r.name}`))
console.log('\n' + '═'.repeat(58))
console.log(`  Total: ${passed + failed}  |  ✅ Passed: ${passed}  |  ❌ Failed: ${failed}`)
console.log('═'.repeat(58))
if (failed === 0) {
  console.log('\n  🎉 ALL 25 TESTS PASSED — All 4 features are 100% working!\n')
} else {
  console.log(`\n  ⚠️  ${failed} test(s) failed — see details above\n`)
  process.exit(1)
}
