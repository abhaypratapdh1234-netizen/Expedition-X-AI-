import { useEffect, useState, useRef } from 'react'
import { AlertCircle, Navigation } from 'lucide-react'
import axios from 'axios'

// Dynamic Leaflet wrappers to prevent Node/Vitest build crashes
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, Polyline: any, CircleMarker: any, L: any

export interface OSMMapProps {
  center: [number, number]
  zoom?: number
  style?: React.CSSProperties
  routePoints?: [number, number][] // Waypoints to calculate OSRM route
  stops?: { id: string; name: string; lat: number; lng: number; type: string; plannedTime?: string }[]
  activeLayers?: {
    route: boolean
    hospitals: boolean
    fuel: boolean
    water: boolean
    atms: boolean
    pharmacies: boolean
  }
  enableLiveGPS?: boolean
  onDistanceUpdate?: (distanceKm: number | null) => void
}

export function OSMMap({
  center,
  zoom = 13,
  style = { width: '100%', height: '100%' },
  routePoints = [],
  stops = [],
  activeLayers = { route: true, hospitals: false, fuel: false, water: false, atms: false, pharmacies: false },
  enableLiveGPS = false,
  onDistanceUpdate
}: OSMMapProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  
  // State for POI data
  const [hospitals, setHospitals] = useState<any[]>([])
  const [fuel, setFuel] = useState<any[]>([])
  const [water, setWater] = useState<any[]>([])
  const [atms, setAtms] = useState<any[]>([])
  const [pharmacies, setPharmacies] = useState<any[]>([])
  
  // State for calculated route coordinates (OSRM)
  const [osrmRoute, setOsrmRoute] = useState<[number, number][]>([])

  // State for real-time live location
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Dynamic import Leaflet
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

  // Geolocation watch
  useEffect(() => {
    if (enableLiveGPS && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setUserLoc(newLoc)
          
          // Focus map on first location fix
          if (mapInstance && !userLoc) {
            mapInstance.flyTo(newLoc, 15, { animate: true, duration: 1.5 })
          }
        },
        (err) => console.warn("Live GPS location watch failed:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [enableLiveGPS, mapInstance])

  // Synchronize map view when center coordinate prop changes
  useEffect(() => {
    const [lat, lon] = center
    if (mapInstance && lat && lon) {
      mapInstance.flyTo([lat, lon], mapInstance.getZoom() || zoom, { animate: true, duration: 1.5 })
    }
  }, [center, mapInstance, zoom])

  // Fetch POIs when center coordinate shifts
  useEffect(() => {
    const [lat, lon] = center
    if (!lat || !lon) return

    const fetchPOIs = async (type: string, setter: (data: any[]) => void) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/maps/pois?lat=${lat}&lon=${lon}&radius=4000&type=${type}`)
        if (res.data && res.data.success) {
          setter(res.data.data)
        }
      } catch (err) {
        console.error(`Failed to fetch POIs for type ${type}:`, err)
      }
    }

    if (activeLayers.hospitals) fetchPOIs('hospital', setHospitals)
    if (activeLayers.fuel) fetchPOIs('fuel', setFuel)
    if (activeLayers.water) fetchPOIs('water', setWater)
    if (activeLayers.atms) fetchPOIs('atm', setAtms)
    if (activeLayers.pharmacies) fetchPOIs('pharmacy', setPharmacies)

  }, [center, activeLayers.hospitals, activeLayers.fuel, activeLayers.water, activeLayers.atms, activeLayers.pharmacies])

  // Fetch OSRM Route
  useEffect(() => {
    if (activeLayers.route && routePoints.length >= 2) {
      const getOSRMRoute = async () => {
        const [sLat, sLon] = routePoints[0]
        const [eLat, eLon] = routePoints[routePoints.length - 1]
        try {
          const res = await axios.get(`http://localhost:5000/api/maps/route?start_lat=${sLat}&start_lon=${sLon}&end_lat=${eLat}&end_lon=${eLon}`)
          if (res.data && res.data.success) {
            const geom = res.data.data.routes[0].geometry.coordinates
            // OSRM returns coordinates as [lon, lat], map expects [lat, lon]
            const path: [number, number][] = geom.map((coord: number[]) => [coord[1], coord[0]])
            setOsrmRoute(path)
          }
        } catch (err) {
          console.error("OSRM Routing failed:", err)
        }
      }
      getOSRMRoute()
    } else {
      setOsrmRoute([])
    }
  }, [routePoints, activeLayers.route])

  // Calculate distance to the next waypoint
  useEffect(() => {
    if (!onDistanceUpdate) return

    const calculateDistance = () => {
      const sourceLoc = userLoc || center
      if (!sourceLoc || routePoints.length === 0) {
        onDistanceUpdate(null)
        return
      }

      // Next waypoint is either first point in route, or next destination
      const nextWp = routePoints[0]
      const [lat1, lon1] = sourceLoc
      const [lat2, lon2] = nextWp

      // Haversine formula
      const R = 6371 // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c
      
      onDistanceUpdate(Number(distance.toFixed(2)))
    }

    calculateDistance()
  }, [userLoc, center, routePoints, onDistanceUpdate])

  // Custom icon factory for Leaflet
  const createDivIcon = (emoji: string, colorClass: string, isSelected = false) => {
    if (!L) return null
    const html = `
      <div class="relative flex items-center justify-center w-8 h-8">
        ${isSelected ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75 bg-red-400"></div>` : ''}
        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-white shadow-md ${colorClass}">
          ${emoji}
        </div>
      </div>
    `
    return L.divIcon({
      html,
      className: 'bg-transparent border-none',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }

  if (!leafletLoaded || !MapContainer) {
    return (
      <div style={style} className="flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl">
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Initializing OpenStreetMap canvas...</p>
      </div>
    )
  }

  return (
    <div style={style} className="relative overflow-hidden rounded-2xl shadow-inner border border-gray-100">
      <MapContainer ref={setMapInstance} center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        {/* OpenStreetMap standard tiles */}
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
        />

        {/* User Location Marker (Live GPS) */}
        {userLoc && (
          <Marker position={userLoc} icon={createDivIcon('📍', 'bg-blue-600', true)}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-blue-700">Your GPS Location</p>
                <p className="text-[10px] text-gray-500">{userLoc[0].toFixed(5)}, {userLoc[1].toFixed(5)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (OSRM) */}
        {activeLayers.route && osrmRoute.length > 0 && (
          <Polyline positions={osrmRoute} color="#7c3aed" weight={4} opacity={0.8} />
        )}

        {/* Stops/Waypoints Markers */}
        {stops && stops.map((stop, i) => {
          const emoji = stop.type === 'hotel' ? '🏨' : stop.type === 'food' ? '🍔' : '📍'
          const bgColor = stop.type === 'hotel' ? 'bg-indigo-600' : stop.type === 'food' ? 'bg-amber-500' : 'bg-rose-500'
          return (
            <Marker key={`stop-${stop.id || i}`} position={[stop.lat, stop.lng]} icon={createDivIcon(emoji, bgColor)}>
              <Popup>
                <div className="p-1">
                  <p className="text-xs font-bold text-gray-900">{stop.name}</p>
                  {stop.plannedTime && <p className="text-[10px] text-gray-500 font-semibold">Planned Time: {stop.plannedTime}</p>}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Hospitals Layer */}
        {activeLayers.hospitals && hospitals.map(poi => (
          <Marker key={`hosp-${poi.id}`} position={[poi.lat, poi.lon]} icon={createDivIcon('🏥', 'bg-red-600')}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-red-700">Hospital/Clinic</p>
                <p className="text-xs font-semibold">{poi.name}</p>
                {poi.address && <p className="text-[10px] text-gray-500">{poi.address}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fuel Stations Layer */}
        {activeLayers.fuel && fuel.map(poi => (
          <Marker key={`fuel-${poi.id}`} position={[poi.lat, poi.lon]} icon={createDivIcon('⛽', 'bg-amber-600')}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-amber-700">Fuel Station</p>
                <p className="text-xs font-semibold">{poi.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drinking Water Layer */}
        {activeLayers.water && water.map(poi => (
          <Marker key={`water-${poi.id}`} position={[poi.lat, poi.lon]} icon={createDivIcon('🚰', 'bg-teal-600')}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-teal-700">Drinking Water</p>
                <p className="text-xs font-semibold">{poi.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ATMs Layer */}
        {activeLayers.atms && atms.map(poi => (
          <Marker key={`atm-${poi.id}`} position={[poi.lat, poi.lon]} icon={createDivIcon('💵', 'bg-emerald-600')}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-emerald-700">ATM</p>
                <p className="text-xs font-semibold">{poi.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pharmacies Layer */}
        {activeLayers.pharmacies && pharmacies.map(poi => (
          <Marker key={`pharm-${poi.id}`} position={[poi.lat, poi.lon]} icon={createDivIcon('💊', 'bg-pink-600')}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-pink-700">Pharmacy</p>
                <p className="text-xs font-semibold">{poi.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
