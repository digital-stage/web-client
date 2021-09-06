import React from 'react'
import Image from 'next/image'
import landscapeIcon from '../../public/icons/landscape.svg'
import portraitIcon from '../../public/icons/portrait.svg'
import { MembersGrid } from './MembersGrid'

const StageView = ({ stageId }: { stageId: string }) => {
    const [showLanes, setShowLanes] = React.useState<boolean>(false)
    return (
        <div className={`wrapper stageLayout`}>
            <MembersGrid stageId={stageId} showLanes={showLanes} />
            <div className="control">
                <button className="round" onClick={() => setShowLanes(false)}>
                    <Image src={landscapeIcon} alt="Auf Breitbilddarstellung umschalten" />
                </button>
                <button className="round" onClick={() => setShowLanes(true)}>
                    <Image src={portraitIcon} alt="Auf Hochkantdarstellung umschalten" />
                </button>
            </div>
        </div>
    )
}
export { StageView }
