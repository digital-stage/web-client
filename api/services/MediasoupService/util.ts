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

import mediasoupClient from 'mediasoup-client'
import {ITeckosClient} from 'teckos-client'

import {
  AudioTrack,
  ClientDeviceEvents,
  ClientDevicePayloads, ClientMediasoupEvents, ClientMediasoupPayloads,
  MediasoupAudioTrack,
  MediasoupVideoTrack,
  VideoTrack,
} from '@digitalstage/api-types'
import {Device} from 'mediasoup-client/lib/Device'
import {SocketEvent} from 'teckos-client/dist/types'
import {logger} from '../../logger'
import {ClientMediasoupCallbacks} from "@digitalstage/api-types/dist/ClientMediasoupCallbacks";

const {trace, reportError} = logger('MediasoupService:utils')

export const getRTPCapabilities = (routerConnection: ITeckosClient) => {
  return new Promise<mediasoupClient.types.RtpCapabilities>((resolve, reject) => {
    const callback: ClientMediasoupCallbacks.GetRTPCapabilities<mediasoupClient.types.RtpCapabilities> =
      (error, retrievedRtpCapabilities) => {
        if (error) {
          reject(new Error(error))
        }
        resolve(retrievedRtpCapabilities)
      }
    routerConnection.emit(
      ClientMediasoupEvents.GetRTPCapabilities,
      {} as ClientMediasoupPayloads.GetRTPCapabilities,
      callback
    )
  })
}

export const createWebRTCTransport = (
  routerConnection: ITeckosClient,
  device: mediasoupClient.Device,
  direction: 'send' | 'receive'
): Promise<mediasoupClient.types.Transport> =>
  new Promise<mediasoupClient.types.Transport>((resolve, reject) => {
    trace('createWebRTCTransport')
    const callback: ClientMediasoupCallbacks.CreateTransport = (error, transportOptions) => {
      if (error) {
        return reject(error)
      }
      const transport: mediasoupClient.types.Transport =
        direction === 'send'
          ? device.createSendTransport(transportOptions)
          : device.createRecvTransport(transportOptions)
      transport.on('connect', ({dtlsParameters}, callback, errCallback) => {
        trace(`createWebRTCTransport:transport:${direction}:connect`)
        routerConnection.emit(
          ClientMediasoupEvents.ConnectTransport,
          {
            transportId: transport.id,
            dtlsParameters,
          } as ClientMediasoupPayloads.ConnectTransport<mediasoupClient.types.DtlsParameters>,
          (transportError: string) => {
            if (transportError) {
              reportError(error)
              return errCallback(error)
            }
            return callback()
          }
        )
      })
      if (direction === 'send') {
        transport.on('produce', (producer, callback, errCallback) => {
          trace(`createWebRTCTransport:transport:${direction}:produce`)
          routerConnection.emit(
            ClientMediasoupEvents.CreateProducer,
            {
              transportId: transport.id,
              kind: producer.kind,
              rtpParameters: producer.rtpParameters,
              appData: producer.appData,
            } as ClientMediasoupPayloads.CreateProducer<mediasoupClient.types.RtpParameters>,
            (produceError: string | undefined, payload: any) => {
              if (produceError) {
                reportError(produceError)
                return errCallback(produceError)
              }
              return callback({
                ...producer,
                id: payload.id,
              })
            }
          )
        })
      }
      return resolve(transport)
    }
    routerConnection.emit(
      ClientMediasoupEvents.CreateTransport,
      {} as ClientMediasoupPayloads.CreateTransport,
      callback
    )
  })

export const createProducer = (
  transport: mediasoupClient.types.Transport,
  track: MediaStreamTrack
): Promise<mediasoupClient.types.Producer> =>
  transport.produce({
    track,
    appData: {
      trackId: track.id,
    },
  })
export const pauseProducer = (
  socket: ITeckosClient,
  producer: mediasoupClient.types.Producer
): Promise<mediasoupClient.types.Producer> =>
  new Promise<mediasoupClient.types.Producer>((resolve, reject) =>
    socket.emit(ClientMediasoupEvents.PauseProducer, producer.id as ClientMediasoupPayloads.PauseProducer, (error?: string) => {
      if (error) {
        reportError(error)
        return reject(error)
      }
      producer.pause()
      trace(`Paused producer ${producer.id}`)
      return resolve(producer)
    })
  )

