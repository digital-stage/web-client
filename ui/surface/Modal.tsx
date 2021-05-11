import React, {useEffect, useRef} from "react";
import styles from './Modal.module.css'
import Panel, {LEVEL} from "./Panel";
import {Portal} from 'react-portal';
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock';

export interface SIZE {
  Default: 'default';
  Full: 'full';
  Auto: 'auto';
}

const Modal = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  level?: LEVEL[keyof LEVEL];
  size?: SIZE[keyof SIZE];
  open: boolean;
  onClose: () => void;
}) => {
  const {open, onClose, size, ...other} = props;
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (ref.current) {
      const target = ref.current;
      if (open) {
        disableBodyScroll(target);
        return () => {
          enableBodyScroll(target);
        }
      }
    }
  }, [ref, open]);

  let sizeClass = "";
  switch(size) {
    case "full": {
      sizeClass = styles.full;
      break;
    }
    case "auto": {
      sizeClass = styles.auto;
      break;
    }
    default:
    case "default": {
      sizeClass = styles.default;
      break;
    }
  }

  return open && (
    <Portal>
      <div ref={ref} className={styles.backdrop} onClick={onClose}>
        <div className={`${styles.modal} ${sizeClass}`} onClick={(e) => {
          e.stopPropagation()
        }}>
          <Panel fill={true} aria-modal="true" {...other}/>
        </div>
      </div>
    </Portal>
  )
};
export default Modal;
