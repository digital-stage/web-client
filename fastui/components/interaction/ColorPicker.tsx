import React, { useEffect, useState } from 'react'

import { ChromePicker } from 'react-color'

const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => {
    const [currentColor, setCurrentColor] = useState<string>(color)

    useEffect(() => {
        setCurrentColor(color)
    }, [color])
    return (
        <ChromePicker
            disableAlpha
            color={currentColor}
            onChangeComplete={(c) => onChange(c.hex)}
            onChange={(c) => setCurrentColor(c.hex)}
        />
    )
}
export default ColorPicker
