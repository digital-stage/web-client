import React from 'react'

import {ChromePicker} from 'react-color'

const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => {
    const [currentColor, setCurrentColor] = React.useState<string>(color)

    React.useEffect(() => {
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
export { ColorPicker }
