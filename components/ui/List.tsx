import React from 'react'
import styles from './List.module.css'

const ListItem = ({
    icon,
    title,
    actions,
    children,
}: {
    icon?: React.ReactNode
    title: string
    actions?: React.ReactNode
    children?: React.ReactNode
}) => {
    return (
        <li className={styles.listItem}>
            <div className={styles.listItemInner}>
                {icon && <div className={styles.icon}>{icon}</div>}
                <h4 className={styles.title}>{title}</h4>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
            {children && <div className={styles.children}>{children}</div>}
        </li>
    )
}
ListItem.defaultProps = {
    icon: undefined,
    actions: undefined,
    children: undefined,
}

const List = ({ children }: { children: React.ReactNode }) => {
    return <ul className={styles.list}>{children}</ul>
}
export { ListItem }
export default List
