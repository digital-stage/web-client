import {useCallback, useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/router'
import {
  useAuth,
  Stage,
  Group,
  useStageSelector,
  User,
  useConnection,
} from '@digitalstage/api-client-react'
import {useIntl} from 'react-intl'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import ModifyStageModal from '../components/stages/modals/ModifyStageModal'
import PrimaryButton from '../ui/button/PrimaryButton'
import SecondaryButton from '../ui/button/SecondaryButton'
import TertiaryButton from '../ui/button/TertiaryButton'
import DeleteStageModal from '../components/stages/modals/DeleteStageModal'
import ModifyGroupModal from '../components/stages/modals/ModifyGroupModal'
import DeleteGroupModal from '../components/stages/modals/DeleteGroupModal'
import StageList from "../components/stages/StageList";

const StageRow = (props: {
  id: string
  onModifyStageClicked: () => void
  onModifyGroupClicked: () => void
  onDeleteGroupClicked: () => void
  onDeleteStageClicked: () => void
  onStageSelected: (stage: Stage) => void
  onGroupSelected: (group: Group) => void
}) => {
  const {
    id,
    onStageSelected,
    onGroupSelected,
    onModifyStageClicked,
    onModifyGroupClicked,
    onDeleteGroupClicked,
    onDeleteStageClicked,
  } = props
  const stage = useStageSelector<Stage>((state) => state.stages.byId[id])
  // const groupIds = useStageSelector<string[]>(state => state.groups.byStage[id]);
  const groups = useStageSelector<Group[]>((state) => {
    const groupIds = state.groups.byStage[id]
    if (groupIds) return groupIds.map((groupId) => state.groups.byId[groupId])
    return []
  })
  const {formatMessage} = useIntl()
  const f = (id) => formatMessage({id})

  return (
    <div>
      {stage.name}

      <SecondaryButton
        onClick={() => {
          onStageSelected(stage)
          onModifyStageClicked()
        }}
      >
        edit
      </SecondaryButton>
      <TertiaryButton
        onClick={() => {
          onStageSelected(stage)
          onDeleteStageClicked()
        }}
      >
        remove
      </TertiaryButton>

      <PrimaryButton
        onClick={() => {
          onStageSelected(stage)
          onGroupSelected(undefined)
          onModifyGroupClicked()
        }}
      >
        {f('createGroup')}
      </PrimaryButton>

      {groups.map((group) => (
        <div>
          {group.name}
          <SecondaryButton
            onClick={() => {
              onStageSelected(stage)
              onGroupSelected(group)
              onModifyGroupClicked()
            }}
          >
            edit
          </SecondaryButton>
          <TertiaryButton
            onClick={() => {
              onStageSelected(stage)
              onGroupSelected(group)
              onDeleteGroupClicked()
            }}
          >
            remove
          </TertiaryButton>
        </div>
      ))}
    </div>
  )
}

const JoinField = () => {
  const stageRef = useRef<HTMLInputElement>()
  const groupRef = useRef<HTMLInputElement>()
  const connection = useConnection()

  const handleJoin = useCallback(() => {
    if (connection && stageRef.current && groupRef.current) {
      connection.emit(ClientDeviceEvents.JoinStage, {
        stageId: stageRef.current.value,
        groupId: groupRef.current.value,
      } as ClientDevicePayloads.JoinStage)
    }
  }, [connection, stageRef, groupRef])

  return (
    <div>
      <label>
        STAGE ID:
        <input type="text" ref={stageRef}/>
      </label>
      <label>
        GROUP ID:
        <input type="text" ref={groupRef}/>
      </label>
      <PrimaryButton onClick={handleJoin}>JOIN</PrimaryButton>
    </div>
  )
}

const Stages = () => {
  // Forward to login if not authenticated
  const {push} = useRouter()
  const {loading, user: authUser} = useAuth()
  useEffect(() => {
    if (push && !loading) {
      if (!authUser) {
        push('/login')
      }
    }
  }, [authUser, loading, push])

  const user = useStageSelector<User>((state) => state.globals.localUser)
  const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
  const [modifyStageOpen, setModifyStageOpen] = useState<boolean>(false)
  const [deleteStageOpen, setDeleteStageOpen] = useState<boolean>(false)
  const [modifyGroupOpen, setModifyGroupOpen] = useState<boolean>(false)
  const [deleteGroupOpen, setDeleteGroupOpen] = useState<boolean>(false)
  const [selectedStage, setSelectedStage] = useState<Stage>()
  const [selectedGroup, setSelectedGroup] = useState<Group>()

  return (
    <div className="wrapper">
      <StageList/>
      <JoinField/>
      {user && user.canCreateStage && (
        <PrimaryButton
          onClick={() => {
            setSelectedStage(undefined)
            setModifyStageOpen(true)
          }}
        >
          Add stage
        </PrimaryButton>
      )}
      {stageIds.map((stageId) => (
        <StageRow
          id={stageId}
          onStageSelected={(stage) => setSelectedStage(stage)}
          onGroupSelected={(group) => setSelectedGroup(group)}
          onModifyStageClicked={() => setModifyStageOpen(true)}
          onModifyGroupClicked={() => setModifyGroupOpen(true)}
          onDeleteGroupClicked={() => setDeleteGroupOpen(true)}
          onDeleteStageClicked={() => setDeleteStageOpen(true)}
        />
      ))}
      <ModifyStageModal
        stage={selectedStage}
        open={modifyStageOpen}
        onClose={() => {
          setModifyStageOpen(false)
        }}
      />
      <ModifyGroupModal
        stage={selectedStage}
        group={selectedGroup}
        open={modifyGroupOpen}
        onClose={() => {
          setModifyGroupOpen(false)
        }}
      />
      <DeleteStageModal
        open={deleteStageOpen}
        onClose={() => setDeleteStageOpen(false)}
        stage={selectedStage}
      />
      <DeleteGroupModal
        open={deleteGroupOpen}
        onClose={() => setDeleteGroupOpen(false)}
        group={selectedGroup}
      />
      <style jsx>{`
       .wrapper {
        padding: 1rem
      }
      `}</style>
    </div>
  )
}
export default Stages
