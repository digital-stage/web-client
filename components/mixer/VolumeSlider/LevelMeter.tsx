import React, { CanvasHTMLAttributes, useRef } from 'react'
import useAnimationFrame from '../../../api-client-react/src/hooks/useAnimationFrame'

function getAverageVolume(array: Uint8Array): number {
    let values = 0
    const { length } = array
    // get all the frequency amplitudes
    for (let i = 0; i < length; i += 1) {
        values += array[i]
    }
    return values / length
}

const LevelMeter = (
    props: CanvasHTMLAttributes<HTMLCanvasElement> & {
        buffer: ArrayBuffer
    }
): JSX.Element => {
    const { buffer, ...other } = props
    const canvasRef = useRef<HTMLCanvasElement>()

    useAnimationFrame(() => {
        if (buffer && canvasRef.current) {
            const array = new Uint8Array(buffer)
            const average = getAverageVolume(array)
            const { width } = canvasRef.current
            const { height } = canvasRef.current

            const context: CanvasRenderingContext2D = canvasRef.current.getContext('2d')

            context.clearRect(0, 0, width, height)

            const gradient = context.createLinearGradient(0, 0, 0, height)
            gradient.addColorStop(1, '#012340')
            gradient.addColorStop(0.75, '#F20544')
            gradient.addColorStop(0, '#F20544')
            context.fillStyle = gradient
            context.fillRect(0, height - average, width, height)
        }
    })

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <canvas {...other} ref={canvasRef} />
}
export default LevelMeter
