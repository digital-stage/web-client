/** @jsxRuntime classic */
/** @jsx jsx */
import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Heading, SxStyleProp, jsx, IconButton } from 'theme-ui';
import VolumeSlider from '../VolumeSlider';
import { ThreeDimensionAudioProperties } from '../../../lib/use-digital-stage';
import { IAnalyserNode, IAudioContext } from 'standardized-audio-context';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BiReset, BiVolumeMute } from 'react-icons/bi';
import { useIntl } from 'react-intl';

const CHANNEL_PADDING_REM = 0.2;

const ChannelStrip = (props: {
  children?: React.ReactNode;
  name: string;
  elevation?: number;
  sx?: SxStyleProp;
  initialCollapse?: boolean;
  icon?: React.ReactNode;

  channel: ThreeDimensionAudioProperties;
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
    sx,
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
  const { formatMessage } = useIntl();
  const f = (id) => formatMessage({ id });

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
    <Flex
      sx={{
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        borderRadius: 'card',
        minHeight: '100%',
        ...sx,
      }}
    >
      <Flex
        sx={{
          width: '140px',
          flexDirection: 'column',
          padding: elevation * CHANNEL_PADDING_REM * 2 + 'rem',
        }}
      >
        <Flex
          sx={{
            width: '100%',
            alignItems: 'center',
            cursor: hasChildren && 'pointer',
          }}
          onClick={() => {
            console.log(React.Children.count(children));
            setCollapsed((prev) => !prev);
          }}
        >
          {icon ? (
            <Flex
              sx={{
                width: '50%',
                marginLeft: '25%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Flex>
          ) : (
            <Heading
              variant="h4"
              sx={{
                flexGrow: 1,
              }}
            >
              {name}
            </Heading>
          )}
          {hasChildren && (
            <IconButton
              sx={{
                flexGrow: 0,
              }}
              variant="icon"
            >
              {collapsed ? <FaChevronLeft size="32px" /> : <FaChevronRight size="32px" />}
            </IconButton>
          )}
        </Flex>

        {icon && (
          <Heading
            variant="h4"
            sx={{
              py: 4,
            }}
          >
            {name}
          </Heading>
        )}

        <Flex
          sx={{
            flexDirection: 'column',
            flexGrow: 1,
            pt: 4,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
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
          <Flex sx={{}}>
            <IconButton
              sx={{
                flexGrow: 0,
              }}
              aria-label={f(muted ? 'unmute' : 'mute')}
              title={f(muted ? 'unmute' : 'mute')}
              variant={muted ? 'iconPrimary' : 'iconTertiary'}
              onClick={handleMute}
              aria-pressed={muted}
            >
              <BiVolumeMute />
            </IconButton>

            <IconButton
              sx={{
                flexGrow: 0,
              }}
              aria-label={f(global ? 'resetGlobalMix' : 'resetCustomMix')}
              title={f(global ? 'resetGlobalMix' : 'resetCustomMix')}
              variant="iconTertiary"
              onClick={onReset}
              disabled={!resettable}
            >
              <BiReset />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
      {hasChildren && collapsed && (
        <Flex
          sx={{
            padding: elevation * CHANNEL_PADDING_REM + 'rem',
          }}
        >
          {children}
        </Flex>
      )}
    </Flex>
  );
};
export default ChannelStrip;
