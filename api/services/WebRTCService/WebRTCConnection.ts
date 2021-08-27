'use strict'
import { config } from './config'
import debug from 'debug'
import { ITeckosClient } from 'teckos-client'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'

const report = debug('WebRTCService').extend('WebRTCConnection')
const reportTrace = report.extend('trace')
const reportError = report.extend('error')

export type OnTrackCallback = (track: MediaStreamTrack) => void

class WebRTCConnection {
    private readonly connection: RTCPeerConnection
    private readonly polite?: boolean
    private readonly localStageDeviceId: string
    private readonly stageDeviceId: string
    private readonly emit: ITeckosClient['emit']
    private readonly onTrack: OnTrackCallback
    private initialVideoSender: RTCRtpSender
    private initialAudioSender: RTCRtpSender
    private videoSender: RTCRtpSender
    private audioSender: RTCRtpSender
    private makingOffer: boolean = false
    private ignoreOffer: boolean = false

    constructor(
        localStageDeviceId: string,
        stageDeviceId: string,
        emit: ITeckosClient['emit'],
        onTrack: OnTrackCallback
    ) {
        this.localStageDeviceId = localStageDeviceId
        this.stageDeviceId = stageDeviceId
        this.emit = emit
        this.onTrack = onTrack
        this.polite = localStageDeviceId.localeCompare(stageDeviceId) > 0
        this.connection = new RTCPeerConnection(config)
        this.connection.oniceconnectionstatechange = () => {
            reportTrace(
                `with ${this.stageDeviceId}: iceConnectionState`,
                this.connection.iceConnectionState
            )
            if (this.connection.connectionState == 'failed') this.connection.restartIce()
        }
        this.connection.onnegotiationneeded = async () => {
            try {
                reportTrace(
                    `to ${this.stageDeviceId}: Making offer`,
                    this.polite ? 'polite' : 'rude'
                )
                this.makingOffer = true
                await this.connection.setLocalDescription()
                reportTrace(`to ${this.stageDeviceId}: Sending offer to ${stageDeviceId}`)
                return emit(ClientDeviceEvents.SendP2POffer, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    offer: this.connection.localDescription,
                } as ClientDevicePayloads.SendP2POffer)
            } catch (err) {
                reportError(err)
            } finally {
                this.makingOffer = false
            }
        }
        this.connection.onicecandidateerror = (e) => {
            reportError(e)
        }
        this.connection.ontrack = (ev) => {
            if (
                (!this.videoSender || ev.track.id !== this.videoSender.track?.id) &&
                (!this.audioSender || ev.track.id !== this.audioSender.track?.id)
            )
                this.onTrack(ev.track)
        }
        this.connection.onicecandidate = (ev) =>
            this.emit(ClientDeviceEvents.SendIceCandidate, {
                from: this.localStageDeviceId,
                to: this.stageDeviceId,
                iceCandidate: ev.candidate,
            } as ClientDevicePayloads.SendIceCandidate)

        this.connection.onconnectionstatechange = () => {
            reportTrace(
                `with ${this.stageDeviceId}: connectionState`,
                this.connection.connectionState
            )
        }
        this.connection.onsignalingstatechange = () => {
            reportTrace(
                `with ${this.stageDeviceId}: signalingState`,
                this.connection.signalingState
            )
        }
    }

    public connect() {
        reportTrace(`to ${this.stageDeviceId}: connect()`)
        if (!this.initialVideoSender) {
            this.initialVideoSender = this.connection.addTransceiver('video').sender
        }
        if (!this.initialAudioSender) {
            this.initialAudioSender = this.connection.addTransceiver('audio').sender
        }
    }

    public close() {
        this.connection.close()
    }

    public async addDescription(description: RTCSessionDescriptionInit): Promise<void> {
        if (description.type == 'offer') {
            // Detect collision
            this.ignoreOffer = !this.polite && this.makingOffer
            if (this.ignoreOffer) {
                reportTrace(
                    `from ${this.stageDeviceId}: Ignoring offer`,
                    this.makingOffer,
                    this.polite ? 'polite' : 'rude',
                    this.connection.signalingState
                )
                return
            }
            reportTrace(
                `from ${this.stageDeviceId}: Accepting offer`,
                this.makingOffer,
                this.polite ? 'polite' : 'rude',
                this.connection.signalingState
            )
            await this.connection.setRemoteDescription(description)
            await this.connection.setLocalDescription()
            reportTrace(
                `to ${this.stageDeviceId}: Answering offer`,
                this.makingOffer,
                this.polite ? 'polite' : 'rude',
                this.connection.signalingState
            )
            this.emit(ClientDeviceEvents.SendP2PAnswer, {
                from: this.localStageDeviceId,
                to: this.stageDeviceId,
                answer: this.connection.localDescription,
            } as ClientDevicePayloads.SendP2PAnswer)
        } else if (this.connection.signalingState === 'have-local-offer') {
            reportTrace(
                `from ${this.stageDeviceId}: Accepting answer`,
                this.makingOffer,
                this.polite ? 'polite' : 'rude',
                this.connection.signalingState
            )
            await this.connection.setRemoteDescription(description)
        }
    }

    public addIceCandidate(iceCandidate: RTCIceCandidate | null): Promise<void> {
        return this.connection.addIceCandidate(iceCandidate).catch((err) => {
            if (!this.ignoreOffer) {
                reportError(err)
            } else {
                reportError(
                    `from ${this.stageDeviceId}: Ignoring error, since Im making an offer right now`
                )
            }
        })
    }

    public addTrack(track: MediaStreamTrack): void {
        reportTrace(`to ${this.stageDeviceId}: Adding track ${track.id}`)
        this.connection.addTrack(track)
        if (track.kind === 'video' && this.initialVideoSender) {
            reportTrace(`to ${this.stageDeviceId}: Removing initial sender`)
            this.connection.removeTrack(this.initialVideoSender)
            this.initialVideoSender = undefined
        } else if (track.kind === 'audio' && this.initialAudioSender) {
            this.connection.removeTrack(this.initialAudioSender)
            this.initialAudioSender = undefined
        }
    }

    public removeTrack(id: string): void {
        //TODO: Discuss if removal of track is necessary when track is ended
        const sender = this.connection.getSenders().find((sender) => sender.track?.id === id)
        if (sender) {
            this.connection.removeTrack(sender)
        }
    }
}

export { WebRTCConnection }
