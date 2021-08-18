/* eslint-disable no-param-reassign */
import { useEffect, useState } from 'react'
import debug from 'debug'

const reportError = debug('useImage').extend('error')

export const useSvgImage = (
    url: string,
    width: number,
    height: number,
    color?: string,
    crossOrigin?: string | null
): HTMLImageElement | undefined => {
    const [image, setImage] = useState<HTMLImageElement>()
    const [localUrl, setLocalUrl] = useState<string>()

    useEffect(() => {
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

    useEffect(() => {
        if (localUrl) {
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
    }, [localUrl, crossOrigin, width, height])

    useEffect(() => {
        setImage((prev) => {
            if (prev) prev.width = width
            return prev
        })
    }, [width])

    useEffect(() => {
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
    const [image, setImage] = useState<HTMLImageElement>()

    useEffect(() => {
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
    }, [url, crossOrigin, width, height, color])

    useEffect(() => {
        setImage((prev) => {
            if (prev) prev.width = width
            return prev
        })
    }, [width])

    useEffect(() => {
        setImage((prev) => {
            if (prev) prev.height = height
            return prev
        })
    }, [height])

    return image
}
export default useImage
