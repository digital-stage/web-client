import {Direction, Range} from 'react-range';
import React, {useCallback, useEffect, useState} from 'react';
import {convertRangeToDbMeasure, formatDbMeasure, getBaseLog} from './utils';
import {IAnalyserNode, IAudioContext} from 'standardized-audio-context';
import LevelMeter from './LevelMeter';
import styles from "./VolumeSlider.module.css"

/**
 * Base for the logarithmic ratio below 0db
 */
const LOWER_BASE = 1.1;
/**
 * Base for the exponential ratio above 0db
 */
const UPPER_BASE = 3;

/**
 * Range input settings
 */
const MIN = 0;
const MAX = 100;
const STEP = 5;
const NULL_VALUE = 70;

const VolumeSlider = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  min: number;
  middle: number;
  max: number;
  value: number;
  analyserL?: IAnalyserNode<IAudioContext>;
  analyserR?: IAnalyserNode<IAudioContext>;
  onChange: (value: number) => any;
  onFinalChange?: (value: number) => any;
  alignLabel?: 'left' | 'right';
  color: string;
}): JSX.Element => {
  const {
    onChange,
    onFinalChange,
    min,
    middle,
    max,
    value,
    alignLabel,
    analyserL,
    analyserR,
    color,
    className,
    style,
    ...other
  } = props;
  const [internalValue, setInternalValue] = useState<number>();
  const [dbValue, setDbValue] = useState<number>();

  const convertLinearToLog = useCallback(
    (value: number): number => {
      if (value > NULL_VALUE) {
        const y = (value - NULL_VALUE) / (MAX - NULL_VALUE);
        return Math.pow(y, UPPER_BASE) * (max - middle) + middle;
      } else {
        const y = (value / NULL_VALUE) * (LOWER_BASE - 1) + 1;
        return getBaseLog(LOWER_BASE, y);
      }
    },
    [middle, max]
  );

  const convertLogToLinear = useCallback(
    (value: number): number => {
      if (value > middle) {
        return (
          Math.round(
            Math.pow((value - middle) / (max - middle), 1 / UPPER_BASE) * (MAX - NULL_VALUE)
          ) + NULL_VALUE
        );
      } else {
        return Math.round(((Math.pow(LOWER_BASE, value) - 1) / (LOWER_BASE - 1)) * NULL_VALUE);
      }
    },
    [middle, max]
  );

  useEffect(() => {
    setInternalValue(convertLogToLinear(value));
    setDbValue(convertRangeToDbMeasure(value));
  }, [value, convertLogToLinear]);

  const handleSliderChange = useCallback(
    (value: number) => {
      if (onChange) {
        const volume = convertLinearToLog(value);
        onChange(volume);
      }
    },
    [onChange, convertLinearToLog]
  );

  const handleFinalSliderChange = useCallback(
    (value: number) => {
      if (onFinalChange) {
        const volume = convertLinearToLog(value);
        onFinalChange(volume);
      }
    },
    [onFinalChange, convertLinearToLog]
  );

  return (
    <div className={`${styles.wrapper} ${className}`} style={{
      alignItems: alignLabel === 'right' ? 'flex-start' : 'flex-end',
      ...style
    }} {...other}>
      <Range
        direction={Direction.Up}
        step={STEP}
        min={MIN}
        max={MAX}
        values={[internalValue]}
        onChange={(values) => handleSliderChange(values[0])}
        onFinalChange={(values) => handleFinalSliderChange(values[0])}
        renderMark={({props: markProps, index}) => (
          <div {...markProps}>
            {index % 2 === 0 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: alignLabel === 'right' ? '22px' : undefined,
                    right: alignLabel === 'right' ? undefined : '22px',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    backgroundColor: color
                  }}
                />
                <p className="micro"
                   style={{
                     position: "absolute",
                     top: 0,
                     left: alignLabel === 'right' ? '28px' : undefined,
                     right: alignLabel === 'right' ? undefined : '28px',
                     transform: 'translateY(-50%)',
                     color: color
                   }}>
                  {formatDbMeasure(convertRangeToDbMeasure(convertLinearToLog((20 - index) * 5)))}
                </p>
              </>
            )}
          </div>
        )}
        renderTrack={({props: trackProps, children}) => (
          <div
            {...trackProps}
            style={{
              ...trackProps.style,
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'center',
              width: '16px',
              height: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',

                position: 'relative',
                width: '5px',
                height: '100%',
                backgroundColor: color,
              }}
            >
              {analyserL ? (
                analyserR ? (
                  <React.Fragment>
                    <LevelMeter className={styles.half} analyser={analyserL}/>
                    <LevelMeter className={styles.half} analyser={analyserR}/>
                  </React.Fragment>
                ) : (
                  <LevelMeter className={styles.full} analyser={analyserL}/>
                )
              ) : undefined}
            </div>
            {children}
          </div>
        )}
        renderThumb={({props: thumbProps, isDragged}) => {
          return (
            <div
              {...thumbProps}
              style={{
                ...thumbProps.style,
                height: '16px',
                width: '16px',
                borderRadius: '50%',
                boxShadow: '0px 3px 6px #00000040',
                background: isDragged
                  ? 'linear-gradient(to bottom, #6F92F8, #6F92F8 49%, #5779D9 50%, #5779D9)'
                  : 'linear-gradient(to bottom, #FFFFFF, #FFFFFF 49%, #9A9A9A 50%, #9A9A9A)',
              }}
            />
          );
        }}
      />
      <p className={`${styles.measureText} micro`}>
        {formatDbMeasure(dbValue)} db
      </p>
    </div>
  );
};
export default VolumeSlider;
