import styles from "./MobileMenu.module.css"
import React, {MouseEventHandler} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import PrimaryButton from "../../../button/PrimaryButton";
import TertiaryButton from "../../../button/TertiaryButton";

const MobileMenuItem = (props: {
  href: string;
  children: React.ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  open: boolean;
}) => {
  const {href, children, onClick, open} = props;
  const {pathname} = useRouter()

  return (
    <Link href={href} passHref>
      {pathname === href ? (
        <PrimaryButton
          onClick={onClick}
          round
          className={`${styles.menuItem} 
        ${open ? styles.active : styles.inactive}`}>
          {children}
        </PrimaryButton>
      ) : (
        <TertiaryButton
          onClick={onClick}
          round
          className={`${styles.menuItem} 
        ${open ? styles.active : styles.inactive}`}>
          {children}
        </TertiaryButton>
      )}
    </Link>
  )
}
export default MobileMenuItem
