import styles from './TertiaryButton.module.css'
import React from "react";

const TertiaryButton = ({
                        round,
                        toggled,
                        className,
                        ...props
                      }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  round?: boolean;
  toggled?: boolean;
}) => <button
  className={`${styles.button} ${round ? styles.round : styles.elliptic} ${toggled === false && styles.inactive} ${className}`} {...props}/>
export default TertiaryButton
