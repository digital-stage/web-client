import classes from '../global/AuthLayout.module.css'
import { SecondaryHeadlineLink } from '../../ui/HeadlineLink'
import React from 'react'

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
export default SettingsNav
