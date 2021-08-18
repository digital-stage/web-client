import * as React from 'react'
import { useMemo } from 'react'

export enum Errors {
    NOT_FOUND = 'not-found',
    INVALID_PASSWORD = 'invalid-password',
    INTERNAL_ERROR = 'internal-error',
}

export interface TStageJoinerContext {
    stageId?: string
    groupId?: string
    password?: string

    requestJoin: (request: { stageId: string; groupId?: string; password?: string | null }) => void

    reset(): void
}

const throwAddProviderError = () => {
    throw new Error('Please wrap around your DOM tree with the StageJoinerProvider')
}

const StageHandlingContext = React.createContext<TStageJoinerContext>({
    requestJoin: throwAddProviderError,
    reset: throwAddProviderError,
})

const useStageJoiner = (): TStageJoinerContext =>
    React.useContext<TStageJoinerContext>(StageHandlingContext)

const StageJoinerProvider = (props: { children: React.ReactNode }): JSX.Element => {
    const { children } = props
    const [stageId, setStageId] = React.useState<string>()
    const [groupId, setGroupId] = React.useState<string>()
    const [password, setPassword] = React.useState<string>()

    const value = useMemo<TStageJoinerContext>(
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
export { StageJoinerProvider }
export default useStageJoiner
