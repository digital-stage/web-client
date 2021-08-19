import React, { createContext, useMemo, useState } from 'react'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { Producer } from 'mediasoup-client/lib/Producer'

type ConsumerList = {
    [videoTrackId: string]: Consumer
}
type ProducerList = {
    [videoTrackId: string]: Producer
}

interface MediasoupContextT {
    videoConsumers: ConsumerList
    audioConsumers: ConsumerList
    videoProducers: ProducerList
    audioProducers: ProducerList
}

const MediasoupContext = createContext<MediasoupContextT>({
    videoConsumers: {},
    audioConsumers: {},
    videoProducers: {},
    audioProducers: {},
})

const MediasoupProvider = ({ children }: { children: React.ReactNode }) => {
    const [videoConsumers, setVideoConsumers] = useState<ConsumerList>()
    const [audioConsumers, setAudioConsumers] = useState<ConsumerList>()
    const [videoProducers, setVideoProducers] = useState<ProducerList>()
    const [audioProducers, setAudioProducers] = useState<ProducerList>()

    const value = useMemo(() => {
        return {
            videoConsumers,
            audioConsumers,
            videoProducers,
            audioProducers,
        }
    }, [audioConsumers, audioProducers, videoConsumers, videoProducers])
    return <MediasoupContext.Provider value={value}>{children}</MediasoupContext.Provider>
}
export default MediasoupProvider
