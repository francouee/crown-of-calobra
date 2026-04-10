import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import styles from './ElevationProfile.module.css'

const TERRAIN_COLOR = {
  mountain: '#e05252',
  hilly: '#5094e8',
  flat: '#50c882',
}

export default function ElevationProfile({ track, distanceKm, terrain }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!track || track.length < 2) return
    const el = svgRef.current
    if (!el) return

    const totalW = el.clientWidth || 700
    const totalH = el.clientHeight || 180
    const margin = { top: 16, right: 16, bottom: 32, left: 44 }
    const w = totalW - margin.left - margin.right
    const h = totalH - margin.top - margin.bottom

    // Distribute track points evenly across distance
    const step = distanceKm / (track.length - 1)
    const data = track.map((p, i) => ({ dist: i * step, ele: p.ele }))

    const xScale = d3.scaleLinear().domain([0, distanceKm]).range([0, w])
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.ele) * 1.1])
      .range([h, 0])
      .nice()

    const color = TERRAIN_COLOR[terrain] || '#e8c84a'

    const areaGen = d3
      .area()
      .x((d) => xScale(d.dist))
      .y0(h)
      .y1((d) => yScale(d.ele))
      .curve(d3.curveCatmullRom.alpha(0.5))

    const lineGen = d3
      .line()
      .x((d) => xScale(d.dist))
      .y((d) => yScale(d.ele))
      .curve(d3.curveCatmullRom.alpha(0.5))

    const svg = d3.select(el)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')
    const gradId = `elev-grad-${terrain}`
    const grad = defs
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1')

    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.3)
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.02)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Grid lines
    const yTicks = yScale.ticks(4)
    g.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#1e1e1e')
      .attr('stroke-width', 1)

    // Area fill
    g.append('path')
      .datum(data)
      .attr('d', areaGen)
      .attr('fill', `url(#${gradId})`)

    // Line
    g.append('path')
      .datum(data)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round')

    // X axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => `${d} km`)
      .tickSize(0)

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis)
      .call((ax) => ax.select('.domain').remove())
      .call((ax) =>
        ax
          .selectAll('text')
          .attr('fill', '#555')
          .attr('font-family', 'var(--font-mono)')
          .attr('font-size', '10px')
          .attr('dy', '1.2em'),
      )

    // Y axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `${d}m`)
      .tickSize(0)

    g.append('g')
      .call(yAxis)
      .call((ax) => ax.select('.domain').remove())
      .call((ax) =>
        ax
          .selectAll('text')
          .attr('fill', '#555')
          .attr('font-family', 'var(--font-mono)')
          .attr('font-size', '10px')
          .attr('dx', '-6px'),
      )
  }, [track, distanceKm, terrain])

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Elevation Profile</p>
      <svg ref={svgRef} className={styles.svg} />
    </div>
  )
}
