/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {FaUser} from 'react-icons/fa'
import {useRouter} from 'next/router'
import {useAuth, useStageSelector} from '@digitalstage/api-client-react'
import Link from 'next/link'
import DangerButton from '../../ui/button/DangerButton'
import ProfileMenuComponent from "../../ui/new/navigation/ProfileMenu"

const ProfileMenu = (
  props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) => {
  const {onClick, className, ...other} = props
  const {push} = useRouter()
  const {user: authUser} = useAuth()
  const user = useStageSelector((state) => state.globals.localUser)

  if (user && authUser) {
    return (
      <ProfileMenuComponent icon={<FaUser/>}>
        {user && (
          <>
              <p className="micro">Angemeldet als</p>
            <h6>{user?.name}</h6>
            <p className="micro">
              <i>{authUser?.email}</i>
            </p>
              <hr/>
              <p className="micro">
                <Link href="/account/profile" passHref>
                  <a>Profil bearbeiten</a>
                </Link>
              </p>
            <DangerButton onClick={() => push('/account/logout')}>
              Logout
            </DangerButton>
          </>
        )}
      </ProfileMenuComponent>
    )
  }

  return null
}
export default ProfileMenu
