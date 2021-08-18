import styles from './SettingsList.module.scss'
import React from 'react'

export const SettingEntry = ({
    children,
    indent,
}: {
    children: React.ReactNode
    indent?: boolean
}): JSX.Element => <li className={`${styles.setting} ${indent ? styles.sub : ''}`}>{children}</li>

const SettingsList = ({ children }: { children: Array<typeof SettingEntry> }): JSX.Element => (
    <ul className={styles.settings}>{children}</ul>
)

export default SettingsList
