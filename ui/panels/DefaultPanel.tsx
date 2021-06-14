import React from 'react'
import classes from './DefaultPanel.module.css'

const DefaultPanel = ({ children }: { children: React.ReactNode }) => {
    return <div className={classes.panel}>{children}</div>
}
export default DefaultPanel
