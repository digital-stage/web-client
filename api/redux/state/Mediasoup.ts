import { Consumer } from 'mediasoup-client/lib/Consumer'
import { Producer } from 'mediasoup-client/lib/Producer'

interface Mediasoup {
    connected: boolean
    videoConsumers: {
        byId: {
            [videoTrackId: string]: Consumer
        }
        allIds: string[]
    }
    audioConsumers: {
        byId: {
            [audioTrackId: string]: Consumer
        }
        allIds: string[]
    }
    videoProducers: {
        byId: {
            [localVideoTrackId: string]: Producer
        }
        allIds: string[]
    }
    audioProducers: {
        byId: {
            [localAudioTrackId: string]: Producer
        }
        allIds: string[]
    }
}

export default Mediasoup
