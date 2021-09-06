import { useState } from 'react'

function useForceUpdate() {
    const [, setValue] = useState(0) // integer state
    return () => setValue((v) => v + 1) // update the state to force render
}

export { useForceUpdate }
