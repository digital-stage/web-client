/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {selectIsCurrentlyAdmin, useStageSelector, useTrackedSelector} from '@digitalstage/api-client-react'
import React from 'react'
import {List, ListItem} from 'ui/List'
import {StageModal} from './modals/StageModal'
import {Tag} from 'ui/Tag'
import {Paragraph} from 'ui/Paragraph'
import {EnterInviteCodeModal} from './modals/EnterInviteCodeModal'
import {useStageJoiner} from '../../api/hooks/useStageJoiner'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {MdEdit, MdMoreHoriz} from 'react-icons/md'

enum Type {
  mediasoup = 'Web',
  jammer = 'Jammer',
  ov = 'OV',
}

const StageItem = ({stageId}: { stageId: string }) => {
  const {push} = useRouter()
    const state = useTrackedSelector()
  const name = state.stages.byId[stageId].name
  const password = useStageSelector((state) => state.stages.byId[stageId].password)
  const videoType = useStageSelector((state) => state.stages.byId[stageId].videoType as 'mediasoup' | 'jammer' | 'ov')
  const audioType = useStageSelector((state) => state.stages.byId[stageId].audioType as 'mediasoup' | 'jammer' | 'ov')
  const hasGroups = useStageSelector((state) => state.groups.byStage[stageId]?.length > 0)
  const isActive = useStageSelector(
    (state) => state.globals.stageId && state.globals.stageId === stageId
  )
  const isStageAdmin = selectIsCurrentlyAdmin(state)
  const {join, leave} = useStageJoiner()
  const onListClicked = React.useCallback(() => {
    if (hasGroups) {
      if (isActive) {
        return leave()
      } else {
        return join({stageId, password: password})
      }
    }
    push(`/stages/${stageId}`)
  }, [hasGroups, isActive, join, leave, password, push, stageId])
  return (
    <ListItem className={isActive ? 'stageItemActive' : ''} onSelect={onListClicked}>
      <a className="stageItemName">
        {name}
        <Tag kind="success">{Type[videoType]}</Tag>
        <Tag kind="warn">{Type[audioType]}</Tag>
      </a>
      <span onClick={(e) => e.stopPropagation()}>
                <Link href={`/stages/${stageId}`} passHref>
                    <button className="small">
                        {isStageAdmin ? (
                          <>
                            <MdEdit/>
                            <span className="stageItemHideOnMobile">&nbsp;Editieren</span>
                          </>
                        ) : (
                          <>
                            <MdMoreHoriz/>
                            <span className="stageItemHideOnMobile">&nbsp;Details</span>
                          </>
                        )}
                    </button>
                </Link>
            </span>
    </ListItem>
  )
}

const StagesList = () => {
  const [enterCodeRequested, requestEnterCode] = React.useState<boolean>(false)
  const [createStageRequested, requestStageCreation] = React.useState<boolean>(false)
  const stageIds = useStageSelector((state) => state.stages.allIds)

  return (
    <List className="stagesList">
      {stageIds.map((stageId) => (
        <StageItem key={stageId} stageId={stageId}/>
      ))}
      <Paragraph kind="micro" className="stagesListLabel">
        Legende:
        <Tag kind="success">Videoübertragung</Tag>
        <Tag kind="warn">Audioübertragung</Tag>
      </Paragraph>
      <div className="stagesListActions">
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
      <StageModal open={createStageRequested} onClose={() => requestStageCreation(false)}/>
    </List>
  )
}
export {StagesList}
