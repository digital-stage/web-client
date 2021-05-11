import React from "react";
import styles from './Container.module.css'

const Container = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => <div
  className={`${styles.container} ${props.className}`} {...props}/>
export default Container
