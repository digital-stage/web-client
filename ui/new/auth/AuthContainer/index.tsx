import React, { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import styles from './AuthContainer.module.css';

const AuthContainer = ({
  className,
  ...other
}: DetailedHTMLProps<FormHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={styles.wrapper}>
    <img alt="Digital Stage" className={styles.logo} src="/static/logo-full.svg" />
    <div className={`${styles.panel} ${className}`} {...other} />
  </div>
);
export default AuthContainer;
