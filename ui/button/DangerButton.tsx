import styles from './DangerButton.module.css'
import React from "react";

const DangerButton = ({
                        size,
                        round,
                        toggled,
                        className,
                        ...props
                      }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  round?: boolean;
  toggled?: boolean;
  size?: "default" | "small" | "large";
}) => <button
  className={`${styles.button} ${round ? styles.round : styles.elliptic} ${toggled === false && styles.inactive} ${size && styles[size]} ${className}`} {...props}/>
export default DangerButton
