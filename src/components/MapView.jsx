import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
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
// Container is always 36×36 so iconAnchor never shifts between states.
// Only the inner SVG colour and size change — Leaflet's hit-box stays fixed.
function createStarIcon(isSelected) {
  const color   = isSelected ? '#f97316' : '#d69e2e'
  const svgSize = isSelected ? 32 : 22

  const svg = `
    <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24"
           width="${svgSize}" height="${svgSize}"
           style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));">
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="${color}"
          stroke="#92400e"
          stroke-width="1"
        />
      </svg>
    </div>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [36, 36],   // fixed — never changes between states
    iconAnchor: [18, 18],   // fixed — Leaflet never repositions the marker
    tooltipAnchor: [18, 0],
  })
}

export default function MapView({ selectedId, onSelectFacility }) {
  return (
    <MapContainer
      center={[35.5, -79.5]}
      zoom={7}
      className="w-full h-full"
      zoomControl={true}
      closePopupOnClick={false}
      trackResize={false}
      doubleClickZoom={false}
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
              // Stop the raw DOM event — L.DomEvent.stopPropagation(e) only
              // stops Leaflet-level propagation; the original DOM click can
              // still bubble and trigger a second handler invocation on touch.
              if (e.originalEvent) {
                e.originalEvent.stopPropagation()
                e.originalEvent.preventDefault()
              }
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
    </MapContainer>
  )
}
