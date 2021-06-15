/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useState } from 'react'
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io'
import styles from './Collapse.module.css'
import Button from './Button'

const Collapse = ({
    initialCollapsed,
    children,
    title,
    icon,
    actions,
    collapsed,
    onChange,
}: {
    children: React.ReactNode
    title: React.ReactNode
    icon?: React.ReactNode
    actions?: React.ReactNode
    initialCollapsed?: boolean
    collapsed?: boolean
    onChange?: (collapsed: boolean) => void
}) => {
    const [intCollapsed, setIntCollapsed] = useState<boolean>(initialCollapsed)
    useEffect(() => {
        if (collapsed !== undefined) {
            setIntCollapsed(collapsed)
        }
    }, [collapsed])
    const toggleCollapsed = useCallback(() => {
        if (onChange) {
            onChange(!intCollapsed)
        }
        if (collapsed === undefined) {
            setIntCollapsed(!intCollapsed)
        }
    }, [intCollapsed])
    return (
        <div className={styles.wrapper}>
            <div className={styles.spacer}>
                <div className={styles.row}>
                    {icon && (
                        <div className={styles.icon} onClick={toggleCollapsed}>
                            {icon}
                        </div>
                    )}
                    <div className={styles.title} onClick={toggleCollapsed}>
                        {title}
                    </div>
                    {actions && <div className={styles.actions}>{actions}</div>}
                    <div className={styles.toggle} onClick={toggleCollapsed}>
                        <Button round size="small">
                            {intCollapsed ? (
                                <IoIosArrowDown size={18} />
                            ) : (
                                <IoIosArrowBack size={18} />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
            <div className={`${styles.children} ${intCollapsed ? styles.collapsed : ''}`}>
                {children}
            </div>
            <hr className={styles.hr} />
        </div>
    )
}
Collapse.defaultProps = {
    initialCollapsed: undefined,
    icon: undefined,
    actions: undefined,
    collapsed: undefined,
    onChange: undefined,
}
export default Collapse
