import { fabric } from 'fabric'
import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect } from 'fabric/fabric-impl'
import { Group } from '@digitalstage/api-types'
import styles from './RoomView.module.css'
import { useStageSelector } from '../../api-client-react'

const GroupRenderer = ({ groupId, canvas }: { groupId: string; canvas?: Canvas }) => {
    const group = useStageSelector<Group>((state) => state.groups.byId[groupId])
    const [rect] = useState<Rect>(
        new fabric.Rect({ top: 100, left: 100, width: 100, height: 100, fill: '#f55', angle: 45 })
    )

    useEffect(() => {
        if (canvas && rect) canvas.add(rect)
    }, [canvas, rect])

    useEffect(() => {
        if (group && rect) {
            // rect.top = group.x
        }
    }, [group, rect])

    return null
}

const StageView = ({ stageId }: { stageId: string }) => {
    const [canvas, setCanvas] = useState<Canvas>()
    const canvasRef = useRef<HTMLCanvasElement>()
    const groupIds = useStageSelector((state) => state.groups.byStage[stageId])

    useEffect(() => {
        if (canvasRef.current) {
            setCanvas(new fabric.Canvas('canvas'))
        }
    }, [canvasRef])

    return (
        <>
            <canvas className={styles.canvas} ref={canvasRef} />
            {groupIds.map((id) => (
                <GroupRenderer groupId={id} canvas={canvas} />
            ))}
        </>
    )
}

const RoomView = () => {
    const stageId = useStageSelector<string>((state) => state.globals.stageId)

    if (stageId) return <StageView stageId={stageId} />

    return null
}
export default RoomView
