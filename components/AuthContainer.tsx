import styles from './AuthContainer.module.scss'

const AuthContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.container}>{children}</div>
}
export default AuthContainer
