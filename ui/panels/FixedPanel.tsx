import React from 'react'
import classes from './FixedPanel.module.css'

const FixedPanel = ({ children }: { children: React.ReactNode }) => {
    return <div className={classes.panel}>{children}</div>
}
export default FixedPanel
