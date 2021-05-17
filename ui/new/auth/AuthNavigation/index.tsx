/* eslint-disable react/jsx-props-no-spreading */
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import styles from './AuthNavigation.module.css';

const AuthNavigation = ({
                          className,
                          ...other
                        }: DetailedHTMLProps<FormHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={`${styles.wrapper} ${className}`} {...other} />
);
export default AuthNavigation;
