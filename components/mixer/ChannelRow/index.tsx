import React from 'react';
import styles from "./ChannelRow.module.css"

const ChannelRow = ({children, className, ...other}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>): JSX.Element => {
  return (
    <div
      className={`${styles.wrapper} ${className}`}
      {...other}
    >
      {children}
    </div>
  );
};
export default ChannelRow;
