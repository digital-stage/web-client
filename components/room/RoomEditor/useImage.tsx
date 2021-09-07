/* eslint-disable no-param-reassign */
import { useEffect, useState } from 'react'
import { useErrorReporting } from '@digitalstage/api-client-react'

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
                let blob = new Blob([svg], { type: 'image/svg+xml' })
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
