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

import {ITeckosClient, TeckosClient} from 'teckos-client'
import {Device as MediasoupDevice} from 'mediasoup-client/lib/Device'
import {
  consume,
  createProducer,
  createWebRTCTransport,
  getRTPCapabilities,
  publishProducer, resumeConsumer,
  stopProducer,
  unpublishProducer,
} from './util'

import React from 'react'
import {ClientLogEvents, ClientLogPayloads, MediasoupAudioTrack, MediasoupVideoTrack} from '@digitalstage/api-types'
import {Transport} from 'mediasoup-client/lib/Transport'
import {Producer} from 'mediasoup-client/lib/Producer'
import {Consumer} from 'mediasoup-client/lib/Consumer'
import {logger} from '../../logger'
import {useEmit} from '../ConnectionService'
import {useErrorReporting} from '../../hooks/useErrorReporting'
import {useStageSelector} from '../../redux/selectors/useStageSelector'
import {useWebcam} from '../../provider/WebcamProvider'
import {useMicrophone} from '../../provider/MicrophoneProvider'
import {useLogServer} from "../../hooks/useLogServer";
import {Client} from "@sentry/types";

const {trace} = logger('MediasoupService')

type ConsumerList = { [trackId: string]: Consumer }
type DispatchConsumersList = React.Dispatch<React.SetStateAction<ConsumerList>>

const VideoConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchVideoConsumerContext = React.createContext<DispatchConsumersList>(undefined)
const AudioConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchAudioConsumerContext = React.createContext<DispatchConsumersList>(undefined)
const MediasoupProvider = ({children}: { children: React.ReactNode }) => {
  const [videoConsumers, setVideoConsumers] = React.useState<ConsumerList>({})
  const [audioConsumers, setAudioConsumers] = React.useState<ConsumerList>({})

  return (
    <DispatchVideoConsumerContext.Provider value={setVideoConsumers}>
      <VideoConsumerContext.Provider value={videoConsumers}>
        <DispatchAudioConsumerContext.Provider value={setAudioConsumers}>
          <AudioConsumerContext.Provider value={audioConsumers}>
            {children}
          </AudioConsumerContext.Provider>
        </DispatchAudioConsumerContext.Provider>
      </VideoConsumerContext.Provider>
    </DispatchVideoConsumerContext.Provider>
  )
}
const useVideoConsumers = (): ConsumerList => {
  const state = React.useContext(VideoConsumerContext)
  if (state === undefined)
    throw new Error('useVideoConsumers must be used within a MediasoupProvider')
  return state
}
const useAudioConsumers = (): ConsumerList => {
  const state = React.useContext(AudioConsumerContext)
  if (state === undefined)
    throw new Error('useAudioConsumers must be used within a MediasoupProvider')
  return state
}

