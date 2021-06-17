import React from 'react'

const useAnimationFrame = (callback: (deltaTime: number) => any) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = React.useRef<number>()
    const previousTimeRef = React.useRef<number>()

    const animate = (time) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current
            callback(deltaTime)
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(requestRef.current)
    }, []) // Make sure the effect runs only once
}
export default useAnimationFrame
