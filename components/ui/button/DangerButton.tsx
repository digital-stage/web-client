import styles from './DangerButton.module.css'
import React from "react";

const DangerButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => <button className={styles.button} {...props}/>
export default DangerButton
