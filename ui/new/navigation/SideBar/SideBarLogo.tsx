import styles from "./SideBar.module.css"
import * as React from "react";

const SideBarLogo = ({children}: {
  children: React.ReactNode
}) => <div className={styles.logo}>{children}</div>

export default SideBarLogo
