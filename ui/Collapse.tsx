/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useState } from 'react'

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
    const [intCollapsed, setIntCollapsed] = useState<boolean>(initialCollapsed || false)
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
    }, [collapsed, intCollapsed, onChange])
    return (
        <div className="collapse">
            <div className="spacer">
                <div className="row">
                    {icon && (
                        <div className="icon" onClick={toggleCollapsed}>
                            {icon}
                        </div>
                    )}
                    <div className="title" onClick={toggleCollapsed}>
                        {title}
                    </div>
                    {actions && <div className="actions">{actions}</div>}
                    <div className="toggle" onClick={toggleCollapsed}>
                        <button className="button round small" type="button">
                            {intCollapsed ? (
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 512 512"
                                    height="18"
                                    width="18"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
                                </svg>
                            ) : (
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 512 512"
                                    height="18"
                                    width="18"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className={`children ${intCollapsed ? 'collapsed' : ''}`}>{children}</div>
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
export { Collapse }
