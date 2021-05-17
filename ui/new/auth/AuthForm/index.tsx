import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import styles from './AuthForm.module.css';

const AuthForm = ({
  className,
  ...other
}: DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>) => (
  <form className={`${styles.form} ${className}`} {...other} />
);
export default AuthForm;
