import * as React from "react";
import styles from "./SideBar.module.css"

const SideBar = ({top, center, bottom}: {
  top?: React.ReactNode,
  center?: React.ReactNode,
  bottom?: React.ReactNode
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.start}>
        {top}
      </div>
      <div className={styles.spacer}/>
      <div className={styles.center}>
        {center}
      </div>
      <div className={styles.spacer}/>
      <div className={styles.end}>
        {bottom}
      </div>
    </div>
  )
}
export default SideBar
