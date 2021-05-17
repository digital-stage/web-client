/* eslint-disable react/jsx-props-no-spreading */
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import styles from './AuthForm.module.css';

const AuthFormHeader = ({
  className,
  ...other
}: DetailedHTMLProps<FormHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={`${styles.formHeader} ${className}`} {...other} />
);
export default AuthFormHeader;
