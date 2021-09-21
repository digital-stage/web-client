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
