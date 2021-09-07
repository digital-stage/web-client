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

const List = ({ kind, className, ...props }: { kind?: KIND[keyof KIND] } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
    <ul className={`list ${kind || ''} ${className || ''}`} {...props}/>
)
export { ListItem }
export { List }
