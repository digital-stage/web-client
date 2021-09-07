import { SecondaryHeadlineLink  } from 'ui/HeadlineLink'
import React from 'react'
import {Container} from 'ui/Container'
import { Panel } from 'ui/Panel'

const SettingsNav = () => (
    <nav className="nav">
        <SecondaryHeadlineLink className="navItem" href="/settings/device">
            <h4 className="heading">Gerät</h4>
        </SecondaryHeadlineLink>
        <SecondaryHeadlineLink className="navItem" href="/settings/profile">
            <h4 className="heading">Profil</h4>
        </SecondaryHeadlineLink>
    </nav>
)
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Container size="small">
            <Panel className="settingsPanel">
                <SettingsNav />
                {children}
            </Panel>
        </Container>
    )
}
export { SettingsLayout }
