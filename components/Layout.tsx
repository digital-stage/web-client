import {useStageSelector} from "@digitalstage/api-client-react"
import styles from "../styles/Layout.module.scss"
import Sidebar from "./Sidebar";
import Background from "./Background";

const Layout = ({children}: { children: React.ReactNode }) => {
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)
  return (
    <div className={`${styles.layout} ${insideStage && styles.insideStage}`}>
      <Background/>
      <div className={styles.sidebar}>
        <div className={styles.fixedSidebar}>
          <Sidebar/>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
export default Layout
