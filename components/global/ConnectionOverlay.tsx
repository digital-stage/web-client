import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { LoadingShaft } from 'ui/LoadingShaft'
import {Loading} from "./Loading";

const ConnectionOverlay = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const connected = useStageSelector((state) => state.globals.ready)

    if (signedIn && !connected) {
        return <Loading message="Verbinde ..." />
    }
    return <>{children}</>
}
export { ConnectionOverlay }
