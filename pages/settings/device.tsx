import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import useSelectedDevice from '../../lib/useSelectedDevice'
import DeviceView from '../../components/settings/DeviceView'
import DefaultContainer from '../../ui/container/DefaultContainer'
import DefaultPanel from '../../ui/panels/DefaultPanel'

const DeviceSettings = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    const { selectedDeviceId } = useSelectedDevice()
    return (
        <DefaultContainer>
            <DefaultPanel>
                {selectedDeviceId ? (
                    <DeviceView id={selectedDeviceId} />
                ) : (
                    <p>Bitte wähle ein Gerät aus</p>
                )}
            </DefaultPanel>
        </DefaultContainer>
    )
}
export default DeviceSettings
