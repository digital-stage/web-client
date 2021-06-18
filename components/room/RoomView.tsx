import { fabric } from 'fabric'
import { useEffect, useRef, useState } from 'react'
import { Canvas } from 'fabric/fabric-impl'
import styles from './RoomView.module.css'
import { useStageSelector } from '../../api-client-react'

const StageView = ({ stageId }: { stageId: string }) => {
    const [canvas, setCanvas] = useState<Canvas>()
    const canvasRef = useRef<HTMLCanvasElement>()
    const groups = useStageSelector((state) =>
        state.groups.byStage[stageId].map((id) => state.groups.byId[id])
    )

    useEffect(() => {
        if (canvasRef.current) {
            setCanvas(new fabric.Canvas('canvas'))
        }
    }, [canvasRef])

    return <canvas className={styles.canvas} ref={canvasRef} />
}

const RoomView = () => {
    const stageId = useStageSelector<string>((state) => state.globals.stageId)

    if (stageId) return <StageView stageId={stageId} />

    return null
}
export default RoomView
