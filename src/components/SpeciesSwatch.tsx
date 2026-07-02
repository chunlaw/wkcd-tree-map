import type { CSSProperties } from 'react'
import type { MarkerShape } from '../types'

export default function SpeciesSwatch({
  shape,
  color,
}: {
  shape: MarkerShape
  color: string
}) {
  const style: CSSProperties =
    shape === 'triangle'
      ? { borderBottom: `14px solid ${color}` }
      : { background: color }
  return <span className={`species-color ${shape}`} style={style} />
}
