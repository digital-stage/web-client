import Link from 'next/link'
import React from 'react'
import styles from './NavigationBar.module.css'
import {useRouter} from "next/router";
import {UrlObject} from "url";
import {GoBroadcast, GoListUnordered} from 'react-icons/go';
import {FaBug, FaTools} from 'react-icons/fa';
import {useStageSelector} from "@digitalstage/api-client-react";
import {BiChat, BiCube} from 'react-icons/bi';

const SideBarItem = (props: {
  href: string | UrlObject;
  target?: string;
  children: React.ReactNode
}): JSX.Element => {
  const {target, href, children} = props;
  const {pathname} = useRouter();
  return (
    <>
      <Link href={href} passHref>
        <a target={target}>
          {children}
        </a>
      </Link>
      <style jsx>{`
      a {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 8px;
        padding-bottom: 8px;
        outline: none;
        cursor: pointer;
        transition-property: text-shadow, background;
        transition-duration: 200ms;
        transition-timing-function: cubic-bezier(0.2, 0.8, 0.4, 1);
        background-color: ${!target && href === pathname ? 'transparent' : 'var(---level-1, #121212)'};
        width: 100%;  
      }
      a:hover {
          text-shadow: 0 0 10px #fff;
      }
    `}</style>
    </>
  )
}

const NavigationBar = () => {
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)
  return (
    <div className={styles.wrapper}>
      <div className={styles.start}>
        <div className={styles.logo}>
          <img alt={"Digital stage"} src={"/static/logo.svg"}/>
        </div>
      </div>
      <div className={styles.spacer}/>
      <div className={styles.center}>
        {insideStage && (
          <>
            <SideBarItem href="/stage">
              <GoBroadcast name="Stage"/>
              Stage
            </SideBarItem>
            <SideBarItem href="/mixer">
              <BiCube name="Mixer"/>
              Mixer
            </SideBarItem>
            <SideBarItem href="/room">
              <BiCube name="Room"/>
              3D Audio
            </SideBarItem>
          </>
        )}
        <SideBarItem href="/devices">
          <FaTools size={18} name="Devices"/>
          Devices
        </SideBarItem>
        <SideBarItem href="/chat">
          <BiChat name="Chat"/>
          Chat
        </SideBarItem>
        <div className={styles.itemSpacer}/>
        <SideBarItem href="/stages">
          <GoListUnordered size={18} name="Stages"/>
          Stages
        </SideBarItem>
      </div>
      <div className={styles.spacer}/>
      <div className={styles.end}>
        <SideBarItem href="/debug">
          <FaBug name="Feedback"/>
          DEBUG
        </SideBarItem>
        <SideBarItem href="https://forum.digital-stage.org/c/deutsch/ds-web/30" target="_blank">
          <FaBug name="Feedback"/>
          Feedback
        </SideBarItem>
      </div>
    </div>
  )
}
export default NavigationBar
