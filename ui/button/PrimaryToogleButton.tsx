import styles from './TertiaryButton.module.css'
import React from "react";

const PrimaryToggleButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  toggled: boolean
}) => <button className={styles.button} {...props}/>
export default PrimaryToggleButton
