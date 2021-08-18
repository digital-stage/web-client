'use strict'
import { config } from './config'
import debug from 'debug'

interface Events {
    trackAdded: 'track-added'
}

const log = debug('WebRTCService').extend('Connection')
const logError = log.extend('error')

export type SendDescription = (description: RTCSessionDescriptionInit) => void
export type SendIceCandidate = (iceCandidate: RTCIceCandidate) => void

class WebRTCConnection {
    private readonly connection: RTCPeerConnection
    private readonly polite?: boolean
    private readonly sendDescription: SendDescription
    public onTrack?: (track: MediaStreamTrack) => void
    private videoSender: RTCRtpSender
    private audioSender: RTCRtpSender
    private makingOffer: boolean = false
    private ignoreOffer: boolean = false

    constructor(
        sendDescription: SendDescription,
        sendIceCandidate: SendIceCandidate,
        polite?: boolean
    ) {
        log('Created new connection')
        this.sendDescription = sendDescription
        this.polite = polite
        this.connection = new RTCPeerConnection(config)
        this.connection.oniceconnectionstatechange = () => {
            log('oniceconnectionstatechange: ' + this.connection.iceConnectionState)
            if (this.connection.connectionState == 'failed') this.connection.restartIce()
        }
        this.connection.onconnectionstatechange = () => {
            log('onconnectionstatechange: ' + this.connection.connectionState)
        }
        this.connection.onsignalingstatechange = () => {
            log('onsignalingstatechange: ' + this.connection.signalingState)
        }
        this.connection.onnegotiationneeded = () => {
            log('onnegotiationneeded')
            this.sendOffer()
        }
        this.connection.onicecandidateerror = (e) => {
            logError(e.errorCode + ': ' + e.errorText)
        }
        this.connection.ontrack = (ev) => {
            this.onTrack(ev.track)
        }
        this.connection.onicecandidate = (ev) => {
            log('New ICE candidate')
            sendIceCandidate(ev.candidate)
        }
    }

    public connect(): Promise<void> {
        log('connect()')
        if (!this.videoSender) {
            this.videoSender = this.connection.addTransceiver('video').sender
        }
        if (!this.audioSender) {
            this.audioSender = this.connection.addTransceiver('audio').sender
        }
        // Connect by sending offer
        return this.sendOffer()
    }

    private async sendOffer(): Promise<void> {
        log('sendOffer()')
        this.makingOffer = true
        await this.connection.setLocalDescription()
        this.sendDescription(this.connection.localDescription)
    }

    public async addDescription(description: RTCSessionDescriptionInit): Promise<void> {
        log('addDescription')

        if (description.type == 'offer') {
            if (!this.makingOffer || this.polite) {
                if (!this.makingOffer) {
                    log('Accepting offer, since Im not making any offer right now')
                } else {
                    log('Just beeing polite')
                }
                log('Signaling state is ' + this.connection.signalingState)
                // Accept offer
                await this.connection.setRemoteDescription(description)
                await this.connection.setLocalDescription()
                // And send answer
                log('Sending answer')
                this.sendDescription(this.connection.localDescription)
                this.makingOffer = false
            } else {
                log('Ignoring offer')
            }
        } else if (this.makingOffer) {
            // Accept answer
            log('Accepting answer')
            await this.connection.setRemoteDescription(description)
            this.makingOffer = false
        }
    }

    public addIceCandidate(iceCandidate: RTCIceCandidate): Promise<void> {
        log('addIceCandidate')
        return this.connection.addIceCandidate(iceCandidate).catch((err) => {
            if (!this.makingOffer) {
                logError(err)
            } else {
                logError('Ignoring error, since Im making an offer right now')
            }
        })
    }

    public async setVideoTrack(track?: MediaStreamTrack): Promise<void> {
        log('setVideoTrack')
        if (this.videoSender) {
            if (track) {
                if (!this.videoSender.track || track.id !== this.videoSender.track.id) {
                    await this.videoSender.replaceTrack(track)
                }
            } else {
                this.connection.removeTrack(this.videoSender)
            }
        } else {
            this.videoSender = this.connection.addTrack(track)
        }
    }

    public async setAudioTrack(track?: MediaStreamTrack): Promise<void> {
        log('setAudioTrack')
        if (this.audioSender) {
            if (track) {
                if (!this.audioSender.track || track.id !== this.audioSender.track.id) {
                    await this.audioSender.replaceTrack(track)
                }
            } else {
                this.connection.removeTrack(this.audioSender)
            }
        } else {
            this.audioSender = this.connection.addTrack(track)
        }
        if (track && track.muted) {
            logError('Track is muted')
        }
    }
}

export default WebRTCConnection
