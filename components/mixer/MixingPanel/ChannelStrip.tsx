import React, {useCallback, useState} from "react";
import {useEffect} from "react";
import {IAnalyserNode, IAudioContext} from "standardized-audio-context";
import VolumeSlider from "../VolumeSlider";
import styles from "./ChannelStrip.module.css"
import SecondaryButton from "../../../ui/button/SecondaryButton";
import {IoIosVolumeOff} from "react-icons/io";
import {VolumeProperties} from "@digitalstage/api-types";
import {BiReset} from "react-icons/bi";
import DangerButton from "../../../ui/button/DangerButton";

const ChannelStrip = (props: {
  channel: VolumeProperties;
  onChange: (volume: number, muted: boolean) => void;
  resettable?: boolean;
  onReset?: () => void;
  analyserL?: IAnalyserNode<IAudioContext>;
  analyserR?: IAnalyserNode<IAudioContext>;
  color: string;
  className?: string;
}) => {
  const {
    channel, onChange, resettable, onReset, analyserL, analyserR, className, color
  } = props;
  const [muted, setMuted] = useState<boolean>();
  const [value, setValue] = useState<number>();

  useEffect(() => {
    if (channel) {
      setValue(channel.volume);
      setMuted(channel.muted);
    }
  }, [channel]);

  const handleChange = useCallback((value) => {
    setValue(value);
  }, []);

  const handleFinalChange = useCallback(
    (value) => {
      setValue(value);
      onChange(value, channel.muted);
    },
    [onChange, channel]
  );

  const handleMute = useCallback(() => {
    onChange(value, !channel.muted);
  }, [onChange, channel, value]);

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
          opacity: resettable ? 1 : .5
        }}
      />
      <div className={styles.bottom}>
        <DangerButton
          className={styles.button}
          size="small"
          round
          toggled={muted}
          onClick={handleMute}>
          <IoIosVolumeOff size={18}/>
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
          <BiReset size={18}/>
        </SecondaryButton>
      </div>
    </div>
  )
}
export default ChannelStrip
