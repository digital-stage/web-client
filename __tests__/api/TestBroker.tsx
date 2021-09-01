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
