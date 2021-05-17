import styles from "./MobileMenu.module.css"
import * as  React from "react";

const MobileMenu = (props: {
  children: React.ReactNode
}) => {
  const {children} = props;

  return (
    <div className={styles.wrapper}>
      {children}
    </div>
  )
}
export default MobileMenu
