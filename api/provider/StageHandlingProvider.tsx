import * as React from 'react'
import { useMemo } from 'react'

interface StageHandlingContextT {
    stageId?: string
    groupId?: string
    password?: string

    requestJoin: (request: { stageId: string; groupId?: string; password?: string | null }) => void

    reset(): void
}

const throwAddProviderError = () => {
    throw new Error('Please wrap around your DOM tree with the StageJoinerProvider')
}

const StageHandlingContext = React.createContext<StageHandlingContextT>({
    requestJoin: throwAddProviderError,
    reset: throwAddProviderError,
})

const StageHandlingProvider = (props: { children: React.ReactNode }): JSX.Element => {
    const { children } = props
    const [stageId, setStageId] = React.useState<string>()
    const [groupId, setGroupId] = React.useState<string>()
    const [password, setPassword] = React.useState<string>()

    const value = useMemo<StageHandlingContextT>(
        () => ({
            stageId,
            groupId,
            password,
            requestJoin: ({ stageId: reqStageId, groupId: reqGroupId, password: reqPassword }) => {
                setStageId(reqStageId)
                setGroupId(reqGroupId)
                setPassword(reqPassword ? reqPassword : undefined)
            },
            reset: () => {
                setStageId(undefined)
                setGroupId(undefined)
                setPassword(undefined)
            },
        }),
        [groupId, password, stageId]
    )

    return <StageHandlingContext.Provider value={value}>{children}</StageHandlingContext.Provider>
}

export type { StageHandlingContextT }
export { StageHandlingContext }
export default StageHandlingProvider
