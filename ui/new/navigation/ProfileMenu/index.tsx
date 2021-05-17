/* eslint-disable jsx-a11y/anchor-is-valid */
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import React, { useEffect, useRef, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import styles from './ProfileMenu.module.css'
import SecondaryButton from "../../../button/SecondaryButton";

const ProfileMenu = (
  props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon: React.ReactNode,
  }
) => {
  const { onClick, className, children, ...other } = props
  const [open, setOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>()
  const { push } = useRouter()
  const { user: authUser } = useAuth()
  const user = useStageSelector((state) => state.globals.localUser)

  useEffect(() => {
    if (ref.current) {
      const target = ref.current
      if (open) {
        disableBodyScroll(target)
        return () => {
          enableBodyScroll(target)
        }
      }
    }
    return undefined
  }, [ref, open])

  if (user && authUser) {
    return (
      <div className={styles.wrapper}>
        <SecondaryButton
          round
          toggled={!open}
          className={`${styles.button} ${className}`}
          onClick={(e) => {
            setOpen((prev) => !prev)
            if (onClick) onClick(e)
          }}
          {...other}
        >
          <FaUser />
        </SecondaryButton>
        {open && (
          <>
            <div className={styles.backdrop} onClick={() => setOpen(false)} />
            <div className={styles.menuPanel} ref={ref}>
              {children}
            </div>
          </>
        )}
      </div>
    )
  }

  return null
}
export default ProfileMenu
