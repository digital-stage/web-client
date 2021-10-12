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

import {SocketEvent} from "teckos-client/dist/types";
import {ITeckosClient, TeckosClientWithJWT} from "teckos-client";
import {
  MediasoupAudioTrack, MediasoupVideoTrack,
  ServerMediasoupEvents,
  ServerMediasoupPayloads
} from "@digitalstage/api-types";
import {Device as MediasoupDevice} from "mediasoup-client"
import {EventEmitter} from "events";
import {Transport as MediasoupTransport} from "mediasoup-client/lib/Transport";
import {Producer as MediasoupProducer} from "mediasoup-client/lib/Producer";
import omit from "lodash/omit";
import {Consumer as MediasoupConsumer} from "mediasoup-client/lib/Consumer";
import {logger} from "api/logger";
import {publishTrack, unpublishTrack} from "api/utils/trackPublishing";
import {
  closeConsumer,
  createConsumer,
  createProducer,
  createWebRTCTransport,
  getRTPCapabilities,
  resumeConsumer,
  stopProducer,
} from "./util";

const {trace} = logger('MediasoupHandler')

export type ProducersList = {
  [publishedTrackId: string]: MediasoupProducer
}
export type ConsumersList = {
  [publicTrackId: string]: MediasoupConsumer
}


export enum Events {
  Connected = "connected",
  Disconnected = "disconnected",

  ProducerAdded = "producer-added",
  ProducerRemoved = "producer-removed",

  ConsumerAdded = "consumer-added",
  ConsumerRemoved = "consumer-removed",
  Error = "error"
}

class MediasoupHandler extends EventEmitter {
  private readonly emitToServer: (event: SocketEvent, ...args: any[]) => boolean

  private readonly stageId: string

  private readonly routerConnection: ITeckosClient

  private readonly device: MediasoupDevice

  private sendTransport: MediasoupTransport | undefined

  private receiveTransport: MediasoupTransport | undefined

  private producers: ProducersList = {}

  private consumers: ConsumersList = {}

  public emit(eventName: Events, ...args: any[]): boolean {
    return super.emit(eventName, args)
  }

  constructor(token: string, routerUrl: string, stageId: string, emit: (event: SocketEvent, ...args: any[]) => boolean) {
    super()
    trace(`constructor(${token}, ${routerUrl}, ${stageId}, ...)`)
    this.stageId = stageId
    this.routerConnection = new TeckosClientWithJWT(routerUrl, {reconnection: true, debug: true}, token, {
      stageId
    })
    this.device = new MediasoupDevice()
    this.emitToServer = emit
    this.init()
  }

  public connect() {
    trace('connect()')
    this.routerConnection.connect()
  }

  public disconnect() {
    trace('disconnect()')
    this.routerConnection.disconnect()
  }

  public async addTrack(track: MediaStreamTrack): Promise<ProducersList> {
    trace('addTrack()')
    if(!this.sendTransport)
      throw new Error("Not connected")
    const producer = await createProducer(this.sendTransport, track)
    track.onended = () => {
      producer.close()
    }
    try {
      const kind = track.kind === 'audio' ? 'audio' : 'video'
      const settings = track.getSettings()
      const capabilities = track.getCapabilities && track.getCapabilities()
      const publishedTrack = await publishTrack(this.emitToServer, this.stageId, kind, {
        producerId: producer.id,
        capabilities,
        ...settings,
        type: "mediasoup",
      }) as MediasoupVideoTrack | MediasoupAudioTrack
      this.producers = {
        ...this.producers,
        [publishedTrack._id]: producer
      }
      track.onended = () => {
        this.removeProducer(publishedTrack._id)
          .catch(this.handleError)
      }
      this.emit(Events.ProducerAdded, producer)
      return this.producers
    } catch (err) {
      this.handleError(err)
      producer.close()
      throw err
    }
  }

  public async removeTrack(trackId: string): Promise<ProducersList> {
    trace('removeTrack()')
    const publishedTrackId = Object.keys(this.producers).find(currId => this.producers[currId].track?.id === trackId)
    if (publishedTrackId) {
      return this.removeProducer(publishedTrackId)
        .then(() => this.producers)
    }
    throw new Error("Track not found")
  }

