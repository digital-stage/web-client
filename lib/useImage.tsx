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

/* eslint-disable no-param-reassign */
import React from 'react'
import { useErrorReporting } from '../client'

export const useSvgImage = (
    url: string,
    width: number,
    height: number,
    color?: string,
    crossOrigin?: string | null
): HTMLImageElement | undefined => {
    const [image, setImage] = React.useState<HTMLImageElement>()
    const [localUrl, setLocalUrl] = React.useState<string>()
    const reportError = useErrorReporting()

   React.useEffect(() => {
        fetch(url)
            .then((res) => res.text())
            .then((svg) => {
                if (color) {
                    svg = svg.replaceAll('currentColor', color)
                }
                const blob = new Blob([svg], { type: 'image/svg+xml' })
                setLocalUrl(URL.createObjectURL(blob))
            })
    }, [url, color])

   React.useEffect(() => {
        if (localUrl && reportError) {
            const img: HTMLImageElement = document.createElement<'img'>('img')

            const onLoad = () => {
                setImage(img)
            }
            const onError = (ev: ErrorEvent) => {
                reportError(ev)
            }

            img.addEventListener('load', onLoad)
            img.addEventListener('error', onError)

            if (crossOrigin) {
                img.crossOrigin = crossOrigin
            }
            img.src = localUrl

            return () => {
                URL.revokeObjectURL(localUrl)
                img.removeEventListener('load', onLoad)
                img.removeEventListener('error', onError)
            }
        }
    }, [localUrl, crossOrigin, width, height, reportError])

   React.useEffect(() => {
        setImage((prev) => {
            if (prev) prev.width = width
            return prev
        })
    }, [width])

   React.useEffect(() => {
        setImage((prev) => {
            if (prev) prev.height = height
            return prev
        })
    }, [height])

    return image
}

const useImage = (
    url: string,
    width: number,
    height: number,
    color?: string,
    crossOrigin?: string | null
): HTMLImageElement | undefined => {
    const [image, setImage] = React.useState<HTMLImageElement>()
    const reportError = useErrorReporting()

   React.useEffect(() => {
        const img: HTMLImageElement = document.createElement<'img'>('img')

        if (color) {
            img.style.color = '#fff'
            img.style.stroke = '#fff'
            img.style.fill = 'yellow'
            img.style.filter = 'invert(1)'
        }
        const onLoad = () => {
            if (color) {
                img.style.color = '#fff'
                img.style.stroke = '#fff'
                img.style.fill = 'yellow'
                img.style.filter = 'invert(1)'
            }
            setImage(img)
        }
        const onError = (ev: ErrorEvent) => {
            reportError(ev)
        }

        img.addEventListener('load', onLoad)
        img.addEventListener('error', onError)

        if (crossOrigin) {
            img.crossOrigin = crossOrigin
        }
        img.src = url

        return () => {
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onError)
        }
    }, [url, crossOrigin, width, height, color, reportError])

   React.useEffect(() => {
        setImage((prev) => {
            if (prev) prev.width = width
            return prev
        })
    }, [width])

   React.useEffect(() => {
        setImage((prev) => {
            if (prev) prev.height = height
            return prev
        })
    }, [height])

    return image
}
export { useImage }
