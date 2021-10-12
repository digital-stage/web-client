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

import {ServerDevicePayloads} from '@digitalstage/api-types'

type DescriptionListener = (description: RTCSessionDescriptionInit) => void
type IceCandidateListener = (iceCandidate: RTCIceCandidate) => void
type RestartListener = () => void

class Broker {
    private restartListenersList: {
        [id: string]: RestartListener[]
    } = {}

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

    public handleRestart = ({from}: ServerDevicePayloads.P2PRestart) => {
        if (this.restartListenersList[from]) {
            this.restartListenersList[from].forEach((callback) => callback())
        }
    }

    public handleOffer = ({from, offer}: ServerDevicePayloads.P2POfferSent) => {
        if (this.descriptionListenersList[from]) {
            this.descriptionListenersList[from].forEach((callback) => callback(offer))
        }
    }

    public handleAnswer = ({from, answer}: ServerDevicePayloads.P2PAnswerSent) => {
        if (this.descriptionListenersList[from]) {
            this.descriptionListenersList[from].forEach((callback) => callback(answer))
        }
    }

    public handleIceCandidate = ({from, iceCandidate}: ServerDevicePayloads.IceCandidateSent) => {
        if (this.iceCandidateListenerList[from]) {
            this.iceCandidateListenerList[from].forEach((callback) => callback(iceCandidate))
        }
    }

    public addRestartListener = (id: string, listener: RestartListener) => {
        if (this.restartListenersList[id]) {
            this.restartListenersList[id].push(listener)
        } else {
            this.restartListenersList[id] = [listener]
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

    public removeRestartListener = (id: string, listener: RestartListener) => {
        if (this.restartListenersList[id]) {
            this.restartListenersList[id] = this.restartListenersList[id].filter(
                (prev) => !Object.is(prev, listener)
            )
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

export type {DescriptionListener, IceCandidateListener}
export {Broker}