export const resumeProducer = (
  socket: ITeckosClient,
  producer: mediasoupClient.types.Producer
): Promise<mediasoupClient.types.Producer> =>
  new Promise<mediasoupClient.types.Producer>((resolve, reject) =>
    socket.emit(ClientMediasoupEvents.ResumeProducer, producer.id as ClientMediasoupPayloads.ResumeProducer, (error?: string) => {
      if (error) {
        reportError(error)
        return reject(error)
      }
      producer.resume()
      trace(`Resumed producer ${producer.id}`)
      return resolve(producer)
    })
  )

export const stopProducer = (
  socket: ITeckosClient,
  producer: mediasoupClient.types.Producer
): Promise<mediasoupClient.types.Producer> =>
  new Promise<mediasoupClient.types.Producer>((resolve, reject) =>
    socket.emit(ClientMediasoupEvents.CloseProducer, producer.id as ClientMediasoupPayloads.CloseProducer, (error?: string) => {
      if (error) {
        reportError(error)
        return reject(error)
      }
      producer.close()
      trace(`Stopped producer ${producer.id}`)
      return resolve(producer)
    })
  )

export const createConsumer = (
  socket: ITeckosClient,
  device: mediasoupClient.Device,
  transport: mediasoupClient.types.Transport,
  producerId: string
): Promise<mediasoupClient.types.Consumer> =>
  new Promise<mediasoupClient.types.Consumer>((resolve, reject) => {
    console.log(device.rtpCapabilities)
    const callback: ClientMediasoupCallbacks.CreateConsumer<mediasoupClient.types.RtpParameters> = (error, data) => {
      if (error) {
        reportError(error)
        return reject(error)
      }
      trace(
        `Server created consumer ${data.id} for producer ${data.producerId}, consuming now`
      )
      return transport.consume(data).then((consumer) => {
        if (data.paused) {
          trace('Pausing consumer, but it is paused server-side ...')
          consumer.pause()
        }
        /*
        if(data.paused) {
          // Avoid calling pause() on consumer for safari (refer to: https://mediasoup.discourse.group/t/producer-pause-still-uploading-streams/167/4)
          return resumeConsumer(socket, consumer)
            .then(consumer => resolve(consumer))
        }*/
        return resolve(consumer)
      })
    }
    socket.emit(
      ClientMediasoupEvents.CreateConsumer,
      {
        producerId,
        transportId: transport.id,
        rtpCapabilities: device.rtpCapabilities,
      } as ClientMediasoupPayloads.CreateConsumer<mediasoupClient.types.RtpCapabilities>,
      callback
    )
  })

export const resumeConsumer = (
  routerConnection: ITeckosClient,
  consumer: mediasoupClient.types.Consumer
): Promise<mediasoupClient.types.Consumer> => {
  if (consumer.paused) {
    return new Promise<mediasoupClient.types.Consumer>((resolve, reject) =>
      routerConnection.emit(ClientMediasoupEvents.ResumeConsumer, consumer.id as ClientMediasoupPayloads.ResumeConsumer, (error?: string) => {
        if (error) return reject(error)
        consumer.resume()
        trace(`Resumed consumer ${consumer.id}`)
        return resolve(consumer)
      })
    )
  }
  return Promise.reject(new Error('Consumer is paused yet'))
}

export const pauseConsumer = (
  socket: ITeckosClient,
  consumer: mediasoupClient.types.Consumer
): Promise<mediasoupClient.types.Consumer> => {
  if (!consumer.paused) {
    return new Promise<mediasoupClient.types.Consumer>((resolve, reject) =>
      socket.emit(ClientMediasoupEvents.PauseConsumer, consumer.id as ClientMediasoupPayloads.PauseConsumer, (error?: string) => {
        if (error) {
          reportError(error)
          return reject(error)
        }
        consumer.pause()
        trace(`Paused consumer ${consumer.id}`)
        return resolve(consumer)
      })
    )
  }
  return Promise.reject(new Error('Consumer is not paused'))
}