  public async consume(publicTrack: MediasoupAudioTrack | MediasoupVideoTrack): Promise<MediasoupConsumer> {
    trace('consume()')
    if(!this.receiveTransport)
      throw new Error("Not connected")
    let consumer = await createConsumer(
      this.routerConnection,
      this.device,
      this.receiveTransport,
      publicTrack.producerId
    )
    if (consumer.paused) {
      consumer = await resumeConsumer(this.routerConnection, consumer)
    }
    this.consumers = {
      ...this.consumers,
      [publicTrack._id]: consumer
    }
    this.emit(Events.ConsumerAdded, consumer.track)
    return consumer
  }

  public async stopConsuming(publicTrackId: string): Promise<MediasoupConsumer> {
    trace('stopConsuming()')
    const consumer = this.consumers[publicTrackId]
    if (consumer) {
      this.consumers = omit(this.consumers, publicTrackId)
      await closeConsumer(this.routerConnection, consumer)
      this.emit(Events.ConsumerRemoved, consumer)
      return consumer
    }
    throw new Error(`Consumer for public track ${publicTrackId} not found`)
  }

  public async syncWithPublicTracks(publicTracks: MediasoupAudioTrack[] | MediasoupVideoTrack[]) {
    trace('syncWithPublicTracks()')
    // Clean up
    for (const publicTrackId of Object.keys(this.consumers)) {
      if (!publicTracks.find(publicTrack => publicTrack._id === publicTrackId)) {
        await this.stopConsuming(publicTrackId)
      }
    }
    // Add new
    for (const publicTrack of publicTracks) {
      if (!this.consumers[publicTrack._id]) {
        await this.consume(publicTrack)
      }
    }
    return this.consumers
  }

  private removeProducer = async (publishedTrackId: string): Promise<void> => {
    trace('removeProducer()')
    const producer = this.producers[publishedTrackId]
    if (producer) {
      await stopProducer(this.routerConnection, producer)
      this.producers = omit(this.producers, publishedTrackId)
      this.emit(Events.ProducerRemoved, producer)
      await unpublishTrack(this.emitToServer, publishedTrackId, producer.track?.kind === 'audio' ? 'audio' : 'video')
    }
  }

  private async handleConnect() {
    trace('handleConnect()')
    if(!this.device.loaded) {
      // Get RTP capabilities
      const routerRtpCapabilities = await getRTPCapabilities(this.routerConnection)
      // Tell device
      await this.device.load({routerRtpCapabilities})
      // Create send transport
      trace("Creating send transport")
      this.sendTransport = await createWebRTCTransport(this.routerConnection, this.device, "send")
      trace("Creating receive transport")
      this.receiveTransport = await createWebRTCTransport(this.routerConnection, this.device, "receive")
    }
    this.emit(Events.Connected)
  }

  private async handleDisconnect() {
    trace('handleDisconnect()')
    if (this.receiveTransport) {
      this.receiveTransport.close()
    }
    if (this.sendTransport) {
      this.sendTransport.close()
    }
    this.emit(Events.Disconnected)
  }

  private handleError(err: any) {
    trace('handleError()')
    this.emit(Events.Error, err)
    console.error(err)
  }

  private init() {
    trace('init()')
    this.routerConnection.on("connect", () => this.handleConnect())
    this.routerConnection.on("disconnect", () => this.handleDisconnect())
    this.routerConnection.on(ServerMediasoupEvents.ConsumerClosed, (id: ServerMediasoupPayloads.ConsumerClosed) => {
      const publicTrackId = Object.keys(this.consumers).find(currId => this.consumers[currId].id === id)
      if (publicTrackId) {
        this.stopConsuming(publicTrackId)
          .catch(this.handleError)
      }
    })
    this.routerConnection.on(ServerMediasoupEvents.ProducerClosed, (id: ServerMediasoupPayloads.ProducerClosed) => {
      const publishedTrackId = Object.keys(this.producers).find(currId => this.producers[currId].id === id)
      if (publishedTrackId) {
        this.removeProducer(publishedTrackId)
          .catch(this.handleError)
      }
    })
    this.routerConnection.on(ServerMediasoupEvents.TransportClosed, (_: ServerMediasoupPayloads.TransportClosed) => {
      // TODO: Try to reconnect specific transport or close if failing
    })
    this.routerConnection.on(ServerMediasoupEvents.TransportPaused, (id: ServerMediasoupPayloads.TransportPaused) => {
      if (this.sendTransport && this.sendTransport.id === id) {
      }
    })
    this.routerConnection.on(ServerMediasoupEvents.TransportResumed, (_: ServerMediasoupPayloads.TransportResumed) => {

    })
  }
}

export {MediasoupHandler}