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

import {
    Broker,
    DescriptionListener,
    IceCandidateListener,
} from '../../api/services/WebRTCService/Broker'

describe('Broker', () => {
    it('adding and removing', () => {
        const broker = new Broker()
        const id = '1234'
        const descriptionListener: DescriptionListener = (description) => {
            console.log('Hey')
        }
        const anotherDescriptionListener: DescriptionListener = (description) => {
            console.log('Hey')
        }
        const iceCandidateListener: IceCandidateListener = (candidate) => {
            console.log('Hey')
        }
        broker.addDescriptionListener(id, descriptionListener)
        expect(broker.descriptionListeners()).toHaveProperty(id)
        expect(broker.descriptionListeners()).toMatchObject({ [id]: [descriptionListener] })
        expect(broker.descriptionListeners()[id]).toContain(descriptionListener)

        broker.addDescriptionListener(id, anotherDescriptionListener)
        expect(broker.descriptionListeners()[id]).toContain(descriptionListener)
        expect(broker.descriptionListeners()[id]).toContain(anotherDescriptionListener)

        broker.addIceCandidateListener(id, iceCandidateListener)
        expect(broker.iceCandidateListeners()).toHaveProperty(id)
        expect(broker.iceCandidateListeners()).toMatchObject({ [id]: [iceCandidateListener] })
        expect(broker.iceCandidateListeners()[id]).toContain(iceCandidateListener)

        broker.removeDescriptionListener(id, descriptionListener)
        expect(broker.descriptionListeners()[id]).not.toContain(descriptionListener)
        expect(broker.descriptionListeners()[id]).toContain(anotherDescriptionListener)

        broker.removeDescriptionListener(id, anotherDescriptionListener)
        expect(broker.descriptionListeners()[id]).not.toContain(anotherDescriptionListener)

        broker.removeIceCandidateListener(id, iceCandidateListener)
        expect(broker.iceCandidateListeners()[id]).not.toContain(iceCandidateListener)
    })
})
