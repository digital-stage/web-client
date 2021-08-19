import React from 'react'

export interface KIND {
    default: ''
    primary: 'primary'
}

const ListItem = ({
    className,
    selected,
    onSelect,
    ...props
}: {
    selected?: boolean
    onSelect?: () => void
} & React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => (
    <li
        className={`entry ${selected ? 'selected' : ''} ${className || ''}`}
        onClick={onSelect}
        {...props}
    />
)

const List = ({ children, kind }: { children: React.ReactNode; kind?: KIND[keyof KIND] }) => (
    <ul className={`list ${kind || ''}`}>{children}</ul>
)
export { ListItem }
export default List
