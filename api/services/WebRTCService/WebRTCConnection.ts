'use strict'
import { config } from './config'
import debug from 'debug'
import { SocketEvent } from 'teckos-client/dist/types'
import { ITeckosClient } from 'teckos-client'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'

const log = debug('WebRTCProvider').extend('Connection')
const logWarning = log.extend('warn')
const logError = log.extend('error')

export type OnTrackCallback = (track: MediaStreamTrack) => void

class WebRTCConnection {
    private readonly connection: RTCPeerConnection
    private readonly polite?: boolean
    private readonly localStageDeviceId: string
    private readonly stageDeviceId: string
    private readonly emit: ITeckosClient['emit']
    private readonly onTrack: OnTrackCallback
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
            logWarning('iceConnectionState', this.connection.iceConnectionState)
            if (this.connection.connectionState == 'failed') this.connection.restartIce()
        }
        this.connection.onnegotiationneeded = async () => {
            try {
                log('Making offer', this.polite ? 'polite' : 'rude')
                this.makingOffer = true
                await this.connection.setLocalDescription()
                log('Sending offer to ' + stageDeviceId)
                return emit(ClientDeviceEvents.SendP2POffer, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    offer: this.connection.localDescription,
                } as ClientDevicePayloads.SendP2POffer)
            } catch (err) {
                logError(err)
            } finally {
                this.makingOffer = false
            }
        }
        this.connection.onicecandidateerror = (e) => {
            logError(e.errorCode + ': ' + e.errorText)
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
            logWarning('connectionState', this.connection.connectionState)
        }
        this.connection.onsignalingstatechange = () => {
            logWarning('signalingState', this.connection.signalingState)
        }
    }

    public connect() {
        log('connect()')
        if (!this.videoSender) {
            this.videoSender = this.connection.addTransceiver('video').sender
        }
        if (!this.audioSender) {
            this.audioSender = this.connection.addTransceiver('audio').sender
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
                log(
                    'Ignoring offer',
                    this.makingOffer,
                    this.polite ? 'polite' : 'rude',
                    this.connection.signalingState
                )
                return
            }
            log(
                'Accepting offer',
                this.makingOffer,
                this.polite ? 'polite' : 'rude',
                this.connection.signalingState
            )
            await this.connection.setRemoteDescription(description)
            await this.connection.setLocalDescription()
            log(
                'Answering offer',
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
            log(
                'Accepting answer',
                this.makingOffer,
                this.polite ? 'polite' : 'rude',
                this.connection.signalingState
            )
            await this.connection.setRemoteDescription(description)
        } else {
            log('HÄH?')
        }
    }

    public addIceCandidate(iceCandidate: RTCIceCandidate | null): Promise<void> {
        return this.connection.addIceCandidate(iceCandidate).catch((err) => {
            if (!this.ignoreOffer) {
                logError(err)
            } else {
                logError('Ignoring error, since Im making an offer right now')
            }
        })
    }

    public async setVideoTrack(track: MediaStreamTrack): Promise<void> {
        if (this.videoSender) {
            if (!this.videoSender.track || track.id !== this.videoSender.track.id) {
                await this.videoSender.replaceTrack(track)
            }
        } else {
            this.videoSender = this.connection.addTrack(track)
        }
    }

    public async setAudioTrack(track: MediaStreamTrack): Promise<void> {
        if (this.audioSender) {
            if (!this.audioSender.track || track.id !== this.audioSender.track.id) {
                await this.audioSender.replaceTrack(track)
            }
        } else {
            this.audioSender = this.connection.addTrack(track)
        }
    }
}

export default WebRTCConnection
