import {useStageSelector} from "@digitalstage/api-client-react"
import styles from "../styles/Layout.module.scss"

const Layout = ({children}: { children: React.ReactNode }) => {
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)
  return (
    <div className={insideStage ? styles.insideStage}>

    </div>
  )
}
export default Layout
