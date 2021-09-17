import {LoadingShaft} from "../../ui/LoadingShaft";
import React from "react";

const RandomSentence = [
    "Stimme die Instrumente...",
    "Lade die Buchstabensuppe ...",
    "Muss erst aufstehen ...",
    "Moment, sofort!",
    "Mensch ärgere Dich nicht ...",
    "Packe nur schnell meine Sachen ...",
    "Alle gehn nochmal aufs Klo ...",
]

const Loading = ({message}: {
    message?: string
}) => {
    const [sentence, setSentence] = React.useState<string>(message)
    React.useEffect(() => {
        if(!message) {
            setSentence(RandomSentence[Math.floor(Math.random() * RandomSentence.length)])
        }
    }, [message])

    return (
        <div className="topoverlay">
            <LoadingShaft/>
            <h2>
                {sentence || null}
            </h2>
        </div>
    )
}
export {Loading}
