import React, {useState} from "react";
import {BsThreeDotsVertical} from "react-icons/bs";
import PrimaryButton from "../../ui/button/PrimaryButton";
import {GoBroadcast, GoListUnordered, GoSettings} from "react-icons/go";
import {useStageSelector} from "@digitalstage/api-client-react";
import {BiChat, BiCube} from "react-icons/bi";
import {FaTools} from "react-icons/fa";
import MobileMenuComponent from "../../ui/new/navigation/MobileMenu"
import MobileMenuItem from "../../ui/new/navigation/MobileMenu/MobileMenuItem";

const MobileMenu = () => {
  const [open, setOpen] = useState<boolean>(false)
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)

  return (
    <MobileMenuComponent>
      {insideStage && (
        <>
          <MobileMenuItem href="/stage" open={open} onClick={() => setOpen(false)}>
            <GoBroadcast size={24} name="Stage"/>
          </MobileMenuItem>
          <MobileMenuItem href="/mixer" open={open} onClick={() => setOpen(false)}>
            <GoSettings size={24} name="Mixer"/>
          </MobileMenuItem>
          <MobileMenuItem href="/room" open={open} onClick={() => setOpen(false)}>
            <BiCube size={24} name="3D Audio"/>
          </MobileMenuItem>
        </>
      )}
      <MobileMenuItem href="/devices" open={open} onClick={() => setOpen(false)}>
        <FaTools size={24} name="Devices"/>
      </MobileMenuItem>
      <MobileMenuItem href="/chat" open={open} onClick={() => setOpen(false)}>
        <BiChat size={24} name="Chat"/>
      </MobileMenuItem>
      <MobileMenuItem href="/stages" open={open} onClick={() => setOpen(false)}>
        <GoListUnordered size={24} name="Stages"/>
      </MobileMenuItem>

      <PrimaryButton
        round={true}
        toggled={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <BsThreeDotsVertical size={24}/>
      </PrimaryButton>
    </MobileMenuComponent>
  )
}
export default MobileMenu
