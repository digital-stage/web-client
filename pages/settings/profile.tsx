import React from 'react'
import {SettingsLayout} from '../../components/settings/SettingsLayout'
import {ProfileEditor} from '../../components/account/ProfileEditor'

const ProfileSettingsPage = () => {
    return (
        <SettingsLayout>
            <ProfileEditor />
        </SettingsLayout>
    )
}
export default ProfileSettingsPage
