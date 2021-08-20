import { SecondaryHeadlineLink } from '../../ui/HeadlineLink'
import React from 'react'
import Container from 'ui/Container'
import Panel from '../../ui/Panel'
import styles from './SettingsLayout.module.scss'

const SettingsNav = () => (
    <div className={styles.nav}>
        <SecondaryHeadlineLink className={styles.navItem} href="/settings/device">
            <h4 className={styles.heading}>Gerät</h4>
        </SecondaryHeadlineLink>
        <SecondaryHeadlineLink className={styles.navItem} href="/settings/profile">
            <h4 className={styles.heading}>Profil</h4>
        </SecondaryHeadlineLink>
    </div>
)
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Container size="small">
            <Panel className={styles.panel}>
                <SettingsNav />
                {children}
            </Panel>
        </Container>
    )
}
export default SettingsLayout
