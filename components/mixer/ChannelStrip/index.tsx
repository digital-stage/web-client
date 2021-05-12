import React, {useCallback, useEffect, useState} from 'react';
import VolumeSlider from '../VolumeSlider';
import {IAnalyserNode, IAudioContext} from 'standardized-audio-context';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {BiReset, BiVolumeMute} from 'react-icons/bi';
import {useIntl} from 'react-intl';
import styles from "./ChannelStrip.module.css"
import {ThreeDimensionalProperties, VolumeProperties} from '@digitalstage/api-client-react';
import PrimaryButton from "../../../ui/button/PrimaryButton";

const CHANNEL_PADDING_REM = 0.2;

const ChannelStrip = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  name: string;
  elevation?: number;
  initialCollapse?: boolean;
  icon?: React.ReactNode;

  channel: ThreeDimensionalProperties & VolumeProperties;
  onChange: (volume: number, muted: boolean) => void;
  global?: boolean;

  resettable?: boolean;
  onReset?: () => void;
  analyserL?: IAnalyserNode<IAudioContext>;
  analyserR?: IAnalyserNode<IAudioContext>;
}): JSX.Element => {
  const {
    children,
    name,
    elevation,
    className,
    initialCollapse,
    icon,
    channel,
    onChange,
    global,
    resettable,
    onReset,
    analyserL,
    analyserR,
  } = props;
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapse);
  const [muted, setMuted] = useState<boolean>();
  const [value, setValue] = useState<number>();
  const [hasChildren, setHasChildren] = useState<boolean>(false);
  const {formatMessage} = useIntl();
  const f = (id) => formatMessage({id});

  useEffect(() => {
    setHasChildren(React.Children.count(children) > 0);
  }, [children]);

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
    <div
      className={`${styles.row} ${className}`}
    >
      <div
        className={"column"}
      >
        <div
          className="strip"
          onClick={() => {
            console.log(React.Children.count(children));
            setCollapsed((prev) => !prev);
          }}
        >
          {icon ? (
            <div className={styles.icon}>
              {icon}
            </div>
          ) : (
            <h4 className={styles.grow}>
              {name}
            </h4>
          )}
          {hasChildren && (
            <PrimaryButton
              round
              className={styles.noGrow}
            >
              {collapsed ? <FaChevronLeft size="32px"/> : <FaChevronRight size="32px"/>}
            </PrimaryButton>
          )}
        </div>

        {icon && (
          <h4 className={styles.headingWithoutIcon}>
            {name}
          </h4>
        )}

        <div className={styles.sliderWrapper}>
          <VolumeSlider
            min={0}
            middle={1}
            max={4}
            value={value}
            onChange={handleChange}
            onFinalChange={handleFinalChange}
            analyserL={analyserL}
            analyserR={analyserR}
            color={resettable ? (global ? '#9A9A9A' : '#6f92f8') : '#393939'}
          />
          <div>
            <PrimaryButton
              round
              className={styles.noGrow}
              aria-label={f(muted ? 'unmute' : 'mute')}
              title={f(muted ? 'unmute' : 'mute')}
              toggled={muted}
              onClick={handleMute}
              aria-pressed={muted}
            >
              <BiVolumeMute/>
            </PrimaryButton>

            <PrimaryButton
              round
              className={styles.noGrow}
              aria-label={f(global ? 'resetGlobalMix' : 'resetCustomMix')}
              title={f(global ? 'resetGlobalMix' : 'resetCustomMix')}
              onClick={onReset}
              disabled={!resettable}
            >
              <BiReset/>
            </PrimaryButton>
          </div>
        </div>
      </div>
      {hasChildren && collapsed && (
        <div className="childrenWrapper">
          {children}
        </div>
      )}
      <style jsx>{`
      .column {
            display: flex;
            width: 140px;
            flex-direction: column;
        }
        .strip {
          width: 100%;
          align-items: center;
        }
        `}</style>
      <style jsx>{`
      .column {
          padding: ${elevation * CHANNEL_PADDING_REM * 2 + 'rem'};
        }
        .strip {
          cursor: ${hasChildren ? 'pointer' : 'default'};
        }
        .childrenWrapper {
            padding: ${elevation * CHANNEL_PADDING_REM + 'rem'};
        }
        `}</style>
    </div>
  );
};
export default ChannelStrip;
