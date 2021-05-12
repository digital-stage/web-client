import styles from "./MobileMenu.module.css"
import React, {MouseEventHandler, useState} from "react";
import {BsThreeDotsVertical} from "react-icons/bs";
import PrimaryButton from "../../ui/button/PrimaryButton";
import TertiaryButton from "../../ui/button/TertiaryButton";
import {GoBroadcast, GoListUnordered, GoSettings} from "react-icons/go";
import Link from "next/link";
import {useStageSelector} from "@digitalstage/api-client-react";
import {BiChat, BiCube} from "react-icons/bi";
import {useRouter} from "next/router";
import {FaTools} from "react-icons/fa";

const MobileItem = (props: {
  href: string;
  children: React.ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  open: boolean;
}) => {
  const {href, children, onClick, open} = props;
  const {pathname} = useRouter()

  return (
    <Link href={href} passHref>
      {pathname === href ? (
        <PrimaryButton
          onClick={onClick}
          round
          className={`${styles.menuItem} 
        ${open ? styles.active : styles.inactive}`}>
          {children}
        </PrimaryButton>
      ) : (
        <TertiaryButton
          onClick={onClick}
          round
          className={`${styles.menuItem} 
        ${open ? styles.active : styles.inactive}`}>
          {children}
        </TertiaryButton>
      )}
    </Link>
  )
}

const MobileMenu = () => {
  const [open, setOpen] = useState<boolean>(false)
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)

  return (
    <div className={styles.wrapper}>
      {insideStage && (
        <>
          <MobileItem href="/stage" open={open} onClick={() => setOpen(false)}>
            <GoBroadcast size={24} name="Stage"/>
          </MobileItem>
          <MobileItem href="/mixer" open={open} onClick={() => setOpen(false)}>
            <GoSettings size={24} name="Mixer"/>
          </MobileItem>
          <MobileItem href="/room" open={open} onClick={() => setOpen(false)}>
            <BiCube size={24} name="3D Audio"/>
          </MobileItem>
        </>
      )}

      <MobileItem href="/devices" open={open} onClick={() => setOpen(false)}>
        <FaTools size={24} name="Devices"/>
      </MobileItem>
      <MobileItem href="/chat" open={open} onClick={() => setOpen(false)}>
        <BiChat size={24} name="Chat"/>
      </MobileItem>
      <MobileItem href="/stages" open={open} onClick={() => setOpen(false)}>
        <GoListUnordered size={24} name="Stages"/>
      </MobileItem>

      <PrimaryButton
        round={true}
        toggled={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <BsThreeDotsVertical size={24}/>
      </PrimaryButton>
    </div>
  )
}
export default MobileMenu