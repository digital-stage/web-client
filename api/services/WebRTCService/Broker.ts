import { ServerDevicePayloads } from '@digitalstage/api-types'

type DescriptionListener = (description: RTCSessionDescriptionInit) => void
type IceCandidateListener = (iceCandidate: RTCIceCandidate) => void

class Broker {
    private descriptionListenersList: {
        [id: string]: DescriptionListener[]
    } = {}
    private iceCandidateListenerList: {
        [id: string]: IceCandidateListener[]
    } = {}

    public descriptionListeners(): {
        [id: string]: DescriptionListener[]
    } {
        return this.descriptionListenersList
    }

    public iceCandidateListeners(): {
        [id: string]: IceCandidateListener[]
    } {
        return this.iceCandidateListenerList
    }

    public handleOffer = ({ from, offer }: ServerDevicePayloads.P2POfferSent) => {
        if (this.descriptionListenersList[from]) {
            this.descriptionListenersList[from].forEach((callback) => callback(offer))
        }
    }

    public handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
        if (this.descriptionListenersList[from]) {
            this.descriptionListenersList[from].forEach((callback) => callback(answer))
        }
    }

    public handleIceCandidate = ({ from, iceCandidate }: ServerDevicePayloads.IceCandidateSent) => {
        if (this.iceCandidateListenerList[from]) {
            this.iceCandidateListenerList[from].forEach((callback) => callback(iceCandidate))
        }
    }

    public addDescriptionListener = (id: string, listener: DescriptionListener) => {
        if (this.descriptionListenersList[id]) {
            this.descriptionListenersList[id].push(listener)
        } else {
            this.descriptionListenersList[id] = [listener]
        }
    }

    public addIceCandidateListener = (id: string, listener: IceCandidateListener) => {
        if (this.iceCandidateListenerList[id]) {
            this.iceCandidateListenerList[id].push(listener)
        } else {
            this.iceCandidateListenerList[id] = [listener]
        }
    }

    public removeDescriptionListener = (id: string, listener: DescriptionListener) => {
        if (this.descriptionListenersList[id]) {
            this.descriptionListenersList[id] = this.descriptionListenersList[id].filter(
                (prev) => !Object.is(prev, listener)
            )
        }
    }

    public removeIceCandidateListener = (id: string, listener: IceCandidateListener) => {
        if (this.iceCandidateListenerList[id]) {
            this.iceCandidateListenerList[id] = this.iceCandidateListenerList[id].filter(
                (prev) => !Object.is(prev, listener)
            )
        }
    }
}
export type { DescriptionListener, IceCandidateListener }
export { Broker }
