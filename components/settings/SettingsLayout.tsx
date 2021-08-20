import classes from '../global/AuthLayout.module.css'
import { SecondaryHeadlineLink } from '../../ui/HeadlineLink'
import React from 'react'
import Container from 'ui/Container'
import Panel from '../../ui/Panel'
import styles from '../mixer/ReactiveMixingPanel/ReactiveMixingPanel.module.scss'
import { selectMode } from '@digitalstage/api-client-react'
import TextSwitch from '../../ui/TextSwitch'
import { useRouter } from 'next/router'
import Link from 'next/link'

const SettingsNav2 = () => (
    <div className={classes.nav}>
        <SecondaryHeadlineLink className={classes.navItem} href="/settings/device">
            <h4>Gerät</h4>
        </SecondaryHeadlineLink>
        <SecondaryHeadlineLink className={classes.navItem} href="/settings/profile">
            <h4>Profil</h4>
        </SecondaryHeadlineLink>
    </div>
)
const SettingsNav = () => {
    const { pathname } = useRouter()
    return (
        <TextSwitch className={styles.switch} value={pathname}>
            <Link key="/settings/device" href="/settings/device">
                <a>Gerät</a>
            </Link>
            <Link key="/settings/profile" href="/settings/profile">
                <a>Profil</a>
            </Link>
        </TextSwitch>
    )
}

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Container size="small">
            <SettingsNav />
            <Panel>{children}</Panel>
        </Container>
    )
}
export default SettingsLayout
