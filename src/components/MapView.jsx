import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { FACILITIES } from '../data/facilities'

// Fix Leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Custom gold star DivIcon ────────────────────────────────────────────────
function createStarIcon(isSelected) {
  const color = isSelected ? '#f97316' : '#d69e2e'  // orange when selected, gold otherwise
  const size  = isSelected ? 32 : 26

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         width="${size}" height="${size}"
         style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));">
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="${color}"
        stroke="#92400e"
        stroke-width="1"
      />
    </svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [size / 2, 0],
  })
}

// Half of SidePanel max-w-sm (384px) — shifts star left of the panel
const PANEL_OFFSET_PX = 192

// ── Fly-to helper with right-panel offset ──────────────────────────────────
function FlyToSelected({ facility }) {
  const map = useMap()
  const prevIdRef = useRef(null)
  useEffect(() => {
    // Skip if no facility or if we already flew to this one
    if (!facility || facility.id === prevIdRef.current) return
    prevIdRef.current = facility.id

    const zoom = Math.max(map.getZoom(), 9)
    // Project to pixels, shift east so the star sits left of the side panel
    const target = map.project([facility.lat, facility.lng], zoom)
    const shifted = map.unproject(target.add([PANEL_OFFSET_PX, 0]), zoom)
    map.flyTo(shifted, zoom, { duration: 0.8, easeLinearity: 0.5 })
  }, [facility, map])
  return null
}

export default function MapView({ selectedId, onSelectFacility }) {
  const selectedFacility = FACILITIES.find((f) => f.id === selectedId) ?? null

  return (
    <MapContainer
      center={[35.5, -79.5]}
      zoom={7}
      className="w-full h-full"
      zoomControl={true}
      closePopupOnClick={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {FACILITIES.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.lat, facility.lng]}
          icon={createStarIcon(facility.id === selectedId)}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onSelectFacility(facility.id)
            },
          }}
        >
          <Tooltip
            direction="top"
            offset={[0, -8]}
            className="!bg-gray-900 !text-white !border-0 !text-xs !px-2 !py-1 !rounded-md !shadow-lg"
          >
            <span className="font-semibold">{facility.name}</span>
            <br />
            <span className="text-gray-300">{facility.city}, {facility.county} Co.</span>
          </Tooltip>
        </Marker>
      ))}

      <FlyToSelected facility={selectedFacility} />
    </MapContainer>
  )
}
