/* eslint-disable react/jsx-props-no-spreading */
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import styles from './AuthNavigation.module.css';
import {SecondaryHeadlineLink} from "../../../button/HeadlineLink";

const AuthNavigationItem = ({
                        className,
                        ...other
                      }: DetailedHTMLProps<FormHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
  href: string
}) => (
  <SecondaryHeadlineLink className={`${styles.link} ${className}`} {...other} />
);
export default AuthNavigationItem;
