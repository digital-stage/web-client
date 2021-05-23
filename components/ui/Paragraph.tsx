import React from 'react'
import styles from './Paragraph.module.css'

interface KIND {
    default: 'default'
    micro: 'micro'
}

const Paragraph = ({
    children,
    className,
    kind,
    ...other
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & {
    kind?: KIND[keyof KIND]
}) => {
    return (
        <p
            className={`${styles.p} ${kind ? styles[kind] : styles.default} ${className || ''}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...other}
        >
            {children}
        </p>
    )
}
Paragraph.defaultProps = {
    kind: undefined,
}
export type { KIND }
export default Paragraph
