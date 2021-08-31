import { useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual } from 'react-redux'
import React, { useState } from 'react'
import List, { ListItem } from '../../ui/List'
import styles from './StagesList.module.scss'
import StageModal from './modals/StageModal'
import Tag from '../../ui/Tag'
import Paragraph from '../../ui/Paragraph'
import EnterInviteCodeModal from './modals/EnterInviteCodeModal'
import { useStageJoiner } from '../../api/hooks/useStageJoiner'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MdEdit, MdMoreHoriz } from 'react-icons/md'

const Type = {
    mediasoup: 'Web',
    jammer: 'Jammer',
    ov: 'OV',
}

const StageItem = ({ stageId }: { stageId: string }) => {
    const { push } = useRouter()
    const { name, admins, password, videoType, audioType } = useStageSelector<{
        name: string
        admins: string[]
        password?: string
        videoType: string
        audioType: string
    }>((state) => {
        const { name, admins, password, videoType, audioType } = state.stages.byId[stageId]
        return {
            name,
            admins,
            password,
            videoType,
            audioType,
        }
    }, shallowEqual)
    const userId = useStageSelector((state) => state.globals.localUserId)
    const hasGroups = useStageSelector((state) => state.groups.byStage[stageId]?.length > 0)
    const isActive = useStageSelector(
        (state) => state.globals.stageId && state.globals.stageId === stageId
    )
    const isStageAdmin = React.useMemo(() => admins.find((id) => id === userId), [admins, userId])
    const { join, leave } = useStageJoiner()
    const onListClicked = React.useCallback(() => {
        if (hasGroups) {
            if (isActive) {
                return leave()
            } else {
                return join({ stageId, password: password })
            }
        }
        push(`/stages/${stageId}`)
    }, [hasGroups, isActive, join, leave, password, push, stageId])
    return (
        <ListItem className={isActive ? styles.active : ''} onSelect={onListClicked}>
            <a className={styles.stageName}>
                {name}
                <Tag kind="success">{Type[videoType]}</Tag>
                <Tag kind="warn">{Type[audioType]}</Tag>
            </a>
            <span onClick={(e) => e.stopPropagation()}>
                <Link href={`/stages/${stageId}`} passHref>
                    <button className="small">
                        {isStageAdmin ? (
                            <>
                                <MdEdit />
                                <span className={styles.hideOnMobile}>&nbsp;Details</span>
                            </>
                        ) : (
                            <>
                                <MdMoreHoriz />
                                <span className={styles.hideOnMobile}>&nbsp;Details</span>
                            </>
                        )}
                    </button>
                </Link>
            </span>
        </ListItem>
    )
}

const StagesList = () => {
    const [enterCodeRequested, requestEnterCode] = useState<boolean>(false)
    const [createStageRequested, requestStageCreation] = useState<boolean>(false)
    const stageIds = useStageSelector((state) => state.stages.allIds)

    return (
        <List>
            {stageIds.map((stageId) => (
                <StageItem key={stageId} stageId={stageId} />
            ))}
            <Paragraph kind="micro" className={styles.legend}>
                Legende:
                <Tag kind="success">Videoübertragung</Tag>
                <Tag kind="warn">Audioübertragung</Tag>
            </Paragraph>
            <div className={styles.actions}>
                <button className="tertiary" onClick={() => requestStageCreation(true)}>
                    Neue Bühne erstellen
                </button>
                <button className="tertiary" onClick={() => requestEnterCode(true)}>
                    Einladungscode eingeben
                </button>
            </div>
            <EnterInviteCodeModal
                open={enterCodeRequested}
                onClose={() => requestEnterCode(false)}
            />
            <StageModal open={createStageRequested} onClose={() => requestStageCreation(false)} />
        </List>
    )
}
export default StagesList
