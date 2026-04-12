import { useEffect, useRef, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { processTrack, buildColoredSegments, gradientColor } from '../utils/gradients.js'

const LAYERS = [
  {
    id: 'cyclosm',
    label: 'Cycling',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://github.com/cyclosm/cyclosm-cartocss-style">CyclOSM</a>',
    maxZoom: 20,
  },
  {
    id: 'topo',
    label: 'Topo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 17,
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19,
  },
  {
    id: 'voyager',
    label: 'Street',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
]

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions && positions.length > 1) {
      map.fitBounds(positions, { padding: [16, 16] })
    }
  }, [map, positions])
  return null
}

/**
 * Manages the interaction polyline and hover marker entirely imperatively.
 * This component never causes the parent (or Leaflet track layers) to re-render
 * on mouse moves — it only updates the single circleMarker via Leaflet API.
 */
function InteractiveLayer({ processed, onHover, hoveredIdx }) {
  const map = useMap()
  const markerRef = useRef(null)
  const polylineRef = useRef(null)

  // Create the persistent hover marker and interaction polyline once.
  // Cleanup on unmount or when `processed` / `onHover` reference changes.
  useEffect(() => {
    if (!processed || processed.length < 2) return

    const positions = processed.map((p) => [p.lat, p.lon])

    // Persistent hover marker — hidden initially
    const marker = L.circleMarker([0, 0], {
      radius: 6,
      color: '#fff',
      weight: 2,
      fillOpacity: 0,
      opacity: 0,
      interactive: false,
      pane: 'markerPane',
    })
    marker.bindTooltip('', {
      permanent: true,
      direction: 'top',
      offset: [0, -10],
      interactive: false,
    })
    marker.addTo(map)
    markerRef.current = marker

    // Invisible thick polyline for mouse hit-testing.
    // opacity: 0.001 (not 0) so the SVG path keeps pointer-events active.
    const polyline = L.polyline(positions, {
      color: '#000',
      weight: 20,
      opacity: 0.001,
      interactive: true,
    })
    .on('mousemove', (e) => {
      const { lat, lng: lon } = e.latlng
      let nearestIdx = 0, minDist = Infinity
      processed.forEach((p, i) => {
        const d = (p.lat - lat) ** 2 + (p.lon - lon) ** 2
        if (d < minDist) { minDist = d; nearestIdx = i }
      })
      onHover?.(nearestIdx)
    })
    .on('mouseout', () => onHover?.(null))
    .addTo(map)
    polylineRef.current = polyline

    return () => {
      marker.remove()
      polyline.remove()
    }
  }, [map, processed, onHover])

  // Update marker position/style imperatively whenever hoveredIdx changes.
  // This does NOT re-render React — it only calls Leaflet API directly.
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    if (hoveredIdx == null) {
      marker.setStyle({ fillOpacity: 0, opacity: 0 })
      marker.closeTooltip()
      return
    }

    const pt = processed[hoveredIdx]
    if (!pt) return

    const color = gradientColor(pt.gradient)
    marker.setLatLng([pt.lat, pt.lon])
    marker.setStyle({ fillColor: color, fillOpacity: 1, opacity: 1 })
    marker.setTooltipContent(
      `<span style="font-family:monospace;font-size:11px">` +
      `${pt.dist.toFixed(1)} km · ${Math.round(pt.ele)} m · ` +
      `<span style="color:${color}">${pt.gradient > 0 ? '+' : ''}${pt.gradient.toFixed(1)}%</span>` +
      `</span>`
    )
    marker.openTooltip()
  }, [hoveredIdx, processed])

  return null
}

export default function MiniMap({ track, height, hoveredIdx, onHover }) {
  const [activeLayerId, setActiveLayerId] = useState('cyclosm')
  const activeLayer = LAYERS.find(l => l.id === activeLayerId)
  const processed = useMemo(
    () => (track && track.length >= 2 ? processTrack(track) : []),
    [track],
  )
  const segments = useMemo(() => buildColoredSegments(processed), [processed])
  const allPositions = useMemo(() => processed.map((p) => [p.lat, p.lon]), [processed])

  if (!track || track.length < 2) {
    return <div style={{ width: '100%', height: height || 280, background: '#111' }} />
  }

  const first = allPositions[0]

  return (
    <div style={{ position: 'relative', width: '100%', height: height || 280 }}>
      {/* Layer switcher — sit on top of the map, stop clicks reaching Leaflet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 10, right: 10,
          zIndex: 1000,
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 6,
          padding: '3px 5px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          fontSize: 11,
          fontFamily: 'sans-serif',
        }}
      >
        {LAYERS.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveLayerId(l.id)}
            style={{
              border: 'none', cursor: 'pointer', borderRadius: 4,
              padding: '2px 7px',
              background: l.id === activeLayerId ? '#059669' : 'transparent',
              color: l.id === activeLayerId ? '#fff' : '#333',
              fontWeight: l.id === activeLayerId ? 600 : 400,
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <MapContainer
        center={first}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
      <TileLayer
        key={activeLayer.id}
        url={activeLayer.url}
        attribution={activeLayer.attribution}
        maxZoom={activeLayer.maxZoom}
      />
      <FitBounds positions={allPositions} />

      {/* Downhill first so uphill segments paint on top at back-and-forth sections */}
      {[...segments.filter(s => !s.uphill), ...segments.filter(s => s.uphill)].map((seg, i) => (
        <Polyline
          key={i}
          positions={seg.points}
          pathOptions={{ color: seg.color, weight: 4, opacity: 0.9 }}
        />
      ))}

      <InteractiveLayer
        processed={processed}
        onHover={onHover}
        hoveredIdx={hoveredIdx}
      />
    </MapContainer>
    </div>
  )
}
