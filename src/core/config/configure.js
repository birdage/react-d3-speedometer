import memoizeOne from 'memoize-one'
import { range as d3Range, arc as d3Arc } from 'd3'
import {
  deg2rad,
  sumArrayTill,
  calculateScale,
  calculateTicks,
  calculateSegmentStops,
} from '../util'

// export memoized functions
export const configureScale = memoizeOne(_configureScale)
export const configureTicks = memoizeOne(_configureTicks)
export const configureTickData = memoizeOne(_configureTickData)
export const configureArc = memoizeOne(_configureArc)
export const getBorderArc = memoizeOne(_getBorderArc)

function _configureScale(config) {
  return calculateScale({
    min: config.minValue,
    max: config.maxValue,
    segments: config.maxSegmentLabels,
  })
}

function _configureTicks(config) {
  const scale = configureScale(config)

  let ticks = calculateTicks(scale, {
    min: config.minValue,
    max: config.maxValue,
    segments: config.maxSegmentLabels,
  })

  if (config.customSegmentStops.length > 0 && config.maxSegmentLabels !== 0) {
    ticks = config.customSegmentStops
  }

  return ticks
}

function _configureTickData(config) {
  const defaultTickData = d3Range(config.majorTicks).map(d => {
    return 1 / config.majorTicks
  })

  const tickData = calculateSegmentStops({
    tickData: defaultTickData,
    customSegmentStops: config.customSegmentStops,
    min: config.minValue,
    max: config.maxValue,
  })

  return tickData
}

function _configureArc(config) {
  const tickData = configureTickData(config)

  const range = config.maxAngle - config.minAngle
  const r = config.width / 2

  const arc = d3Arc()
    .innerRadius(r - config.ringWidth - config.ringInset)
    .outerRadius(r - config.ringInset)
    .cornerRadius(config.cornerRadius) //to round the corners
    .padAngle(config.arcPadding) // to space the arc segments
    .startAngle((d, i) => {
      const ratio = sumArrayTill(tickData, i)
      return deg2rad(config.minAngle + ratio * range)
    })
    .endAngle((d, i) => {
      const ratio = sumArrayTill(tickData, i + 1)
      return deg2rad(config.minAngle + ratio * range)
    })

  return arc
}

function _getBorderArc(config, cornerRadius, arcPadding, borderWidth) {
  const tickData = configureTickData(config)

  const range = config.maxAngle - config.minAngle
  const r = config.width / 2

  const arc = d3Arc()
    .innerRadius(r - config.ringInset)
    .outerRadius(r - config.ringInset - borderWidth)
    // .cornerRadius(config.cornerRadius) //to round the corners
    // .padAngle(config.arcPadding) // to space the arc segments
    .startAngle((d, i) => {
      const ratio = sumArrayTill(tickData, i)
      return deg2rad(config.minAngle + ratio * range)
    })
    .endAngle((d, i) => {
      const ratio = sumArrayTill(tickData, i + 1)
      return deg2rad(config.minAngle + ratio * range)
    })

  return arc
}
