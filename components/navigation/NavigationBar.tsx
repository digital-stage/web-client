import * as  React from 'react'
import {GoBroadcast, GoListUnordered, GoSettings} from 'react-icons/go';
import {FaBug, FaTools} from 'react-icons/fa';
import {useStageSelector} from "@digitalstage/api-client-react";
import {BiChat, BiCube} from 'react-icons/bi';
import Image from 'next/image'
import SideBar from "../../ui/new/navigation/SideBar";
import SideBarItem from "../../ui/new/navigation/SideBar/SideBarItem";
import SideBarItemSpacer from "../../ui/new/navigation/SideBar/SideBarItemSpacer";

const NavigationBar = () => {
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)
  return (
    <SideBar
      top={<Image width={40} height={40} alt={"Digital stage"} src={"/static/logo.svg"}/>}
      center={<>
        {insideStage && (
          <>
            <SideBarItem href="/stage">
              <GoBroadcast name="Stage"/>
              Stage
            </SideBarItem>
            <SideBarItem href="/mixer">
              <GoSettings name="Mixer"/>
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
        <SideBarItemSpacer/>
        <SideBarItem href="/stages">
          <GoListUnordered size={18} name="Stages"/>
          Stages
        </SideBarItem>
      </>}
      bottom={<>
        <SideBarItem href="/debug">
          <FaBug name="Feedback"/>
          DEBUG
        </SideBarItem>
        <SideBarItem href="https://forum.digital-stage.org/c/deutsch/ds-web/30" target="_blank">
          <FaBug name="Feedback"/>
          Feedback
        </SideBarItem>
      </>}
    />
  )
}
export default NavigationBar
