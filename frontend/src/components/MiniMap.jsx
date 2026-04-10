import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const TERRAIN_COLOR = {
  mountain: '#e05252',
  hilly: '#5094e8',
  flat: '#50c882',
}

export default function MiniMap({ track, terrain, width, height }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!track || track.length < 2) return
    const el = svgRef.current
    if (!el) return

    const w = width || el.clientWidth || 400
    const h = height || el.clientHeight || 140
    const pad = 12

    const lons = track.map((p) => p.lon)
    const lats = track.map((p) => p.lat)

    // Keep proportions: fit the track inside the box with equal scale on both axes
    const lonExtent = [d3.min(lons), d3.max(lons)]
    const latExtent = [d3.min(lats), d3.max(lats)]

    const lonRange = lonExtent[1] - lonExtent[0] || 0.01
    const latRange = latExtent[1] - latExtent[0] || 0.01

    const drawW = w - pad * 2
    const drawH = h - pad * 2

    // Maintain aspect ratio
    const scale = Math.min(drawW / lonRange, drawH / latRange)
    const trackW = lonRange * scale
    const trackH = latRange * scale
    const offsetX = pad + (drawW - trackW) / 2
    const offsetY = pad + (drawH - trackH) / 2

    const xScale = d3
      .scaleLinear()
      .domain(lonExtent)
      .range([offsetX, offsetX + trackW])

    // Latitude increases northward → invert y axis
    const yScale = d3
      .scaleLinear()
      .domain(latExtent)
      .range([offsetY + trackH, offsetY])

    const lineGen = d3
      .line()
      .x((p) => xScale(p.lon))
      .y((p) => yScale(p.lat))
      .curve(d3.curveCatmullRom.alpha(0.5))

    const svg = d3.select(el)
    svg.selectAll('*').remove()

    // Track path shadow/glow
    svg
      .append('path')
      .datum(track)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', TERRAIN_COLOR[terrain] || '#e8c84a')
      .attr('stroke-width', 4)
      .attr('stroke-opacity', 0.15)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')

    // Track path main
    svg
      .append('path')
      .datum(track)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', TERRAIN_COLOR[terrain] || '#e8c84a')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.9)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')

    // Start dot
    const first = track[0]
    svg
      .append('circle')
      .attr('cx', xScale(first.lon))
      .attr('cy', yScale(first.lat))
      .attr('r', 3)
      .attr('fill', '#f0f0f0')
      .attr('opacity', 0.8)

    // Finish dot
    const last = track[track.length - 1]
    svg
      .append('circle')
      .attr('cx', xScale(last.lon))
      .attr('cy', yScale(last.lat))
      .attr('r', 3)
      .attr('fill', TERRAIN_COLOR[terrain] || '#e8c84a')
  }, [track, terrain, width, height])

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