const MediasoupService = () => {
  const emit = useEmit()
  const logToServer = useLogServer()
  const reportError = useErrorReporting()
  const localStageDeviceId = useStageSelector<string>((state) => state.globals.localStageDeviceId)
  const useP2P = useStageSelector<boolean>(state => state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].useP2P : undefined)
  const stageId = useStageSelector<string>((state) => state.globals.stageId)
  const routerUrl = useStageSelector<string>((state) => {
    if (state.globals.stageId) {
      const {audioType, videoType, mediasoup} = state.stages.byId[state.globals.stageId]
      if ((videoType === 'mediasoup' || audioType === 'mediasoup') && mediasoup?.url && mediasoup?.port) {
        return `${mediasoup.url}:${mediasoup.port}`
      }
    }
    return undefined
  })
  const audioType = useStageSelector((state) =>
    state.globals.stageId ? state.stages.byId[state.globals.stageId].audioType : undefined
  )
  const videoType = useStageSelector((state) =>
    state.globals.stageId ? state.stages.byId[state.globals.stageId].videoType : undefined
  )
  const [routerConnection, setRouterConnection] = React.useState<ITeckosClient>()
  const [device, setDevice] = React.useState<MediasoupDevice>()

  const log = React.useCallback((event: string, payload?: any) => {
    if(routerUrl) {
      logToServer(event, {
        ...payload,
        routerUrl: routerUrl
      })
    }
  }, [routerUrl, logToServer])

  // Creating connection to router
  React.useEffect(() => {
    if (routerUrl && reportError) {
      let abort = false
      let createdRouterConnection: ITeckosClient
      let createdDevice: MediasoupDevice
      const disconnect = () => {
        createdRouterConnection?.disconnect()
        setRouterConnection(undefined)
      }
      createdRouterConnection = new TeckosClient(routerUrl, {
        reconnection: true,
      })
      createdRouterConnection.on('disconnect', () => {
        trace(`Disconnected from router`)
        disconnect()
      })
      createdRouterConnection.on('connect', async () => {
        trace(`Connected to router ${routerUrl}`)
        setRouterConnection(createdRouterConnection)
        log(ClientLogEvents.MediasoupConnected)
        createdDevice = new MediasoupDevice()
        return getRTPCapabilities(createdRouterConnection)
          .then(async (routerRtpCapabilities) => {
            if (!abort) {
              await createdDevice.load({routerRtpCapabilities: routerRtpCapabilities})
              log(ClientLogEvents.MediasoupGotRtpCapabilities, {
                routerUrl
              })
              setDevice(createdDevice)
            }
          })
          .catch((err) => {
            reportError(err)
          })
      })
      log(ClientLogEvents.MediasoupConnecting)
      createdRouterConnection.connect()
      return () => {
        abort = true
        setDevice(undefined)
        setRouterConnection(undefined)
        disconnect()
      }
    }
  }, [routerUrl, reportError, log])

  const [sendTransport, setSendTransport] = React.useState<Transport>()
  // Assure, that send transport will be established
  React.useEffect(() => {
    if (routerConnection && device) {
      // Avoiding deadlock by checking send transport but assure that it will be always established
      if (!sendTransport) {
        let abort = false
        trace("Creating send transport")
        createWebRTCTransport(routerConnection, device, 'send')
          .then(transport => {
            transport.on('connectionstatechange', async (state) => {
              if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                reportError(`Send transport has been ${state} by router`)
                setSendTransport(undefined)
                log(ClientLogEvents.MediasoupSendTransportDisconnected)
              }
            })
            if (!abort) {
              trace("Created send transport")
              setSendTransport(transport)
              log(ClientLogEvents.MediasoupSendTransportConnected)
            } else {
              transport.close()
            }
          })
      }
    }
  }, [routerConnection, device, sendTransport, reportError, log])
  // Clean up existing send transport
  React.useEffect(() => {
    if (routerConnection && device && sendTransport) {
      return () => {
        trace("Closing send transport")
        sendTransport.close()
      }
    }
  }, [routerConnection, device, sendTransport])

  const [receiveTransport, setReceiveTransport] = React.useState<Transport>()
  // Assure, that receive transport will be established
  React.useEffect(() => {
    if (routerConnection && device) {
      // Avoiding deadlock by checking receive transport but assure that it will be always established
      if (!receiveTransport) {
        trace("Creating receive transport")
        createWebRTCTransport(routerConnection, device, 'receive')
          .then(transport => {
            transport.on('connectionstatechange', async (state) => {
              if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                reportError(`Receive transport has been ${state} by router`)
                setReceiveTransport(undefined)
                log(ClientLogEvents.MediasoupSendTransportDisconnected)
              }
            })
            trace("Created receive transport")
            setReceiveTransport(transport)
            log(ClientLogEvents.MediasoupReceiveTransportConnected)
          })
      }
    }
  }, [routerConnection, device, receiveTransport, log, reportError])
  // Clean up existing send transport
  React.useEffect(() => {
    if (routerConnection && device && receiveTransport) {
      return () => {
        trace("Closing receive transport")
        receiveTransport.close()
      }
    }
  }, [routerConnection, device, receiveTransport])


  const videoTracks = useStageSelector<MediasoupVideoTrack[]>((state) =>
    state.globals.stageId && state.videoTracks.byStage[state.globals.stageId]
      ? (state.videoTracks.byStage[state.globals.stageId]
        .map((id) => state.videoTracks.byId[id])
        .filter(
          (track) =>
            track.type === 'mediasoup' && track.stageDeviceId !== localStageDeviceId
        ) as MediasoupVideoTrack[])
      : []
  )
  const setVideoConsumers = React.useContext(DispatchVideoConsumerContext)
  React.useEffect(() => {
    if (routerConnection && device && receiveTransport && setVideoConsumers) {
      trace("Syncing video track list with current video consumer list")
      setVideoConsumers(prevState => {
        // Clean up by excluding obsolete consumers
        const existing: ConsumerList = Object.keys(prevState)
          .reduce<ConsumerList>((prev, trackId) => {
            if (videoTracks.find((track) => track._id === trackId)) {
              return {
                ...prev,
                [trackId]: prevState[trackId],
              }
            } else {
              trace(`Removed obsolete consumer ${prevState[trackId].id} for track ${trackId}`)
              prevState[trackId].close()
              log(ClientLogEvents.MediasoupConsumerRemoved, {
                consumerId: prevState[trackId].id,
                producerId: prevState[trackId].producerId,
                trackId: trackId,
                kind: 'video',
              } as Partial<ClientLogPayloads.MediasoupConsumerRemoved>)
            }
            return prev
          }, {})

        // Add new async (and add them later)
        videoTracks.map((track) => {
          if (!existing[track._id]) {
            // Create new consumer for this video track
            consume(
              routerConnection,
              receiveTransport,
              device,
              track.producerId
            )
              .then((consumer) => {
                if (consumer.paused) {
                  trace(`Consumer ${consumer.id} is paused, try to resume it`)
                  return resumeConsumer(routerConnection, consumer)
                }
              })
              .then((consumer) => {
                  trace(`Consuming now video ${track._id} with producer ${track.producerId}`)
                  setVideoConsumers((prev) => ({...prev, [track._id]: consumer}))
                  log(ClientLogEvents.MediasoupConsumerCreated, {
                    consumerId: consumer.id,
                    producerId: consumer.producerId,
                    trackId: track._id,
                    kind: 'video',
                  } as Partial<ClientLogPayloads.MediasoupConsumerCreated>)
                  consumer.track.addEventListener("mute", () => {
                    trace(`Track of consumer ${consumer.id} for video ${track._id} is muted`)
                    log(ClientLogEvents.MediasoupConsumerMuteChanged, {
                      consumerId: consumer.id,
                      producerId: consumer.producerId,
                      trackId: track._id,
                      kind: 'video',
                      muted: true
                    } as Partial<ClientLogPayloads.MediasoupConsumerChanged>)
                  })
                  consumer.track.addEventListener("unmute", () => {
                      trace(`Track of consumer ${consumer.id} for video ${track._id} is unmuted`)
                      log(ClientLogEvents.MediasoupConsumerMuteChanged, {
                        consumerId: consumer.id,
                        producerId: consumer.producerId,
                        trackId: track._id,
                        kind: 'video',
                        muted: false
                      } as Partial<ClientLogPayloads.MediasoupConsumerChanged>)
                    }
                  )
                }
              ).catch(err => reportError(err))
          }
        })

        return existing
      })
    }
  }, [videoTracks, routerConnection, receiveTransport, device, log, reportError, setVideoConsumers])
  React.useEffect(() => {
    if(receiveTransport && setVideoConsumers) {
      return () => {
        setVideoConsumers(prevState => {
          Object.values(prevState).map(consumer => consumer.close())
          return {}
        })
      }
    }
  }, [receiveTransport, setVideoConsumers])

  const localVideoTrack = useWebcam()
  React.useEffect(() => {
    if (
      emit &&
      reportError &&
      routerConnection &&
      sendTransport &&
      stageId &&
      videoType === 'mediasoup' &&
      localVideoTrack &&
      !useP2P
    ) {
      let abort: boolean = false
      let producer: Producer
      let publishedId: string
      let timeout
      const track = localVideoTrack.clone()
      trace(`Publishing local video`)
      ;(async () => {
        try {
          if (!abort) {
            producer = await createProducer(sendTransport, track)
          }
          if (!abort && producer.paused) {
            trace(`Video producer ${producer.id} is paused`)
            producer.resume()
          }
          if (!abort) {
            const {_id} = await publishProducer(emit, stageId, producer.id, 'video')
            publishedId = _id
            trace(`Published local video track ${track.id}/producer ${producer.id} as video ${publishedId}`)
            log(ClientLogEvents.MediasoupProducerCreated, {
              producerId: producer.id,
              trackId: publishedId
            } as Partial<ClientLogPayloads.MediasoupProducerCreated>)
          }
        } catch (err) {
          reportError(`Could not produce or publish local video track ${track.id}. Reason: ${err}`)
        }
      })()
      return () => {
        abort = true
        if (timeout) {
          clearTimeout(timeout)
        }
        if (publishedId && producer) {
          log(ClientLogEvents.MediasoupProducerRemoved, {
            producerId: producer.id,
            trackId: publishedId
          } as Partial<ClientLogPayloads.MediasoupProducerRemoved>)
        }
        if (emit && publishedId) {
          unpublishProducer(emit, publishedId, 'video')
            .then(() => trace(`Un-published local video track ${track.id} published as video ${publishedId}`))
            .catch((err) => reportError(
              `Could not un-publish local video track ${track?.id} published as video ${publishedId}. Reason: ${err}`
            ))
        }
        if (routerConnection && producer) {
          stopProducer(routerConnection, producer).catch((err) =>
            reportError(
              `Could not stop producer ${producer.id} of local video track ${track?.id} published as video ${publishedId}. Reason: ${err}`
            )
          )
        }
        if (track) {
          track.stop()
        }
      }
    }
  }, [emit, stageId, reportError, useP2P, videoType, localVideoTrack, routerConnection, sendTransport, log])

  return null
}
export {
  MediasoupService,
  MediasoupProvider,
  useVideoConsumers,
  useAudioConsumers,
}
