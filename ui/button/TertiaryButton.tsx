import styles from './TertiaryButton.module.css'
import React from "react";

const TertiaryButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => <button className={styles.button} {...props}/>
export default TertiaryButton
