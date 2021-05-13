import styles from './Panel.module.css'
import React from "react";

export interface LEVEL {
  Level1: 'level1';
  Level2: 'level2';
  Level3: 'level3';
  Level4: 'level4';
  Level5: 'level5';
}

const Panel = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  level?: LEVEL[keyof LEVEL];
  fill?: boolean;
}) => {
  const {level, fill, className, ...other} = props;
  let levelStyle = styles.level1;
  switch (level) {
    case 'level2': {
      levelStyle = styles.level2;
      break;
    }
    case 'level3': {
      levelStyle = styles.level3;
      break;
    }
    case 'level4': {
      levelStyle = styles.level4;
      break;
    }
    case 'level5': {
      levelStyle = styles.level5;
      break;
    }
    default: {
      break;
    }
  }
  return <div className={`${styles.panel} ${fill ? styles.fill : ""} ${levelStyle} ${className}`} {...other}/>
}
export default Panel;
