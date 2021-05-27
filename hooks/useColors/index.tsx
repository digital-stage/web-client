import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import HSLColor from './HSLColor'

function randomHue(): HSLColor {
    // eslint-disable-next-line no-bitwise
    return new HSLColor(~~(360 * Math.random()), 70, 80, 1)
}

export interface ColorContext {
    generatedColors: {
        [id: string]: HSLColor
    }

    generateColor(id: string): HSLColor
}

const Context = createContext<ColorContext>(undefined)

const ColorProvider = (props: { children: React.ReactNode }): JSX.Element => {
    const { children } = props
    const [generatedColors, setGeneratedColors] = useState<{
        [id: string]: HSLColor
    }>({})

    return (
        <Context.Provider
            value={{
                generatedColors,
                generateColor: (id: string): HSLColor => {
                    const color = randomHue()
                    setGeneratedColors((prev) => ({
                        ...prev,
                        [id]: color,
                    }))
                    return color
                },
            }}
        >
            {children}
        </Context.Provider>
    )
}

const useColors2 = (): {
    getColor: (id: string) => HSLColor
} => {
    const { generatedColors, generateColor } = useContext<ColorContext>(Context)

    const getColor = useCallback(
        (id: string) => {
            if (generatedColors[id]) {
                return generatedColors[id]
            }
            return generateColor(id)
        },
        [generatedColors, generateColor]
    )
    return { getColor }
}

const useColors = (uuid: string): HSLColor => {
    const [color, setColor] = useState<HSLColor>()
    const { generatedColors, generateColor } = useContext<ColorContext>(Context)
    const getColor = useCallback(
        (id: string) => {
            if (generatedColors[id]) {
                return generatedColors[id]
            }
            return generateColor(id)
        },
        [generatedColors, generateColor]
    )
    useEffect(() => {
        setColor(getColor(uuid))
    }, [uuid])

    return color
}

export { ColorProvider }

export default useColors
