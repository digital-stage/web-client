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
    const randomSentence = RandomSentence[Math.floor(Math.random() * RandomSentence.length)]

    return (
        <div className="topoverlay">
            <LoadingShaft/>
            <h2>
                {message || randomSentence}
            </h2>
        </div>
    )
}
export {Loading}
