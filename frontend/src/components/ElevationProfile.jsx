import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { processTrack, gradientColor, GRADIENT_SCALE } from '../utils/gradients.js'
import styles from './ElevationProfile.module.css'

export default function ElevationProfile({ track, denseTrack, terrain, hoveredIdx, onHover, zoomRange, onZoom }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const crosshairRef = useRef(null)
  const processedRef = useRef(null)
  const scalesRef = useRef(null)
  const drawParamsRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!track || track.length < 2) return

    const source = (zoomRange && denseTrack && denseTrack.length >= 2) ? denseTrack : track
    const data = processTrack(source)
    processedRef.current = data
    const totalDist = data[data.length - 1].dist

    const xMin = zoomRange ? zoomRange.distMin : 0
    const xMax = zoomRange ? zoomRange.distMax : totalDist
    const displayData = data.filter(p => p.dist >= xMin && p.dist <= xMax)
    if (displayData.length < 2) return

    drawParamsRef.current = { displayData, xMin, xMax, terrain, onZoom, onHover }

    function draw() {
      const el = svgRef.current
      const container = containerRef.current
      if (!el || !container) return
      const { displayData, xMin, xMax, terrain, onZoom, onHover } = drawParamsRef.current
      if (displayData.length < 2) return

      const totalW = container.clientWidth || 700
      const totalH = 180
      const margin = { top: 16, right: 16, bottom: 32, left: 44 }
      const w = totalW - margin.left - margin.right
      const h = totalH - margin.top - margin.bottom

      const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, w])
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(displayData, (d) => d.ele) * 1.1])
        .range([h, 0])
        .nice()

      scalesRef.current = { xScale, yScale, margin, w, h }

      const svg = d3.select(el)
      svg.selectAll('*').remove()

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Read theme-aware colours from CSS variables on the SVG element
      const cs = getComputedStyle(el)
      const colorBorder = cs.getPropertyValue('--border').trim() || '#1e1e1e'
      const colorTextSecondary = cs.getPropertyValue('--text-secondary').trim() || '#666'

      // Grid lines
      g.selectAll('.grid-line')
        .data(yScale.ticks(4))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', w)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', colorBorder)
        .attr('stroke-width', 1)

      // Gradient-colored fill: each segment is a closed trapezoid matching the
      // exact elevation shape — no clip-path needed, no coordinate misalignment.
      for (let i = 0; i < displayData.length - 1; i++) {
        const x0 = xScale(displayData[i].dist)
        const x1 = xScale(displayData[i + 1].dist)
        const y0 = yScale(displayData[i].ele)
        const y1 = yScale(displayData[i + 1].ele)
        g.append('path')
          .attr('d', `M${x0},${h} L${x0},${y0} L${x1},${y1} L${x1},${h} Z`)
          .attr('fill', gradientColor(displayData[i + 1].gradient))
          .attr('fill-opacity', 0.55)
      }

      // Colored line segments on top
      for (let i = 0; i < displayData.length - 1; i++) {
        g.append('line')
          .attr('x1', xScale(displayData[i].dist))
          .attr('y1', yScale(displayData[i].ele))
          .attr('x2', xScale(displayData[i + 1].dist))
          .attr('y2', yScale(displayData[i + 1].ele))
          .attr('stroke', gradientColor(displayData[i + 1].gradient))
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
      }

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${h})`)
        .call(
          d3.axisBottom(xScale).ticks(6).tickFormat((d) => `${d.toFixed(0)} km`).tickSize(0),
        )
        .call((ax) => ax.select('.domain').remove())
        .call((ax) =>
          ax.selectAll('text')
            .attr('fill', colorTextSecondary)
            .attr('font-family', 'var(--font-mono)')
            .attr('font-size', '10px')
            .attr('dy', '1.2em'),
        )

      // Y axis
      g.append('g')
        .call(
          d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${d}m`).tickSize(0),
        )
        .call((ax) => ax.select('.domain').remove())
        .call((ax) =>
          ax.selectAll('text')
            .attr('fill', colorTextSecondary)
            .attr('font-family', 'var(--font-mono)')
            .attr('font-size', '10px')
            .attr('dx', '-6px'),
        )

      // Crosshair group — rendered above everything, pointer-events off
      const chGroup = g
        .append('g')
        .attr('class', 'crosshair')
        .attr('pointer-events', 'none')
        .style('display', 'none')

      chGroup.append('line')
        .attr('class', 'ch-line')
        .attr('y1', 0).attr('y2', h)
        .attr('stroke', 'rgba(255,255,255,0.75)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3')

      chGroup.append('circle')
        .attr('class', 'ch-dot')
        .attr('r', 4)
        .attr('fill', '#fff')
        .attr('stroke', '#111')
        .attr('stroke-width', 1.5)

      crosshairRef.current = chGroup.node()

      const brushGroup = g.append('g').attr('class', 'brush')
      const brush = d3.brushX()
        .extent([[0, 0], [w, h]])
        .on('end', (event) => {
          if (!event.selection) return
          const [x0, x1] = event.selection
          const dMin = xScale.invert(x0)
          const dMax = xScale.invert(x1)
          brushGroup.call(brush.move, null)
          if (dMax - dMin > 0.1) drawParamsRef.current.onZoom?.({ distMin: dMin, distMax: dMax })
        })

      brushGroup.call(brush)

      brushGroup.select('.selection')
        .attr('fill', 'rgba(255,255,255,0.15)')
        .attr('stroke', 'rgba(255,255,255,0.4)')

      brushGroup.select('.overlay')
        .on('mousemove.hover', function (event) {
          const [mx] = d3.pointer(event)
          const distAtMouse = xScale.invert(Math.max(0, Math.min(mx, w)))
          let nearestIdx = 0, minDiff = Infinity
          processedRef.current.forEach((pt, i) => {
            const diff = Math.abs(pt.dist - distAtMouse)
            if (diff < minDiff) { minDiff = diff; nearestIdx = i }
          })
          drawParamsRef.current.onHover?.(processedRef.current[nearestIdx]?.dist ?? null)
        })
        .on('mouseleave.hover', () => drawParamsRef.current.onHover?.(null))
        .on('dblclick.reset', () => drawParamsRef.current.onZoom?.(null))
    }

    draw()

    const ro = new ResizeObserver(draw)
    const container = containerRef.current
    if (container) ro.observe(container)
    return () => ro.disconnect()
  }, [track, denseTrack, terrain, onHover, onZoom, zoomRange])

  // Crosshair + tooltip update
  useEffect(() => {
    const chNode = crosshairRef.current
    const scales = scalesRef.current
    const data = processedRef.current
    if (!chNode || !scales || !data) return

    const crosshair = d3.select(chNode)

    if (hoveredIdx == null) {
      crosshair.style('display', 'none')
      setTooltip(null)
      return
    }

    let pt = null, _minDiff = Infinity
    data.forEach((p) => {
      const diff = Math.abs(p.dist - hoveredIdx)
      if (diff < _minDiff) { _minDiff = diff; pt = p }
    })
    if (!pt) { crosshair.style('display', 'none'); setTooltip(null); return }

    crosshair.style('display', null)
    crosshair.select('.ch-line').attr('x1', scales.xScale(pt.dist)).attr('x2', scales.xScale(pt.dist))
    crosshair.select('.ch-dot').attr('cx', scales.xScale(pt.dist)).attr('cy', scales.yScale(pt.ele))

    const totalW = containerRef.current?.clientWidth || 700
    setTooltip({ x: scales.xScale(pt.dist) + scales.margin.left, totalW, point: pt })
  }, [hoveredIdx])

  return (
    <div className={styles.wrap}>
      <div className={styles.labelRow}>
        <p className={styles.label}>Elevation Profile</p>
        {zoomRange && (
          <button className={styles.resetBtn} onClick={() => onZoom?.(null)}>
            ↩ Reset zoom
          </button>
        )}
        {!zoomRange && (
          <span className={styles.zoomHint}>drag to zoom · dbl-click to reset</span>
        )}
      </div>
      <div ref={containerRef} className={styles.chartContainer}>
        <svg ref={svgRef} className={styles.svg} />
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{ left: Math.min(Math.max(tooltip.x + 12, 50), tooltip.totalW - 125) }}
          >
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipKey}>dist</span>
              <span className={styles.tooltipVal}>{tooltip.point.dist.toFixed(1)} km</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipKey}>elev</span>
              <span className={styles.tooltipVal}>{Math.round(tooltip.point.ele)} m</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipKey}>slope</span>
              <span
                className={styles.tooltipVal}
                style={{ color: gradientColor(tooltip.point.gradient) }}
              >
                {tooltip.point.gradient > 0 ? '+' : ''}{tooltip.point.gradient.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.legend}>
        {GRADIENT_SCALE.map(({ label, color }) => (
          <div key={label} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
