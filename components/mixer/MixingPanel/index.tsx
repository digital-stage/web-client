/** @jsxRuntime classic */
/** @jsx jsx */
import { Flex, Text, jsx, Box } from 'theme-ui';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import GlobalModeSelect from '../../../digitalstage-ui/extra/GlobalModeSelect';
import {
  useAudioProducers,
  useCustomAudioProducers,
  useCustomGroups,
  useCustomStageMembers,
  useIsStageAdmin,
  useSelector,
  useStageMembers,
  useUsers,
} from '../../../lib/use-digital-stage/hooks';
import { useStageActions } from '../../../lib/use-digital-stage';
import useColors from '../../../lib/useColors';
import ChannelStrip from '../ChannelStrip';
import useStageWebAudio from '../../../lib/useStageWebAudio';

const MixingPanel = (): JSX.Element => {
  const [globalMode, setGlobalMode] = useState<boolean>(false);
  const isStageAdmin = useIsStageAdmin();
  const { formatMessage } = useIntl();
  const f = (id) => formatMessage({ id });

  const {
    setCustomGroup,
    setCustomStageMember,
    setCustomStageMemberAudio,
    removeCustomGroup,
    removeCustomStageMember,
    removeCustomStageMemberAudio,
    updateStageMember,
    updateGroup,
    updateStageMemberAudio,
  } = useStageActions();

  const getColor = useColors();

  // For groups
  const groups = useSelector((state) => {
    if (state.global.stageId && state.groups.byStage[state.global.stageId]) {
      return state.groups.byStage[state.global.stageId].map((id) => state.groups.byId[id]);
    }
    return [];
  });
  const customGroups = useCustomGroups();

  // For stage members
  const users = useUsers();
  const stageMembers = useStageMembers();
  const customStageMembers = useCustomStageMembers();

  // For audio producers
  const audioProducers = useAudioProducers();
  const customAudioProducers = useCustomAudioProducers();

  const { byGroup, byStageMember, byAudioProducer } = useStageWebAudio();

  return (
    <React.Fragment>
      {isStageAdmin && (
        <Box
          sx={{
            width: '100%',
            maxWidth: '100vw',
            flexGrow: 0,
            pb: 4,
          }}
        >
          <GlobalModeSelect
            global={globalMode}
            onChange={(globalMode) => setGlobalMode(globalMode)}
          />
          <Text variant="micro">{f(globalMode ? 'globalDescription' : 'monitorDescription')}</Text>
        </Box>
      )}

      <Flex
        sx={{
          flexGrow: 1,
          flexWrap: ['nowrap', 'wrap'],
          flexDirection: 'row',
          justifyContent: ['center', 'flex-start'],
          maxHeight: ['500px', 'initial'],
        }}
      >
        {groups.map((group) => {
          const customGroup = customGroups.byGroup[group._id]
            ? customGroups.byId[customGroups.byGroup[group._id]]
            : undefined;

          const color = getColor(group._id)?.toProperty();

          return (
            <Flex
              key={group._id}
              sx={{
                minWidth: ['auto', '100%'],
                pt: [0, 4],
              }}
            >
              <Flex
                sx={{
                  flexWrap: 'nowrap',
                  backgroundColor: '#121212',
                  borderStyle: 'solid',
                  borderWidth: '3px',
                  borderColor: color,
                  borderRadius: 'card',
                  boxShadow: '0px 3px 6px #00000040',
                  minHeight: ['450px', 'auto'],
                }}
              >
                <ChannelStrip
                  name={group.name}
                  channel={globalMode ? group : customGroup || group}
                  icon={
                    <Box
                      sx={{
                        backgroundColor: color,
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                      }}
                    >
                      <img alt={f('group')} src="/static/images/group-dark.svg" />
                    </Box>
                  }
                  elevation={4}
                  initialCollapse={window && window.innerWidth > 900}
                  global={globalMode}
                  resettable={(globalMode && (group.volume !== 1 || group.muted)) || !!customGroup}
                  onReset={() => {
                    if (globalMode) {
                      updateGroup(group._id, {
                        volume: 1,
                        muted: false,
                      });
                    } else if (customGroup) {
                      removeCustomGroup(customGroup._id);
                    }
                  }}
                  onChange={(volume, muted) => {
                    if (globalMode) {
                      updateGroup(group._id, { volume, muted });
                    } else {
                      setCustomGroup(group._id, { volume, muted });
                    }
                  }}
                  analyserL={
                    byGroup && byGroup[group._id] ? byGroup[group._id].analyserNodeL : undefined
                  }
                  analyserR={
                    byGroup && byGroup[group._id] ? byGroup[group._id].analyserNodeR : undefined
                  }
                >
                  {stageMembers.byGroup[group._id] && (
                    <Flex
                      sx={{
                        backgroundColor: '#1f1f1f',
                        flexWrap: 'nowrap',
                        borderRadius: 'card',
                      }}
                    >
                      {stageMembers.byGroup[group._id]
                        .map((id) => stageMembers.byId[id])
                        .map((stageMember, index, arr) => {
                          const user = users.byId[stageMember.userId];
                          const customStageMember = customStageMembers.byStageMember[
                            stageMember._id
                          ]
                            ? customStageMembers.byId[
                                customStageMembers.byStageMember[stageMember._id]
                              ]
                            : undefined;

                          return (
                            <ChannelStrip
                              elevation={2}
                              key={stageMember._id}
                              name={user.name}
                              channel={globalMode ? stageMember : customStageMember || stageMember}
                              icon={<img src="static/images/avatar.svg" />}
                              resettable={
                                (globalMode && (stageMember.volume !== 1 || stageMember.muted)) ||
                                !!customStageMember
                              }
                              onReset={() => {
                                if (globalMode) {
                                  updateStageMember(stageMember._id, {
                                    volume: 1,
                                    muted: false,
                                  });
                                } else if (customStageMember) {
                                  removeCustomStageMember(customStageMember._id);
                                }
                              }}
                              onChange={(volume, muted) => {
                                if (!globalMode) {
                                  setCustomStageMember(stageMember._id, { volume, muted });
                                } else {
                                  updateStageMember(stageMember._id, { volume, muted });
                                }
                              }}
                              analyserL={
                                byStageMember && byStageMember[stageMember._id]
                                  ? byStageMember[stageMember._id].analyserNodeL
                                  : undefined
                              }
                              analyserR={
                                byStageMember && byStageMember[stageMember._id]
                                  ? byStageMember[stageMember._id].analyserNodeR
                                  : undefined
                              }
                            >
                              {audioProducers.byStageMember[stageMember._id] && (
                                <Flex
                                  sx={{
                                    backgroundColor: '#292929',
                                    flexWrap: 'nowrap',
                                    borderRadius: 'card',
                                  }}
                                >
                                  {audioProducers.byStageMember[stageMember._id]
                                    .map((id) => audioProducers.byId[id])
                                    .map((audioProducer, index, arr) => {
                                      const customAudioProducer = customAudioProducers
                                        .byAudioProducer[audioProducer._id]
                                        ? customAudioProducers.byId[
                                            customAudioProducers.byAudioProducer[audioProducer._id]
                                          ]
                                        : undefined;

                                      return (
                                        <ChannelStrip
                                          key={audioProducer._id}
                                          name="Webtrack"
                                          elevation={1}
                                          icon={<img src="/static/images/track.svg" />}
                                          channel={
                                            globalMode
                                              ? audioProducer
                                              : customAudioProducer || audioProducer
                                          }
                                          global={globalMode}
                                          resettable={
                                            (globalMode &&
                                              (audioProducer.volume !== 1 ||
                                                audioProducer.muted)) ||
                                            !!customAudioProducer
                                          }
                                          onReset={() => {
                                            if (globalMode) {
                                              updateStageMemberAudio(audioProducer._id, {
                                                volume: 1,
                                                muted: false,
                                              });
                                            } else if (customAudioProducer) {
                                              removeCustomStageMemberAudio(customAudioProducer._id);
                                            }
                                          }}
                                          onChange={(volume, muted) => {
                                            if (!globalMode) {
                                              setCustomStageMemberAudio(audioProducer._id, {
                                                volume,
                                                muted,
                                              });
                                            } else {
                                              updateStageMemberAudio(audioProducer._id, {
                                                volume,
                                                muted,
                                              });
                                            }
                                          }}
                                          analyserL={
                                            byAudioProducer && byAudioProducer[audioProducer._id]
                                              ? byAudioProducer[audioProducer._id].analyserNode
                                              : undefined
                                          }
                                        />
                                      );
                                    })}
                                </Flex>
                              )}
                            </ChannelStrip>
                          );
                        })}
                    </Flex>
                  )}
                </ChannelStrip>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </React.Fragment>
  );
};
export default MixingPanel;
