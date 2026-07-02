import { useEffect, useState } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { useT } from '../useT'
import { mapController, type MeasurementSelection } from '../lib/mapController'

// High-contrast colours for satellite imagery.
const PRESETS = ['#ff2d95', '#ffd400', '#00e5ff', '#ff3b30', '#ffffff', '#111111']

/** Floating colour editor shown when a drawn measurement shape is selected. */
export default function MeasurementEditor() {
  const t = useT()
  const [sel, setSel] = useState<MeasurementSelection | null>(null)

  useEffect(() => {
    mapController.onSelectMeasurement = (info) => setSel(info)
    return () => {
      mapController.onSelectMeasurement = () => {}
    }
  }, [])

  if (!sel) return null

  const apply = (color: string) => {
    sel.layer.setStyle({ color, fillColor: color })
    setSel({ ...sel, color })
  }

  return (
    <div className="measure-editor">
      <div className="measure-editor-header">
        <span>{sel.text || t.color}</span>
        <button
          className="measure-editor-close"
          onClick={() => setSel(null)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <HexColorPicker color={sel.color} onChange={apply} />

      <div className="measure-editor-row">
        <span className="measure-editor-hash">#</span>
        <HexColorInput
          className="measure-editor-hex"
          color={sel.color}
          onChange={apply}
          aria-label={t.color}
        />
      </div>

      <div className="measure-editor-presets">
        {PRESETS.map((c) => (
          <button
            key={c}
            className="measure-editor-preset"
            style={{ background: c }}
            onClick={() => apply(c)}
            aria-label={c}
            title={c}
          />
        ))}
      </div>
    </div>
  )
}
