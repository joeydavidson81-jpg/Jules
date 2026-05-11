import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { collectionGroup, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { FACILITIES } from '../data/facilities'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STAR_ICON = L.divIcon({
  html: `<div class="star-icon-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
         class="star-svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5))">
      <polygon class="star-poly"
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="#d69e2e" stroke="#92400e" stroke-width="1"/>
    </svg>
  </div>`,
  className: '',
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
  tooltipAnchor: [18, 0],
})

const TOOLTIP_OFFSET = [0, -8]

const FacilityMarker = memo(function FacilityMarker({ facility, isSelected, hasEvents, onSelect }) {
  const markerRef     = useRef(null)
  const onSelectRef   = useRef(onSelect)
  const facilityIdRef = useRef(facility.id)
  useEffect(() => { onSelectRef.current = onSelect },   [onSelect])
  useEffect(() => { facilityIdRef.current = facility.id }, [facility.id])

  // Imperative click — bypasses react-leaflet prop diffing entirely
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    const handler = (e) => {
      L.DomEvent.stopPropagation(e)
      if (e.originalEvent) {
        e.originalEvent.stopPropagation()
        e.originalEvent.preventDefault()
      }
      onSelectRef.current(facilityIdRef.current)
    }
    marker.on('click', handler)
    marker.on('tap',   handler)
    return () => { marker.off('click', handler); marker.off('tap', handler) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // CSS class toggles — no setIcon(), no DOM churn, no bounce
  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.classList.toggle('star-selected',   isSelected)
  }, [isSelected])

  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.classList.toggle('star-has-events', hasEvents)
  }, [hasEvents])

  return (
    <Marker ref={markerRef} position={[facility.lat, facility.lng]} icon={STAR_ICON}>
      <Tooltip direction="top" offset={TOOLTIP_OFFSET}
        className="!bg-gray-900 !text-white !border-0 !text-xs !px-2 !py-1 !rounded-md !shadow-lg">
        <span className="font-semibold">{facility.name}</span>
        <br />
        <span className="text-gray-300">{facility.city}, {facility.county} Co.</span>
      </Tooltip>
    </Marker>
  )
})

export default memo(function MapView({ onSelectFacility }) {
  const [selectedId, setSelectedId]             = useState(null)
  const [facilitiesWithEvents, setFacilitiesWithEvents] = useState(new Set())

  // Real-time set of facility IDs that have at least one event
  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, 'events'), (snap) => {
      const ids = new Set(snap.docs.map((d) => d.ref.parent.parent.id))
      setFacilitiesWithEvents(ids)
    })
    return unsub
  }, [])

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
    onSelectFacility(id)
  }, [onSelectFacility])

  return (
    <MapContainer center={[35.5, -79.5]} zoom={7} className="w-full h-full"
      zoomControl={true} closePopupOnClick={false} trackResize={false} doubleClickZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {FACILITIES.map((facility) => (
        <FacilityMarker
          key={facility.id}
          facility={facility}
          isSelected={facility.id === selectedId}
          hasEvents={facilitiesWithEvents.has(facility.id)}
          onSelect={handleSelect}
        />
      ))}
    </MapContainer>
  )
})