export const closeConsumer = (
  socket: ITeckosClient,
  consumer: mediasoupClient.types.Consumer
): Promise<mediasoupClient.types.Consumer> =>
  new Promise<mediasoupClient.types.Consumer>((resolve, reject) =>
    socket.emit(ClientMediasoupEvents.CloseConsumer, consumer.id as ClientMediasoupPayloads.CloseConsumer, (error?: string) => {
      if (error) {
        reportError(error)
        return reject(error)
      }
      consumer.close()
      trace(`Closed consumer ${consumer.id}`)
      return resolve(consumer)
    })
  )

export const produce = (
  sendTransport: mediasoupClient.types.Transport,
  track: MediaStreamTrack
): Promise<mediasoupClient.types.Producer> => {
  trace(`Creating producer for track ${track.id}`)
  if (!track) throw new Error('Could not create producer: Track is undefined')
  return createProducer(sendTransport, track).then((producer) => {
    if (producer.paused) {
      trace(`Producer ${producer.id} is paused`)
    }
    return producer
  })
}

export const publishProducer = (
  emit: (event: SocketEvent, ...args: any[]) => boolean,
  stageId: string,
  producerId: string,
  kind: 'video' | 'audio'
) =>
  new Promise<MediasoupVideoTrack | MediasoupAudioTrack>((resolve, reject) => {
    let payload: ClientDevicePayloads.CreateVideoTrack & ClientDevicePayloads.CreateAudioTrack =
      {
        type: 'mediasoup',
        stageId,
        producerId: producerId,
      }
    if (kind === 'audio') {
      payload = {
        ...payload,
        y: -1,
        rZ: 0,
      }
    }
    emit(
      kind === 'video'
        ? ClientDeviceEvents.CreateVideoTrack
        : ClientDeviceEvents.CreateAudioTrack,
      payload,
      (error: string | null, track?: VideoTrack | AudioTrack) => {
        if (error) {
          return reject(error)
        }
        if (!track) {
          return reject(new Error('No video track provided by server'))
        }
        if (kind === 'audio') {
          return resolve(track as MediasoupAudioTrack)
        }
        return resolve(track as MediasoupVideoTrack)
      }
    )
  })

//TODO: Could not find and delete video track 61360626d9af335fa4f51b6c very often ...
export const unpublishProducer = (
  emit: (event: SocketEvent, ...args: any[]) => boolean,
  publishedId: string,
  kind: 'video' | 'audio'
) =>
  new Promise<void>((resolve, reject) => {
    if (kind === 'video') {
      emit(ClientDeviceEvents.RemoveVideoTrack, publishedId, (error: string | null) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    } else {
      emit(ClientDeviceEvents.RemoveAudioTrack, publishedId, (error: string | null) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      })
    }
  })

export const consume = (
  routerConnection: ITeckosClient,
  receiveTransport: mediasoupClient.types.Transport,
  device: mediasoupClient.Device,
  producerId: string
): Promise<mediasoupClient.types.Consumer> => {
  trace(`Consuming ${producerId}`)
  return createConsumer(routerConnection, device, receiveTransport, producerId).then(
    async (localConsumer) => {
      trace(`Created consumer ${localConsumer.id} to consume ${producerId}`)
      return localConsumer
    }
  )
}

export const connect = (
  routerConnection: ITeckosClient
): Promise<{
  device: mediasoupClient.types.Device
  sendTransport: mediasoupClient.types.Transport
  receiveTransport: mediasoupClient.types.Transport
}> => {
  const device = new Device()
  return getRTPCapabilities(routerConnection)
    .then((rtpCapabilities) => device.load({routerRtpCapabilities: rtpCapabilities}))
    .then(() =>
      Promise.all([
        createWebRTCTransport(routerConnection, device, 'send'),
        createWebRTCTransport(routerConnection, device, 'receive'),
      ])
    )
    .then((transports) => ({
      device,
      sendTransport: transports[0],
      receiveTransport: transports[1],
    }))
}