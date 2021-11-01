import {logger} from '../../logger'

const {trace, reportError} = logger('WebRTCService:PeerConnection')

const MAX_ATTEMPTS = 10;

class PeerConnection {
  private readonly connection: RTCPeerConnection;
  private readonly polite: boolean;
  private makingOffer = false;
  private ignoreOffer = false;
  private srdAnswerPending = false;
  private readonly onSessionDescription: (description: RTCSessionDescriptionInit) => Promise<unknown> | unknown;
  private iceAttempts = 0;

  constructor({
                polite,
                configuration,
                onIceCandidate,
                onRemoteStream,
                onRemoteTrack,
                onSessionDescription,
                onConnectionStateChange,
                onIceConnectionStateChange,
                onIceCandidateError,
              }: {
    polite: boolean,
    configuration?: RTCConfiguration,
    onIceCandidate: (candidate: RTCIceCandidate | null) => unknown
    onSessionDescription: (description: RTCSessionDescriptionInit) => Promise<unknown> | unknown,
    onRemoteTrack: (track: MediaStreamTrack, stats?: RTCStatsReport) => Promise<unknown> | unknown,
    onRemoteStream: (audioTrackId: string, buffer: ArrayBuffer) => Promise<unknown> | unknown,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => unknown,
    onIceConnectionStateChange?: (state: RTCIceConnectionState) => unknown,
    onIceCandidateError?: (error: RTCPeerConnectionIceErrorEvent) => unknown
  }) {
    this.polite = polite;
    this.onSessionDescription = onSessionDescription;
    this.connection = new RTCPeerConnection(configuration);
    if (onConnectionStateChange) {
      this.connection.onconnectionstatechange = () => {
        onConnectionStateChange(this.connection.connectionState)
      }
    }
    if (onIceCandidateError) {
      this.connection.onicecandidateerror = (event) => {
        onIceCandidateError(event as RTCPeerConnectionIceErrorEvent)
      }
    }
    this.connection.oniceconnectionstatechange = () => {
      if (this.connection.iceConnectionState === "connected") {
        this.iceAttempts = 0;
      } else if (this.connection.iceConnectionState === "failed") {
        if (this.iceAttempts < MAX_ATTEMPTS) {
          this.connection.restartIce();
          this.iceAttempts += 1;
        }
      }
      if (onIceConnectionStateChange) {
        onIceConnectionStateChange(this.connection.iceConnectionState)
      }
    }
    this.connection.onnegotiationneeded = async () => {
      trace("handleNegotiationNeeded");
      if (this.connection.signalingState != "stable") throw new Error("negotiationneeded fired in unstable state");
      await this.makeOffer()
        .catch(err => reportError(err));
    };
    this.connection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
      onIceCandidate(ev.candidate);
    }
    this.connection.ontrack = async (ev: RTCTrackEvent) => {
      if (onRemoteTrack) {
        const track = ev.track;
        const stats = await this.connection.getStats(track);
        onRemoteTrack(ev.track, stats);
      }
    }
    this.connection.ondatachannel = ({channel}: RTCDataChannelEvent) => {
      trace("NEW CHANNEL " +
        channel.label);
      channel.onmessage = (event: MessageEvent) => {
        onRemoteStream(channel.label, event.data as ArrayBuffer);
      }
    }
  }

  public close(): void {
    this.connection.close();
  }

  public addTrack(track: MediaStreamTrack): void {
    this.connection.addTrack(track);
  }

  public async makeOffer(): Promise<void> {
    trace("makeOffer");
    try {
      if (this.makingOffer) throw new Error("Already making an offer");
      this.makingOffer = true;
      await this.connection.setLocalDescription();
      if (this.connection.signalingState != 'have-local-offer') throw new Error("negotiationneeded not racing with addSessionDescription");
      if (this.connection.localDescription?.type != 'offer') throw new Error("SLD failed");
      await this.onSessionDescription(this.connection.localDescription);
    } finally {
      this.makingOffer = false;
    }
  }

  public async addSessionDescription(description: RTCSessionDescriptionInit): Promise<void> {
    trace("addSessionDescription");
    const isStable =
      this.connection.signalingState == 'stable' ||
      (this.connection.signalingState == 'have-local-offer' && this.srdAnswerPending);
    this.ignoreOffer =
      description.type == 'offer' && !this.polite && (this.makingOffer || !isStable);
    if (this.ignoreOffer) {
      trace('glare detected - ignoring offer');
      return;
    }
    this.srdAnswerPending = description.type == "answer";
    await this.connection.setRemoteDescription(description);
    this.srdAnswerPending = false;
    if (description.type == 'offer') {
      let signalingState = this.connection.signalingState;
      if (signalingState != 'have-remote-offer') throw new Error("Signaling not in sync with SRD");
      if (this.connection.remoteDescription?.type != 'offer') throw new Error("SRD failed");
      await this.connection.setLocalDescription();
      if (this.connection.localDescription?.type != 'answer') throw new Error("SLD failed");
      signalingState = this.connection.signalingState;
      if (signalingState != "stable") throw new Error("Not stable after offer and answer has been set");
      await this.onSessionDescription(this.connection.localDescription)
    } else {
      if (this.connection.remoteDescription?.type != 'answer') throw new Error("SRD failed")
      if (this.connection.signalingState != 'stable') throw new Error('Not stable after answer for own offer has been set')
      trace("Successfully negotiated!");
    }
  }

  public async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    trace("addIceCandidate");
    try {
      await this.connection.addIceCandidate(candidate);
    } catch (e) {
      if (!this.ignoreOffer) {
        throw e;
      }
    }
  }


}

export {PeerConnection}