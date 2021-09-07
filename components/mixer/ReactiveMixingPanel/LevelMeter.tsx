import React, { CanvasHTMLAttributes, useRef } from 'react'
import useAnimationFrame from 'use-animation-frame'

const USE_MAX = true

function getMaximumVolume(array: Uint8Array): number {
    const { length } = array
    let value = 0
    // get all the frequency amplitudes
    for (let freqBinI = 0; freqBinI < length; freqBinI++) {
        value = Math.max(value, array[freqBinI])
    }
    return value / 256
}

function getAverageVolume(array: Uint8Array): number {
    let values = 0
    const { length } = array
    // get all the frequency amplitudes
    for (let i = 0; i < length; i += 1) {
        values += array[i]
    }
    return values / length
}

function calculate(buffer: ArrayBuffer): number {
    const array = new Uint8Array(buffer)
    if (USE_MAX) {
        const average = getAverageVolume(array)
        if (average > 50) {
            return average / 50 + 0.7
        } else {
            return (average / 50) * 0.7
        }
    } else {
        return getMaximumVolume(array) * 0.7
    }
}

const LevelMeter = ({
    vertical,
    buffer,
    ...other
}: CanvasHTMLAttributes<HTMLCanvasElement> & {
    buffer: ArrayBuffer
    vertical?: boolean
}): JSX.Element => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    useAnimationFrame(() => {
        if (buffer && canvasRef.current) {
            const value = calculate(buffer)
            const { width } = canvasRef.current
            const { height } = canvasRef.current

            const context: CanvasRenderingContext2D | null = canvasRef.current.getContext('2d')

            if (context) {
                context.clearRect(0, 0, width, height)

                if (vertical) {
                    const gradient = context.createLinearGradient(0, 0, width, 0)
                    gradient.addColorStop(0, '#012340')
                    gradient.addColorStop(0.5, '#012340')
                    gradient.addColorStop(0.75, '#F20544')
                    gradient.addColorStop(1, '#F20544')
                    context.fillStyle = gradient
                    context.fillRect(0, 0, value * width, height)
                } else {
                    const gradient = context.createLinearGradient(0, 0, 0, height)
                    gradient.addColorStop(1, '#012340')
                    gradient.addColorStop(0.75, '#F20544')
                    gradient.addColorStop(0, '#F20544')
                    context.fillStyle = gradient
                    context.fillRect(0, height - value, width, height)
                }
            }
        }
    }, [buffer, vertical]) // 15 fps

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <canvas {...other} ref={canvasRef} />
}
export { LevelMeter }
