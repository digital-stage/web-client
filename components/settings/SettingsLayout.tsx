import classes from '../global/AuthLayout.module.css'
import { SecondaryHeadlineLink } from '../../ui/HeadlineLink'
import React from 'react'
import Container from 'ui/Container'
import Panel from '../../ui/Panel'

const SettingsNav = () => (
    <div className={classes.nav}>
        <SecondaryHeadlineLink className={classes.navItem} href="/settings/device">
            <h4>Gerät</h4>
        </SecondaryHeadlineLink>
        <SecondaryHeadlineLink className={classes.navItem} href="/settings/profile">
            <h4>Profil</h4>
        </SecondaryHeadlineLink>
    </div>
)

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Container size="small">
            <h2>Einstellungen</h2>
            <Panel>
                <SettingsNav />
                {children}
            </Panel>
        </Container>
    )
}
export default SettingsLayout
