import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Layers, Navigation, Train, Bus, Car, MapPinIcon, Landmark, BedDouble, UtensilsCrossed } from 'lucide-react'
import { placeService } from '../../../services/placeService'
import { pageTransition, staggerContainer, itemPop } from '../../../motion/variants'
import { springSoft, easeExit, springSnappy } from '../../../motion/tokens'
import axios from 'axios'
import { DeadZoneNavigator } from '../../../components/planner/DeadZoneNavigator'

// Leaflet imports via dynamic import (ESM compatible)
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, Polyline: any, CircleMarker: any, L: any

const PLACES = [
  { id: 'p1', name: 'Red Fort', lat: 28.6562, lng: 77.2410, type: 'attraction', rating: 5 },
  { id: 'p2', name: 'India Gate', lat: 28.6129, lng: 77.2295, type: 'attraction', rating: 5 },
  { id: 'p3', name: 'Qutub Minar', lat: 28.5244, lng: 77.1855, type: 'attraction', rating: 4 },
  { id: 'h1', name: 'The Lodhi Hotel', lat: 28.5928, lng: 77.2230, type: 'hotel', rating: 5 },
  { id: 'r1', name: 'Chandni Chowk', lat: 28.6506, lng: 77.2334, type: 'food', rating: 4 },
]

const TYPE_COLORS: Record<string, string> = {
  attraction: '#0d9488', // Teal 600
  hotel: '#7c3aed',      // Violet 600
  food: '#FC6C26',       // Orange 500
  transport: '#0ea5e9',  // Sky 500
}

