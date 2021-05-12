import styles from './PrimaryButton.module.css'
import React from "react";

const PrimaryButton = ({
                         round,
                         toggled,
                         className,
                         ...props
                       }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  round?: boolean;
  toggled?: boolean;
}) => <button
  className={`${styles.button} ${round ? styles.round : styles.elliptic} ${toggled === false && styles.inactive} ${className}`} {...props}/>
export default PrimaryButton
