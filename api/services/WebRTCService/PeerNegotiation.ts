import {logger} from "api/logger"

const RETRY_LIMIT = 10

const {trace, reportError} = logger('WebRTCService:PeerNegotiation')

class PeerNegotiation {
    private readonly remoteId: string
    private readonly configuration?: RTCConfiguration
    private readonly onTrack: (track: MediaStreamTrack, stats?: RTCStatsReport) => void
    private readonly onDescription: (description: RTCSessionDescriptionInit) => void
    private readonly onCandidate: (iceCandidate: RTCIceCandidate) => void
    private readonly onRestart: () => void
    private readonly polite: boolean
    private makingOffer: boolean = false
    private isSettingRemoteAnswerPending: boolean = false
    private retryCount: number = 0
    private peerConnection: RTCPeerConnection
    private candidates: RTCIceCandidate[] = []
    private videoSender?: RTCRtpSender
    private audioSender?: RTCRtpSender

    private _onnegotiationneeded: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap["negotiationneeded"]) => any
    private _onicecandidate: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap["icecandidate"]) => any
    private _onconnectionstatechange: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap["connectionstatechange"]) => any
    private _ontrack: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap["track"]) => any

    constructor({
                    remoteId,
                    configuration,
                    onTrack,
                    onDescription,
                    onCandidate,
                    onRestart,
                    polite,
                }: {
        remoteId: string
        configuration?: RTCConfiguration,
        onTrack: (track: MediaStreamTrack, stats?: RTCStatsReport) => void,
        onDescription: (description: RTCSessionDescriptionInit) => void,
        onCandidate: (iceCandidate: RTCIceCandidate) => void,
        onRestart: () => void,
        polite: boolean,
    }) {
        this.remoteId = remoteId
        this.configuration = configuration
        this.onDescription = onDescription
        this.onCandidate = onCandidate
        this.onRestart = onRestart
        this.onTrack = onTrack
        this.polite = polite

        this.start()
    }

    public setVideoTrack(track?: MediaStreamTrack) {
        trace(`${this.remoteId} setVideoTrack(${track?.id})`)
        if(this.videoSender) {
            this.peerConnection.removeTrack(this.videoSender)
        }
        if (track) {
            this.videoSender = this.peerConnection.addTrack(track)
        }
    }

    public setAudioTrack(track: MediaStreamTrack) {
        trace(`${this.remoteId} setAudioTrack(${track?.id})`)
        if(this.audioSender) {
            this.peerConnection.removeTrack(this.audioSender)
        }
        if (track) {
            this.audioSender = this.peerConnection.addTrack(track)
        }
    }

    public async getStats(track: MediaStreamTrack): Promise<RTCStatsReport> {
        return await this.peerConnection.getStats(track)
    }

    public async setDescription(description: RTCSessionDescriptionInit) {
        trace(`${this.remoteId} setDescription(${description.type})`)
        try {
            if (this.ignore(description)) {
                trace(this.remoteId + " Ignoring incoming description")
                return
            }

            trace(this.remoteId + " Set remote description")
            await this.setRemoteDescription(description)

            if (description.type === 'offer') {
                trace(this.remoteId + " Set local descriptions, since this is an offer")
                await this.setLocalDescription(await this.peerConnection.createAnswer())
            }
        } catch (error) {
            if (this.retryCount <= RETRY_LIMIT) {
                this.initiateManualRollback()
                this.retryCount++
            } else {
                reportError(`Negotiation failed after ${this.retryCount} retries`)
            }
        }
    }

    public addCandidate(candidate: RTCIceCandidate) {
        trace(`${this.remoteId} addCandidate()`)
        this.candidates.push(candidate)
        this.addCandidates()
    }

    public async createOffer() {
        trace(this.remoteId + " createOffer()")
        if (!this.readyToMakeOffer) return

        try {
            this.makingOffer = true
            await this.setLocalDescription(await this.peerConnection.createOffer())
        } catch (error) {
            reportError(error)
        } finally {
            this.makingOffer = false
        }
    }

    private async setLocalDescription(description: RTCSessionDescriptionInit) {
        await this.peerConnection.setLocalDescription(description)
        this.onDescription(this.peerConnection.localDescription)
    }

    private async setRemoteDescription(description: RTCSessionDescriptionInit) {
        this.isSettingRemoteAnswerPending = description.type === 'answer'
        await this.peerConnection.setRemoteDescription(description) // SRD rolls back as needed
        this.addCandidates()
        this.isSettingRemoteAnswerPending = false
    }

    private addCandidates() {
        if (this.peerConnection.remoteDescription) {
            while (this.candidates.length) {
                this.peerConnection.addIceCandidate(this.candidates.shift())
                    .catch(err => reportError(err))
                this.addCandidates()
            }
        }
    }

    private get readyToMakeOffer() {
        return !this.makingOffer && this.peerConnection.signalingState === 'stable'
    }

    private get readyToReceiveOffer() {
        return (
            !this.makingOffer &&
            (
                this.peerConnection.signalingState === 'stable' ||
                this.isSettingRemoteAnswerPending
            )
        )
    }

    private collides(description: RTCSessionDescriptionInit) {
        return description.type === 'offer' && !this.readyToReceiveOffer
    }

    private ignore(description: RTCSessionDescriptionInit) {
        return !this.polite && this.collides(description)
    }

    private initiateManualRollback() {
        trace(this.remoteId + " initiateManualRollback()")
        this.restart()

        this.onRestart()
    }

    public restart() {
        trace(this.remoteId + " restart()")
        this.stop()
        this.start()
    }

    private start() {
        trace(this.remoteId + " start()")
        this.setupPeerConnection()
    }

    public stop() {
        trace(this.remoteId + " stop()")
        this.makingOffer = false
        this.isSettingRemoteAnswerPending = false
        this.candidates = []
        if(this.peerConnection) {
            if(this.videoSender) {
                this.peerConnection.removeTrack(this.videoSender)
                this.videoSender = undefined
            }
            if(this.audioSender) {
                this.peerConnection.removeTrack(this.audioSender)
                this.audioSender = undefined
            }
        }
        this.teardownPeerConnection()
    }

    private setupPeerConnection() {
        trace(this.remoteId + " setupPeerConnection()")

        this.peerConnection = new RTCPeerConnection(this.configuration)

        this._onnegotiationneeded = () => {
            trace(this.remoteId + " _onnegotiationneeded()")
            this.createOffer()
        }

        this._onicecandidate = ({candidate}) => this.onCandidate(candidate)

        this._onconnectionstatechange = (event) => {
            trace(this.remoteId + " _onconnectionstatechange(" + this.peerConnection.connectionState + ")")
            if (this.peerConnection.connectionState === 'connected') {
                this.retryCount = 0
            }
        }

        this._ontrack = (event) => {
            trace(this.remoteId + " _ontrack(" + event.track.id + ")")
            this.peerConnection.getStats(event.track)
                .then(stats => this.onTrack(event.track, stats))
                .catch(error => {
                    reportError(error)
                    this.onTrack(event.track)
                })
        }

        this.peerConnection.addEventListener('negotiationneeded', this._onnegotiationneeded)
        this.peerConnection.addEventListener('icecandidate', this._onicecandidate)
        this.peerConnection.addEventListener('connectionstatechange', this._onconnectionstatechange)
        this.peerConnection.addEventListener('track', this._ontrack)
    }

    private teardownPeerConnection() {
        this.peerConnection.close()
        this.peerConnection.removeEventListener('negotiationneeded', this._onnegotiationneeded)
        this.peerConnection.removeEventListener('icecandidate', this._onicecandidate)
        this.peerConnection.removeEventListener('connectionstatechange', this._onconnectionstatechange)
        this.peerConnection.removeEventListener('track', this._ontrack)
        this.peerConnection = null
    }
}

export {PeerNegotiation}