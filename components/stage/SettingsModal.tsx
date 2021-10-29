import {
  useEmit,
  useTrackedSelector
} from "../../client";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import React, {ChangeEvent} from "react";
import {OptionsList, OptionsListItem} from "ui/OptionsList";
import {Modal, ModalButton, ModalFooter, ModalHeader} from "../../ui/Modal";
import {Switch} from "../../ui/Switch";
import {TextSwitch} from "../../ui/TextSwitch";
import {Heading4} from "../../ui/Heading";

const SettingsModal = ({open, onClose}: {
  open: boolean,
  onClose: () => void
}): JSX.Element => {
  const emit = useEmit()
  const state = useTrackedSelector()
  const {localDeviceId} = state.globals
  const displayMode = localDeviceId && state.devices.byId[localDeviceId].displayMode || "boxes"
  const numLanes = localDeviceId && state.devices.byId[localDeviceId].numLanes || 3
  const numBoxes = localDeviceId && state.devices.byId[localDeviceId].numBoxes || 2
  const showOffline = localDeviceId && state.devices.byId[localDeviceId].showOffline || false

  const toggleShowOffline = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (emit && localDeviceId) {
      emit(ClientDeviceEvents.ChangeDevice, {
        _id: localDeviceId,
        showOffline: e.currentTarget.checked
      })
    }
  }, [emit, localDeviceId])
  const setDisplayMode = React.useCallback((key: React.Key) => {
    if (emit && localDeviceId) {
      const mode = key === "lanes" ? "lanes" : "boxes"
      emit(ClientDeviceEvents.ChangeDevice, {
        _id: localDeviceId,
        displayMode: mode
      })
    }
  }, [emit, localDeviceId])

  const increaseCols = React.useCallback(() => {
    if (localDeviceId && emit) {
      if (displayMode === "lanes") {
        emit(ClientDeviceEvents.ChangeDevice, {
          _id: localDeviceId,
          numLanes: (numLanes + 1)
        } as ClientDevicePayloads.ChangeDevice)
      } else {
        emit(ClientDeviceEvents.ChangeDevice, {
          _id: localDeviceId,
          numBoxes: (numBoxes + 1)
        } as ClientDevicePayloads.ChangeDevice)
      }
    }
  }, [displayMode, emit, localDeviceId, numBoxes, numLanes])
  const decreaseCols = React.useCallback(() => {
    if (localDeviceId && emit) {
      if (displayMode === "lanes") {
        const numCols = Math.max(0, numLanes - 1)
        if (numCols !== numLanes) {
          emit(ClientDeviceEvents.ChangeDevice, {
            _id: localDeviceId,
            numLanes: numCols
          } as ClientDevicePayloads.ChangeDevice)
        }
      } else {
        const numCols = Math.max(0, numLanes - 1)
        if (numCols !== numLanes) {
          emit(ClientDeviceEvents.ChangeDevice, {
            _id: localDeviceId,
            numLanes: numCols
          } as ClientDevicePayloads.ChangeDevice)
        }

        emit(ClientDeviceEvents.ChangeDevice, {
          _id: localDeviceId,
          numBoxes: Math.max(0, numBoxes - 1)
        } as ClientDevicePayloads.ChangeDevice)
      }
    }
  }, [displayMode, emit, localDeviceId, numBoxes, numLanes])

  return (
    <Modal size="small" open={open} onClose={onClose}>
      <ModalHeader>
        <Heading4>Darstellung anpassen</Heading4>
      </ModalHeader>
      <OptionsList>
        <OptionsListItem as={<label/>}>
          Zeige inaktive Nutzer
          <Switch round checked={showOffline} onChange={toggleShowOffline}/>
        </OptionsListItem>
        <OptionsListItem className="displayModeToggle">
          <TextSwitch
            value={displayMode}
            onSelect={setDisplayMode}
          >
            <span key="boxes">Box-Modus</span>
            <span key="lanes">Lane-Modus</span>
          </TextSwitch>
        </OptionsListItem>
        <OptionsListItem kind="sub">
          Anzahl Spalten
          <button className="small" onClick={decreaseCols}>-</button>
          <span>{displayMode === "lanes" ? (numLanes > 0 ? numLanes : "auto") : (numBoxes > 0 ? numBoxes : "auto")}</span>
          <button className="small" onClick={increaseCols}>+</button>
        </OptionsListItem>
      </OptionsList>
      <ModalFooter>
        <ModalButton
          onClick={onClose}
          autoFocus
        >
          Fertig
        </ModalButton>
      </ModalFooter>
    </Modal>
  )
}
export {SettingsModal}