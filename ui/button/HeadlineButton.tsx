import styles from "./HeadlineButton.module.css"
import React from "react";

const PrimaryHeadlineButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  toggled?: boolean
}) => {
  const {className, toggled, ...other} = props;
  return (
    <button className={`${styles.button} ${styles.primary} ${toggled && styles.active} ${styles.toggled} ${className} ${other}`} {...other}/>
  )
}

const SecondaryHeadlineButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  toggled?: boolean
}) => {
  const {className, toggled, ...other} = props;
  return (
    <button className={`${styles.button} ${styles.secondary} ${toggled && styles.active} ${styles.toggled} ${className} ${other}`} {...other}/>
  )
}

export {
  PrimaryHeadlineButton,
  SecondaryHeadlineButton
}

export default PrimaryHeadlineButton