import styles from './SecondaryButton.module.css'
import React from "react";

const SecondaryButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => <button className={styles.button} {...props}/>
export default SecondaryButton
