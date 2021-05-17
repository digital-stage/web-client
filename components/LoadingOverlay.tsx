import styles from "./LoadingOverlay.module.scss"
import {ReactNode} from "react";

const LoadingOverlay = ({children}: { children: ReactNode }) => <div className={styles.overlay}>{children}</div>
export default LoadingOverlay