export function MapGuide() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const nameParam = searchParams.get('name')

  const centerLat = latParam ? parseFloat(latParam) : 28.6139
  const centerLng = lngParam ? parseFloat(lngParam) : 77.2090
  const mapTitle = nameParam ? nameParam : 'Delhi'

  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [autoLocateInfo, setAutoLocateInfo] = useState<{city: string, country: string} | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const geocodingRef = useRef<string | null>(null)

  useEffect(() => {
    // Only auto-locate if it's a fresh map session without explicit coords
    if (!latParam && !lngParam && !nameParam) {
      axios.get('http://localhost:8080/api/v1/geo/locate')
        .then(res => {
          if (res.status === 200 && res.data && res.data.latitude && res.data.longitude) {
            setAutoLocateInfo({ city: res.data.city, country: res.data.country_name })
            if (mapInstance) {
              mapInstance.flyTo([parseFloat(res.data.latitude), parseFloat(res.data.longitude)], 12, { animate: true, duration: 1.6 })
            }
            // Also update center so places can be fetched
            setFetchedPlaces([]) // trigger re-fetch around this area if we want, but keeping it simple for UI animation
          }
        })
        .catch(err => console.log('Auto-locate failed or rate-limited, ignoring', err))
    }
  }, [latParam, lngParam, nameParam, mapInstance])

  useEffect(() => {
    // If a destination name is provided but without coordinates, geocode it to center the map properly
    if (nameParam && (!latParam || !lngParam)) {
      if (geocodingRef.current === nameParam) return
      geocodingRef.current = nameParam
      
      let active = true

      const mockCoords: Record<string, {lat: number, lng: number}> = {
        'paris': { lat: 48.8566, lng: 2.3522 },
        'goa': { lat: 15.2993, lng: 74.1240 },
        'dubai': { lat: 25.2048, lng: 55.2708 },
        'tokyo': { lat: 35.6762, lng: 139.6503 },
        'bali': { lat: -8.4095, lng: 115.1889 },
        'new delhi': { lat: 28.6139, lng: 77.2090 },
        'delhi': { lat: 28.6139, lng: 77.2090 },
        'mumbai': { lat: 19.0760, lng: 72.8777 }
      }
      
      const normalizedName = nameParam.toLowerCase()
      if (mockCoords[normalizedName]) {
        const { lat, lng } = mockCoords[normalizedName]
        if (active) {
          setSearchParams({ lat: lat.toString(), lng: lng.toString(), name: nameParam })
        }
      } else {
        axios.get(`http://localhost:5000/api/maps/search?q=${encodeURIComponent(nameParam)}`)
          .then(response => {
            if (active && response.data && response.data.success && response.data.data.length > 0) {
              const result = response.data.data[0]
              const newLat = parseFloat(result.lat)
              const newLng = parseFloat(result.lon)
              setSearchParams({ lat: newLat.toString(), lng: newLng.toString(), name: nameParam })
            }
          })
          .catch(err => {
            if (active) console.error('Initial geocoding failed:', err)
          })
      }

      return () => {
        active = false
        geocodingRef.current = null
      }
    }
  }, [nameParam, latParam, lngParam, setSearchParams])

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([rl, l]) => {
      MapContainer = rl.MapContainer
      TileLayer = rl.TileLayer
      Marker = rl.Marker
      Popup = rl.Popup
      Polyline = rl.Polyline
      CircleMarker = rl.CircleMarker
      L = l.default || l
      setLeafletLoaded(true)
    })
  }, [])

  const [fetchedPlaces, setFetchedPlaces] = useState<any[]>([])
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(true)

  useEffect(() => {
    setIsLoadingPOIs(true)
    placeService.fetchMapPOIs(centerLat, centerLng).then(places => {
      const newPlaces = [...places]
      
      if (latParam && lngParam && nameParam && mapTitle !== 'Delhi') {
        if (!newPlaces.some(p => p.name.toLowerCase() === mapTitle.toLowerCase())) {
          newPlaces.push({
            id: 'dynamic-search',
            name: mapTitle,
            lat: centerLat,
            lng: centerLng,
            type: 'attraction',
            cost: 0
          })
        }
      }

      // Keep original mock Delhi places if nearby
      PLACES.forEach(p => {
        const dLat = p.lat - centerLat
        const dLng = p.lng - centerLng
        if (dLat * dLat + dLng * dLng < 0.2) {
          if (!newPlaces.some(newP => newP.name === p.name)) {
            newPlaces.push(p)
          }
        }
      })

      setFetchedPlaces(newPlaces)
      setIsLoadingPOIs(false)
    })
  }, [centerLat, centerLng, mapTitle])

  const [activeLayer, setActiveLayer] = useState<string[]>(['attraction', 'hotel', 'food'])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [routeDrawn, setRouteDrawn] = useState(false)
  const [transport, setTransport] = useState<any>(null)
  const [activeTransportMode, setActiveTransportMode] = useState<'metro' | 'bus' | 'cab'>('metro')
  const [infraOverlayPoints, setInfraOverlayPoints] = useState<{ lat: number; lng: number; category: string; emoji: string; name: string }[]>([])

  const filteredPlaces = fetchedPlaces.filter(p => activeLayer.includes(p.type))
  const finalFilteredPlaces = (() => {
    const searched = filteredPlaces.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const categoryCount = activeLayer.length;
    if (categoryCount === 0) return [];
    
    const perCategoryLimit = Math.floor(150 / categoryCount);
    const grouped: Record<string, any[]> = { attraction: [], hotel: [], food: [], transport: [] };
    
    searched.forEach(p => {
      if (grouped[p.type]) grouped[p.type].push(p);
    });
    
    const result: any[] = [];
    activeLayer.forEach(layer => {
      if (grouped[layer]) {
        result.push(...grouped[layer].slice(0, perCategoryLimit));
      }
    });
    
    return result.sort((a, b) => (b.rawRate || b.rating) - (a.rawRate || a.rating));
  })();

  // Curated highlights route: max 5 top attractions
  const route = finalFilteredPlaces
    .filter(p => p.type === 'attraction')
    .slice(0, 5)
    .map(p => [p.lat, p.lng] as [number, number])

  // Full route for Dead-Zone Navigator analysis — uses all POIs to define the travel corridor
  const routeForAnalysis: [number, number][] = fetchedPlaces.length >= 2
    ? fetchedPlaces.slice(0, 8).map(p => [p.lat, p.lng] as [number, number])
    : [[centerLat - 0.05, centerLng - 0.05], [centerLat, centerLng], [centerLat + 0.05, centerLng + 0.05]]

  useEffect(() => {
    if (mapInstance && fetchedPlaces.length > 0 && !isLoadingPOIs) {
      const bounds = fetchedPlaces.map(p => [p.lat, p.lng] as [number, number]);
      if (bounds.length > 0) {
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [mapInstance, fetchedPlaces, isLoadingPOIs])

  useEffect(() => {
    if (mapInstance && selectedPlace) {
      mapInstance.flyTo([selectedPlace.lat, selectedPlace.lng], 16, { animate: true, duration: 1.5 })
    }
  }, [selectedPlace, mapInstance])

  useEffect(() => {
    if (mapInstance && centerLat && centerLng) {
      mapInstance.flyTo([centerLat, centerLng], 12, { animate: true, duration: 1.8 })
    }
  }, [centerLat, centerLng, mapInstance])

  useEffect(() => {
    if (selectedPlace) {
      placeService.getNearbyTransport(selectedPlace.lat, selectedPlace.lng).then(setTransport)
    }
  }, [selectedPlace])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsLoadingPOIs(true)
      try {
        const response = await axios.get(`http://localhost:5000/api/maps/search?q=${encodeURIComponent(searchQuery.trim())}`)
        if (response.data && response.data.success && response.data.data.length > 0) {
          const result = response.data.data[0]
          const newLat = parseFloat(result.lat)
          const newLng = parseFloat(result.lon)
          const newName = (result.display_name || result.name || searchQuery.trim()).split(',')[0]
          
          if (mapInstance) {
            mapInstance.flyTo([newLat, newLng], 13, { animate: true, duration: 2.5 })
          }
          
          setSearchParams({ lat: newLat.toString(), lng: newLng.toString(), name: newName })
          setSearchQuery('') // Clear search filter after successful global geocode
        }
      } catch (err) {
        console.error('Geocoding failed:', err)
      } finally {
        setIsLoadingPOIs(false)
      }
    }
  }

  const LAYER_FILTERS = [
    { id: 'attraction', label: 'Attractions', emoji: '🏛️', color: '#0d9488' },
    { id: 'hotel', label: 'Hotels', emoji: '🏨', color: '#7c3aed' },
    { id: 'food', label: 'Food', emoji: '🍛', color: '#FC6C26' },
  ]

  // Mock route SVG path for the fallback map
  const routePath = "M 50,50 L 120,80 L 150,150 L 220,100 L 280,180"

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col" style={{ paddingTop: 'var(--topbar-height)' }}>
      {/* Auto-Locate Toast */}
      <AnimatePresence>
        {autoLocateInfo && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, transition: { ease: easeExit, duration: 0.3 } }}
            transition={{ ...springSoft }}
            className="absolute bottom-6 left-6 z-[1000] flex items-center gap-3 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)]/50 shadow-2xl rounded-2xl px-5 py-3"
            onAnimationComplete={() => {
              setTimeout(() => setAutoLocateInfo(null), 4000)
            }}
          >
            <motion.div
              initial={{ y: -10, scale: 0.5 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ ...springSnappy, delay: 0.2 }}
              className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"
            >
              <MapPinIcon size={16} />
            </motion.div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Showing map near <span className="font-bold text-teal-700">{autoLocateInfo.city}, {autoLocateInfo.country}</span><br />
              <span className="text-xs text-[var(--text-secondary)] font-normal">Search anywhere</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      <div className="flex items-center gap-4 px-6 py-4 z-10 flex-wrap bg-bg-card border-b border-border-subtle">
        <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] tracking-tight antialiased">
          Map Guide — {mapTitle}
        </h1>

        <div className="flex items-center gap-3 ml-8">
          {LAYER_FILTERS.map(layer => {
            const isActive = activeLayer.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(prev => isActive ? prev.filter(l => l !== layer.id) : [...prev, layer.id])}
                className={`px-4 py-2 rounded-full text-[13px] font-bold antialiased uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? 'shadow-md scale-105' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-[var(--text-muted)]'
                }`}
                style={{
                  backgroundColor: isActive ? layer.color + '1A' : undefined,
                  color: isActive ? layer.color : undefined,
                }}
              >
                {layer.label}
              </button>
            )
          })}
        </div>

        <motion.button
          whileHover={route.length > 1 ? { scale: 1.02 } : {}}
          whileTap={route.length > 1 ? { scale: 0.98 } : {}}
          onClick={() => route.length > 1 && setRouteDrawn(!routeDrawn)}
          disabled={route.length < 2}
          title={route.length < 2 ? "You need at least 2 attractions to draw a route!" : "Toggle route"}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold antialiased transition-colors ${route.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            background: routeDrawn && route.length > 1 ? 'var(--teal-700)' : 'var(--bg-secondary)',
            color: routeDrawn && route.length > 1 ? 'white' : 'var(--text-primary)',
            borderColor: routeDrawn && route.length > 1 ? 'transparent' : 'var(--border-default)',
            borderWidth: 1,
            borderStyle: 'solid'
          }}
        >
          <Navigation size={14} /> {routeDrawn && route.length > 1 ? 'Route Active' : 'Show Route'}
        </motion.button>
      </div>

      <div className="flex-1 flex relative">
        {/* Map Area */}
        <div className="flex-1 relative bg-bg-card">
          {/* Dead-Zone Navigator™ — Floating Panel */}
          <DeadZoneNavigator
            routeCoords={routeForAnalysis}
            routeId="map-guide-route"
            onInfraPointsReady={setInfraOverlayPoints}
          />

          {leafletLoaded && MapContainer ? (
            <MapContainer ref={setMapInstance} center={[centerLat, centerLng]} zoom={12} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              {finalFilteredPlaces.map(place => {
                const isSelected = selectedPlace?.id === place.id;
                
                // Create World-Class Custom Marker Icon
                let icon;
                if (L) {
                  const bgColor = place.type === 'attraction' ? 'bg-[#0f6b5c]' : place.type === 'hotel' ? 'bg-[#6c5b7b]' : 'bg-[#f2994a]';
                  const glowColor = place.type === 'attraction' ? 'rgba(15, 107, 92, 0.8)' : place.type === 'hotel' ? 'rgba(108, 91, 123, 0.8)' : 'rgba(242, 153, 74, 0.8)';
                  const emoji = place.type === 'attraction' ? '🏛️' : place.type === 'hotel' ? '🏨' : '🍛';
                  
                  const html = `
                    <div class="relative flex items-center justify-center w-10 h-10">
                      ${isSelected ? `
                        <div class="absolute inset-0 rounded-full animate-ping opacity-70" style="background-color: ${glowColor}; animation-duration: 2s;"></div>
                        <div class="absolute inset-[-10px] rounded-full animate-pulse opacity-40" style="background-color: ${glowColor}; animation-duration: 1.5s;"></div>
                        <div class="absolute inset-[-2px] rounded-full opacity-60 backdrop-blur-md border border-white/30" style="background-color: ${glowColor};"></div>
                      ` : ''}
                      <div class="relative z-10 flex items-center justify-center w-7 h-7 rounded-full border-[2px] transition-all duration-500 ${isSelected ? `border-white scale-[1.35]` : 'border-white/90 shadow-sm'} ${bgColor}"
                           style="${isSelected ? `box-shadow: 0 6px 20px ${glowColor};` : ''}">
                        <span class="text-white text-[11px] leading-none drop-shadow-sm" style="transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'}; transition: transform 0.5s;">
                          ${emoji}
                        </span>
                      </div>
                    </div>
                  `;
                  
                  icon = L.divIcon({
                    html,
                    className: 'bg-transparent border-none',
                    iconSize: [48, 48],
                    iconAnchor: [24, 24],
                    popupAnchor: [0, -20]
                  });
                }

                return (
                  <Marker 
                    key={place.id} 
                    position={[place.lat, place.lng]} 
                    icon={icon}
                    eventHandlers={{ click: () => setSelectedPlace(place) }}
                  >
                    <Popup>
                      <div className="flex flex-col gap-1 p-1 min-w-[140px] font-sans">
                        <strong className="text-[#1B2A4A] text-[14px] font-bold leading-tight tracking-tight">{place.name}</strong>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-yellow-400 text-[12px] tracking-[1px]">
                            {'★'.repeat(place.rating || 4)}
                          </span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-card)] px-1.5 py-0.5 rounded-sm">{place.type}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
              
              {/* Removed the CircleMarker since the custom L.divIcon handles the ultra-premium highlight natively */}
              
              {routeDrawn && route.length > 1 && <Polyline positions={route} color="var(--teal-600)" weight={3} dashArray="8,4" />}

              {/* Dead-Zone Navigator™ — Infrastructure Point Markers */}
              {infraOverlayPoints.map((pt, i) => (
                <CircleMarker
                  key={`infra-${i}`}
                  center={[pt.lat, pt.lng]}
                  radius={6}
                  pathOptions={{
                    color: '#fff',
                    fillColor: pt.category === 'hospital' ? '#ef4444' : pt.category === 'fuel' ? '#f97316' : pt.category === 'network' ? '#3b82f6' : '#10b981',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs font-semibold p-1">
                      <span className="text-sm mr-1">{pt.emoji}</span>
                      {pt.name}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          ) : (
            // Animated Mock Map
            <div className="w-full h-full relative flex items-center justify-center p-10">
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {routeDrawn && route.length > 1 && (
                  <motion.path 
                    d={routePath} 
                    fill="none" 
                    stroke="var(--teal-500)" 
                    strokeWidth="4" 
                    strokeDasharray="8 8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                )}
              </svg>
              
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative w-[400px] h-[300px]">
                {filteredPlaces.map((p, i) => {
                  const isSelected = selectedPlace?.id === p.id
                  return (
                    <motion.div 
                      key={p.id} 
                      variants={itemPop}
                      className="absolute flex flex-col items-center gap-1 cursor-pointer group"
                      style={{ 
                        left: `${(p.lng - (centerLng - 0.05)) * 500}px`, 
                        top: `${((centerLat + 0.07) - p.lat) * 500}px`,
                        zIndex: isSelected ? 20 : 10
                      }}
                      onClick={() => setSelectedPlace(p)}
                    >
                      <div className="relative">
                        {isSelected && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: TYPE_COLORS[p.type] }}
                          />
                        )}
                        <motion.div 
                          whileHover={{ scale: 1.2, y: -5 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white relative z-10 shadow-lg border-2 ${isSelected ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ background: TYPE_COLORS[p.type] || 'var(--teal-700)' }}>
                          <MapPin size={14} />
                        </motion.div>
                      </div>
                      <span className="text-xs font-semibold bg-bg-card/80 backdrop-blur px-2 py-0.5 rounded shadow-sm whitespace-nowrap text-text-primary">
                        {p.name}
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          )}

          {/* Transport Estimator Widget */}
          <AnimatePresence>
            {selectedPlace && transport && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-bg-card/90 backdrop-blur-xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 w-[320px] z-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">Transport to {selectedPlace.name}</h4>
                    <p className="text-xs text-text-muted">Live estimates via AI</p>
                  </div>
                  <button onClick={() => setSelectedPlace(null)} className="w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center text-text-muted hover:text-text-primary">✕</button>
                </div>

                <div className="flex gap-2 p-1 bg-bg-secondary rounded-lg mb-3">
                  {(['metro', 'bus', 'cab'] as const).map(mode => (
                    <button key={mode} onClick={() => setActiveTransportMode(mode)}
                      className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-medium capitalize transition-all ${activeTransportMode === mode ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-muted'}`}>
                      {mode}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTransportMode}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-secondary/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] text-teal-600 flex items-center justify-center shrink-0">
                      {activeTransportMode === 'metro' && <Train size={18} />}
                      {activeTransportMode === 'bus' && <Bus size={18} />}
                      {activeTransportMode === 'cab' && <Car size={18} />}
                    </div>
                    <div>
                      {activeTransportMode === 'cab' ? (
                        <>
                          <p className="text-sm font-bold text-text-primary">{transport.cab.estMins} mins away</p>
                          <p className="text-xs text-text-muted">Estimated cost: ₹250-300</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-text-primary">{transport[activeTransportMode].distanceKm} km to nearest</p>
                          <p className="text-xs text-text-muted">{transport[activeTransportMode].name}</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Places Sidebar */}
        <div className="w-80 overflow-y-auto bg-[var(--bg-card)] border-l border-[var(--border-subtle)] z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] flex flex-col">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] sticky top-0 z-10">
            <h3 className="font-bold text-[18px] mb-5 text-[var(--text-primary)] flex items-center justify-between tracking-tight antialiased">
              <span>{isLoadingPOIs ? 'Scanning...' : 'Places on Map'}</span>
              {!isLoadingPOIs && <span className="bg-gray-100 text-[var(--text-primary)] py-1 px-3 rounded-full text-[12px] shadow-sm">{finalFilteredPlaces.length}</span>}
            </h3>
            
            {/* Premium Pill Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-[var(--text-muted)] group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-10 pr-12 py-3 border-2 border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-full text-[14px] font-bold text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-teal-500 focus:bg-[var(--bg-card)] transition-all shadow-sm"
                placeholder="Search destinations, hotels..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="flex gap-1 pointer-events-none">
                  <kbd className="inline-flex items-center justify-center h-6 px-1.5 bg-gray-50 border border-[var(--border-subtle)] rounded-[6px] text-[11px] font-bold text-gray-400 font-sans shadow-[0_2px_0_0_rgba(229,231,235,1)]">⌘</kbd>
                  <kbd className="inline-flex items-center justify-center h-6 px-1.5 bg-gray-50 border border-[var(--border-subtle)] rounded-[6px] text-[11px] font-bold text-gray-400 font-sans shadow-[0_2px_0_0_rgba(229,231,235,1)]">K</kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <div className="space-y-3">
              <AnimatePresence>
                {isLoadingPOIs ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10 opacity-70"
                  >
                    <div className="w-8 h-8 rounded-full border-4 border-[var(--border-subtle)] border-t-teal-500 animate-spin mb-4"></div>
                    <p className="text-xs font-semibold text-[var(--text-muted)]">Fetching live places from OpenTripMap...</p>
                  </motion.div>
                ) : finalFilteredPlaces.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 bg-[var(--bg-card)]/80 rounded-full flex items-center justify-center mb-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-[var(--border-subtle)]">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-[var(--text-primary)] font-bold text-sm mb-1">No matches found</p>
                    <p className="text-[var(--text-muted)] text-[11px] leading-relaxed max-w-[200px]">We couldn't find any locations matching "<span className="text-[var(--text-muted)] font-semibold">{searchQuery}</span>" in this area.</p>
                  </motion.div>
                ) : (
                  finalFilteredPlaces.map(place => (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPlace(place)}
                    className={`flex items-center justify-between gap-3 p-2 pr-3 rounded-full cursor-pointer transition-all border-2 ${selectedPlace?.id === place.id ? 'bg-[var(--bg-card)] border-teal-500 shadow-[0_8px_20px_rgba(20,184,166,0.15)] ring-4 ring-teal-500/10' : 'bg-[var(--bg-card)]/80 border-transparent hover:bg-[var(--bg-card)] hover:border-[var(--border-subtle)] hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4 overflow-hidden w-full">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white transition-transform duration-300 ${selectedPlace?.id === place.id ? 'scale-110 shadow-md' : 'shadow-inner'}`}
                        style={{ 
                          background: TYPE_COLORS[place.type] || 'var(--teal-700)',
                          boxShadow: selectedPlace?.id === place.id ? `0 0 0 4px ${TYPE_COLORS[place.type]}20` : undefined
                        }}>
                        {place.type === 'attraction' ? <Landmark size={18} /> : place.type === 'hotel' ? <BedDouble size={18} /> : <UtensilsCrossed size={18} />}
                      </div>
                      <div className="flex flex-col overflow-hidden flex-1 pr-2">
                        <p className={`font-bold text-[15px] truncate w-full transition-colors antialiased ${selectedPlace?.id === place.id ? 'text-[#3fa796]' : 'text-[var(--text-primary)]'}`}>{place.name}</p>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-1 font-bold flex items-center gap-1.5 antialiased">
                          <span>{place.type}</span>
                          <span className="text-yellow-400 tracking-normal text-[12px]">{'★'.repeat(place.rating || 4)}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
