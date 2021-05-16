import styles from "../../styles/Account.module.css";
import React from "react";

const AuthContainer = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  const {className, ...other} = props;
  return (
    <div className={styles.wrapper}>
      <img alt="Digital Stage" className={styles.logo} src="/static/logo-full.svg"/>
      <div className={`${styles.panel} ${className}`} {...other}/>
    </div>
  )
}
export default AuthContainer;