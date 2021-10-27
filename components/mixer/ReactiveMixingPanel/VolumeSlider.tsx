/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useDebounceCallback } from '@react-hook/debounce'
import { useThrottleCallback } from '@react-hook/throttle'
import React from 'react'
import { useAudioLevel } from '@digitalstage/api-client-react'
import { BiReset } from 'react-icons/bi'
import {LevelMeter} from './LevelMeter'

/**
 * Base for the logarithmic ratio below 0db
 */
const LOWER_BASE = 1.1
/**
 * Base for the exponential ratio above 0db
 */
const UPPER_BASE = 3

/**
 * Range input settings
 */
// const MIN = 0
const MAX = 100
const NULL_VALUE = 70

function getBaseLog(x: number, y: number): number {
    return Math.log(y) / Math.log(x)
}

const convertLinearToLog = (v: number): number => {
    if (v > NULL_VALUE) {
        const y = (v - NULL_VALUE) / (MAX - NULL_VALUE)
        return Math.pow(y, UPPER_BASE) * 3 + 1
    }
    const y = (v / NULL_VALUE) * (LOWER_BASE - 1) + 1
    return getBaseLog(LOWER_BASE, y)
}

const convertLogToLinear = (v: number): number => {
    if (v > 1) {
        return Math.round(Math.pow((v - 1) / 3, 1 / UPPER_BASE) * (MAX - NULL_VALUE)) + NULL_VALUE
    }
    return Math.round(((Math.pow(LOWER_BASE, v) - 1) / (LOWER_BASE - 1)) * NULL_VALUE)
}

const convertRangeToDbMeasure = (value: number): number => {
    if (value > 0) {
        return 20 * Math.log10(value)
    }
    return Number.NEGATIVE_INFINITY
}

const formatDbMeasure = (value: number, unit?: boolean): string => {
    if (value > Number.NEGATIVE_INFINITY) {
        let str: string = (Math.round(value * 10) / 10).toString()
        if (value > 0) str = `+${str}`
        if (unit) str += 'db'
        return str
    }
    return '-∞'
}

const UnMuteIcon = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fill="none"
            strokeLinecap="square"
            strokeMiterlimit="10"
            strokeWidth="32"
            d="M320 320c9.74-19.38 16-40.84 16-64 0-23.48-6-44.42-16-64m48 176c19.48-33.92 32-64.06 32-112s-12-77.74-32-112m48 272c30-46 48-91.43 48-160s-18-113-48-160"
        />
        <path d="M125.65 176.1H32v159.8h93.65L256 440V72L125.65 176.1z" />
    </svg>
)
const MuteIcon = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fill="none"
            strokeLinecap="square"
            strokeMiterlimit="10"
            strokeWidth="32"
            d="M416 432L64 80"
        />
        <path d="M352 256c0-24.56-5.81-47.88-17.75-71.27L327 170.47 298.48 185l7.27 14.25C315.34 218.06 320 236.62 320 256a112.91 112.91 0 01-.63 11.74l27.32 27.32A148.8 148.8 0 00352 256zm64 0c0-51.19-13.08-83.89-34.18-120.06l-8.06-13.82-27.64 16.12 8.06 13.82C373.07 184.44 384 211.83 384 256c0 25.93-3.89 46.21-11 65.33l24.5 24.51C409.19 319.68 416 292.42 416 256z" />
        <path d="M480 256c0-74.26-20.19-121.11-50.51-168.61l-8.61-13.49-27 17.22 8.61 13.49C429.82 147.38 448 189.5 448 256c0 48.76-9.4 84-24.82 115.55l23.7 23.7C470.16 351.39 480 309 480 256zM256 72l-73.6 58.78 73.6 73.59V72zM32 176.1v159.8h93.65L256 440V339.63L92.47 176.1H32z" />
    </svg>
)

const VolumeSlider = ({
    id,
    name,
    volume,
    muted,
    modified,
    onChange,
    onReset,
}: {
    id: string
    name?: string
    volume: number
    muted: boolean
    modified: boolean
    onChange: (volume: number, muted: boolean) => void
    onReset: () => void
}): JSX.Element => {
    const levels = useAudioLevel()
    const [value, setValue] = React.useState<number>(convertLogToLinear(volume))
    const [dbValue, setDbValue] = React.useState<string>()

    React.useEffect(() => {
        setValue(convertLogToLinear(volume))
    }, [volume])
    const publish = React.useCallback(
        (v: number, m: boolean) => {
            onChange(convertLinearToLog(v), m)
        },
        [onChange]
    )
    const requestPublication = useDebounceCallback(publish, 250)
    const requestDbUpdate = useThrottleCallback(
        (volume: number) =>
            setDbValue(formatDbMeasure(convertRangeToDbMeasure(convertLinearToLog(volume)))),
        10
    )

    React.useEffect(() => {
        requestDbUpdate(value)
    }, [requestDbUpdate, value])

    const handleInternalChange = React.useCallback(
        (e) => {
            const v = e.target.value as number
            setValue(v)
            requestPublication(v, muted)
        },
        [requestPublication, muted]
    )

    const handleInternalMuteToggle = React.useCallback(() => {
        publish(value, !muted)
    }, [muted, publish, value])

    return (
        <div className={`volumeSlider ${modified ? 'modified' : ''}`}>
            <button
                onClick={handleInternalMuteToggle}
                className={`muteButton ${muted ? 'active' : ''}`}
            >
                {muted ? <MuteIcon /> : <UnMuteIcon />}
            </button>
            <div className="slider">
                {levels[id] ? (
                    <LevelMeter className="levelMeter" buffer={levels[id]} vertical />
                ) : null}
                {name ? <label>{name}</label> : null}
                <div className="value">{dbValue} db</div>
                <input
                    type="range"
                    name={name}
                    min={0}
                    max={100}
                    step={5}
                    value={value}
                    onChange={handleInternalChange}
                />
            </div>
            {modified ? (
                <button onClick={onReset} className="resetButton">
                    <BiReset />
                </button>
            ) : null}
        </div>
    )
}
export { VolumeSlider }
