import React from 'react'

const useAnimationFrame = (callback: (deltaTime: number) => any, timeout?: number) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = React.useRef<number>()
    const previousTimeRef = React.useRef<number>()
    const counter = React.useRef<number>(0)

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current
            if (timeout) {
                if (counter.current++ % timeout === 0) {
                    callback(deltaTime)
                }
            } else {
                callback(deltaTime)
            }
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Make sure the effect runs only once
}
export { useAnimationFrame }
