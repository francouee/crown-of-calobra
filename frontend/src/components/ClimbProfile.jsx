import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { gradientColor } from '../utils/gradients.js'

/**
 * Tiny elevation sparkline for a single climb segment.
 * Props:
 *   points — slice of processTrack() output covering the climb
 *   width, height — SVG size in px
 */
export default function ClimbProfile({ points, width = 220, height = 72 }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!points || points.length < 2) return
    const el = svgRef.current
    if (!el) return

    const margin = { top: 6, right: 6, bottom: 18, left: 34 }
    const w = width  - margin.left - margin.right
    const h = height - margin.top  - margin.bottom

    const distMin = points[0].dist
    const distMax = points[points.length - 1].dist
    const eleMin  = d3.min(points, p => p.ele)
    const eleMax  = d3.max(points, p => p.ele)

    const xScale = d3.scaleLinear().domain([distMin, distMax]).range([0, w])
    const yScale = d3.scaleLinear().domain([eleMin * 0.995, eleMax * 1.01]).range([h, 0]).nice()

    const areaFn = d3.area()
      .x(p => xScale(p.dist))
      .y0(h)
      .y1(p => yScale(p.ele))
      .curve(d3.curveCatmullRom.alpha(0.5))

    const svg = d3.select(el)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')
    defs.append('clipPath').attr('id', 'climb-clip')
      .append('path').datum(points).attr('d', areaFn)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Gradient-colored fill bands
    for (let i = 0; i < points.length - 1; i++) {
      g.append('rect')
        .attr('x', xScale(points[i].dist))
        .attr('y', 0)
        .attr('width', Math.max(0, xScale(points[i + 1].dist) - xScale(points[i].dist)))
        .attr('height', h)
        .attr('fill', gradientColor(points[i + 1].gradient))
        .attr('fill-opacity', 0.55)
        .attr('clip-path', 'url(#climb-clip)')
    }

    // Elevation line
    for (let i = 0; i < points.length - 1; i++) {
      g.append('line')
        .attr('x1', xScale(points[i].dist))
        .attr('y1', yScale(points[i].ele))
        .attr('x2', xScale(points[i + 1].dist))
        .attr('y2', yScale(points[i + 1].ele))
        .attr('stroke', gradientColor(points[i + 1].gradient))
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
    }

    // Y axis (elevation)
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(3)
          .tickFormat(d => `${d}m`)
          .tickSize(0)
      )
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', '#555')
        .attr('font-family', 'var(--font-mono)')
        .attr('font-size', '9px')
        .attr('dx', '-4px')
      )

    // X axis (distance)
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(4)
          .tickFormat(d => `${d.toFixed(0)}km`)
          .tickSize(0)
      )
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', '#555')
        .attr('font-family', 'var(--font-mono)')
        .attr('font-size', '9px')
        .attr('dy', '1.2em')
      )
  }, [points, width, height])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block', width: '100%', height: `${height}px` }}
    />
  )
}
