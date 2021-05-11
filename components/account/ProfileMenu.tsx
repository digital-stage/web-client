import React, { useState } from 'react'
import Link from 'next/link'
import { FaCog, FaUserAlt, FaUser } from 'react-icons/fa'
import { useIntl } from 'react-intl'
import { useAuth, User, useStageSelector } from '@digitalstage/api-client-react'
import OverlayMenu from '../../ui/surface/OverlayMenu'
import PrimaryButton from '../../ui/button/PrimaryButton'

const ProfileMenu = (): JSX.Element => {
    const { user: authUser, logout } = useAuth()
    const user = useStageSelector<User>((state) => state.globals.localUser)
    const [open, setOpen] = useState<boolean>(false)
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

    if (authUser) {
        return (
            <>
                <OverlayMenu
                    className="menu"
                    icon={<FaUser />}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                >
                    {user && <h5>{user.name || user._id}</h5>}
                    {authUser && <p className="micro">{authUser.email}</p>}

                    <hr />

                    <Link href="/stages">
                        <a title={f('editProfile')} onClick={() => setOpen(false)}>
                            <FaUserAlt name="edit" />
                            <h6>{f('stages')}</h6>
                        </a>
                    </Link>
                    <Link href="/settings/profile">
                        <a title={f('editProfile')} onClick={() => setOpen(false)}>
                            <FaUserAlt name="edit" />
                            <h6>{f('editProfile')}</h6>
                        </a>
                    </Link>
                    <Link href="/settings/device">
                        <a title={f('editDevice')} onClick={() => setOpen(false)}>
                            <FaCog name="settings" />
                            <h6>{f('editDevice')}</h6>
                        </a>
                    </Link>

                    <hr />

                    <PrimaryButton title={f('signOut')} onClick={logout}>
                        {f('signOut')}
                    </PrimaryButton>
                </OverlayMenu>
                <style jsx>{`
              .menu {
                  position: 'fixed',
                  top: '1rem',
                  right: '1rem',
              }`}</style>
            </>
        )
    }
    return null
}
export default ProfileMenu
