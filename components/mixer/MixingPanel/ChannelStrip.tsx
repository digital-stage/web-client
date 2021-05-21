/* eslint-disable react/require-default-props */
import React, { useCallback, useState, useEffect } from 'react'
import { IAnalyserNode, IAudioContext } from 'standardized-audio-context'
import { IoIosVolumeOff } from 'react-icons/io'
import { VolumeProperties } from '@digitalstage/api-types'
import { BiReset } from 'react-icons/bi'
import styles from './ChannelStrip.module.css'
import VolumeSlider from '../VolumeSlider'
import { DangerButton, SecondaryButton } from '../../ui/Button'

const ChannelStrip = (props: {
    channel: VolumeProperties
    onChange: (volume: number, muted: boolean) => void
    resettable?: boolean
    onReset?: () => void
    analyserL?: IAnalyserNode<IAudioContext>
    analyserR?: IAnalyserNode<IAudioContext>
    color: string
    className?: string
}) => {
    const { channel, onChange, resettable, onReset, analyserL, analyserR, className, color } = props
    const [muted, setMuted] = useState<boolean>()
    const [value, setValue] = useState<number>()

    useEffect(() => {
        if (channel) {
            setValue(channel.volume)
            setMuted(channel.muted)
        }
    }, [channel])

    const handleChange = useCallback((v) => {
        setValue(v)
    }, [])

    const handleFinalChange = useCallback(
        (v) => {
            setValue(v)
            onChange(v, channel.muted)
        },
        [onChange, channel]
    )

    const handleMute = useCallback(() => {
        onChange(value, !channel.muted)
    }, [onChange, channel, value])

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <VolumeSlider
                min={0}
                middle={1}
                max={4}
                value={value}
                onChange={handleChange}
                onFinalChange={handleFinalChange}
                analyserL={analyserL}
                analyserR={analyserR}
                color={color}
                className={styles.slider}
                style={{
                    opacity: resettable ? 1 : 0.5,
                }}
            />
            <div className={styles.bottom}>
                <DangerButton
                    className={styles.button}
                    size="small"
                    round
                    toggled={muted}
                    onClick={handleMute}
                >
                    <IoIosVolumeOff size={18} />
                </DangerButton>
                <SecondaryButton
                    className={styles.button}
                    round
                    size="small"
                    disabled={!resettable}
                    onClick={() => {
                        if (onReset) {
                            onReset()
                        }
                    }}
                >
                    <BiReset size={18} />
                </SecondaryButton>
            </div>
        </div>
    )
}
export default ChannelStrip
