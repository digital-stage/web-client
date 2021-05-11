import styles from './PrimaryButton.module.css'
import React from "react";

const PrimaryButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) =>
  <button className={styles.button} {...props}/>
export default PrimaryButton
