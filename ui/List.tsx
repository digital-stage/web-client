import React from 'react'

export interface KIND {
    default: '',
    primary: 'primary',
}

const ListItem = ({
                      children,
                      selected,
                      onSelect,
                  }: {
    children: React.ReactNode,
    selected?: boolean
    onSelect?: () => void
}) => {
    return (
        <li className={`entry ${selected ? "selected" : ''}`} onClick={onSelect}>
            {children}
        </li>
    )
}

const List = ({children, kind}: {
    children: React.ReactNode,
    kind?: KIND[keyof KIND]
}) => (
    <ul className={`list ${kind || ''}`}>{children}</ul>
)
export {ListItem}
export default List
