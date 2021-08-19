import { ServerDevicePayloads } from '@digitalstage/api-types'

class MediasoupConnection {
    public onVideoAdded: (videoTrackId: string, track: MediaStreamTrack) => void
    public onVideoRemoved: (videoTrackId: string) => void
    public onConnected: () => void
    public onDisconnected: () => void

    constructor(url: string) {}

    public connect() {}

    public disconnect() {}
}

export default MediasoupConnection
