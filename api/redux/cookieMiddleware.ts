import { Middleware } from 'redux'
import Cookie from 'js-cookie'
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'

const cookieMiddleware: Middleware<
    {}, // Most middleware do not modify the dispatch return value
    any
> = (storeApi) => (next) => (action) => {
    const state = storeApi.getState() // correctly typed as RootState
    switch (action.type) {
        case ServerDeviceEvents.LocalDeviceReady: {
            const payload = action.payload as ServerDevicePayloads.LocalDeviceReady
            if (state.auth.user) {
                // Will be read by getInitialDevice() in next session
                Cookie.set(state.auth.user._id, payload.uuid, { expires: 365 })
            }
            break
        }
    }
    return next(action)
}
export default cookieMiddleware
