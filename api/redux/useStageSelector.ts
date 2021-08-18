import { shallowEqual, useSelector } from 'react-redux'
import { RootState } from './store'

const useStageSelector = <T>(
    selector: (state: RootState) => T,
    equalityFn?: (left: T, right: T) => boolean
): T => useSelector<RootState, T>(selector, equalityFn ? equalityFn : shallowEqual)

export default useStageSelector
