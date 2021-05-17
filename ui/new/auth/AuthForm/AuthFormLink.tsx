/* eslint-disable react/jsx-props-no-spreading */
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import styles from './AuthForm.module.css';

const AuthFormLink = ({
                          className,
                          ...other
                        }: DetailedHTMLProps<FormHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => (
  <a className={`${styles.link} ${className}`} {...other} />
);
export default AuthFormLink;
