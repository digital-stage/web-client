import { useAuth } from '@digitalstage/api-client-react'
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import DefaultPanel from 'ui/panels/DefaultPanel'
import DevicesList from '../components/devices/DevicesList'
import DefaultContainer from '../ui/container/DefaultContainer'

const Devices = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    return (
        <DefaultContainer>
            <DefaultPanel>
                <DevicesList />
            </DefaultPanel>
        </DefaultContainer>
    )
}
export default Devices
