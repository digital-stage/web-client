/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import styles from './Block.module.scss'

interface ALIGNMENT {
    start: 'start'
    center: 'center'
    end: 'end'
    stretch: 'stretch'
}

interface JUSTIFICATION {
    start: 'start'
    center: 'center'
    end: 'end'
    stretch: 'stretch'
}

interface BEHAVIOR {
    fixed: 'fixed'
    fluid: 'fluid'
}

interface WIDTH {
    full: 'full'
    auto: 'auto'
}

interface HEIGHT {
    full: 'full'
    auto: 'auto'
}

function getResponsiveClasses<T>(
    value: T | T[],
    prefix: string,
    postfix: string = '',
    minValue?: T,
    maxValue?: T
) {
    if (Array.isArray(value)) {
        return value
            .map((v, index) => {
                if (minValue && minValue > v)
                    throw new Error(`Invalid value '${v}', use a value above ${minValue}`)
                if (maxValue && maxValue < v)
                    throw new Error(`Invalid value '${v}', use a value below ${maxValue}`)
                if (index === 0) {
                    return styles[`${prefix}-${v}${postfix}`]
                }
                return styles[`${prefix}-${index}-${v}${postfix}`]
            })
            .join(' ')
    }
    if (minValue && minValue > value)
        throw new Error(`Invalid value '${value}', use a value above ${minValue}`)
    if (maxValue && maxValue < value)
        throw new Error(`Invalid value '${value}', use a value below ${maxValue}`)
    return `${styles[`${prefix}-${value}${postfix}`]}`
}

const Block = ({
    children,
    width,
    height,
    align,
    justify,
    behavior,
    vertical,
    padding,
    paddingTop,
    paddingLeft,
    paddingBottom,
    paddingRight,
    flexGrow,
    className,
    ...other
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    children: React.ReactNode
    width?: WIDTH[keyof WIDTH] | number | number[]
    height?: HEIGHT[keyof HEIGHT]
    align?: ALIGNMENT[keyof ALIGNMENT]
    justify?: JUSTIFICATION[keyof JUSTIFICATION]
    behavior?: BEHAVIOR[keyof BEHAVIOR]
    vertical?: boolean
    padding?: number | number[]
    paddingTop?: number | number[]
    paddingLeft?: number | number[]
    paddingBottom?: number | number[]
    paddingRight?: number | number[]
    flexGrow?: number | number[]
}): JSX.Element => {
    let classes = ''
    if (width) {
        classes += getResponsiveClasses<number | string>(width, 'w', '', 0, 12)
    }
    if (height) {
        classes += getResponsiveClasses<number | string>(height, 'h', '', 0, 12)
    }
    if (align) {
        classes += ` ${getResponsiveClasses<string>(align, 'align')}`
    }
    if (justify) {
        classes += ` ${getResponsiveClasses<string>(justify, 'justify')}`
    }
    if (behavior) {
        classes += ` ${styles[behavior]}`
    }
    if (vertical) {
        classes += ` ${styles.column}`
    }
    if (padding) {
        classes += ` ${getResponsiveClasses<number>(padding, 'p')}`
    }
    if (paddingTop) {
        classes += ` ${getResponsiveClasses<number>(paddingTop, 'pt')}`
    }
    if (paddingLeft) {
        classes += ` ${getResponsiveClasses<number>(paddingLeft, 'pl')}`
    }
    if (paddingBottom) {
        classes += ` ${getResponsiveClasses<number>(paddingBottom, 'pb')}`
    }
    if (paddingRight) {
        classes += ` ${getResponsiveClasses<number>(paddingRight, 'pr')}`
    }
    if (flexGrow) {
        classes += ` ${getResponsiveClasses<number>(flexGrow, 'grow', '', 0, 2)}`
    }

    return (
        <div className={`${styles.block} ${classes} ${className || ''}`} {...other}>
            {children}
        </div>
    )
}
Block.defaultProps = {
    width: undefined,
    height: undefined,
    align: undefined,
    justify: undefined,
    behavior: undefined,
    vertical: undefined,
    padding: undefined,
    paddingTop: undefined,
    paddingLeft: undefined,
    paddingBottom: undefined,
    paddingRight: undefined,
    flexGrow: undefined,
}
const Row = ({ children, padding }: { children: React.ReactNode; padding?: number | number[] }) => {
    let classes = ''
    if (padding) {
        classes += ` ${getResponsiveClasses<number>(padding, 'p')}`
    }
    return (
        <div className={`${styles.container} ${classes}`}>
            <div className={`${styles.row} ${classes}`}>{children}</div>
        </div>
    )
}
Row.defaultProps = {
    padding: undefined,
}
export { Row }
export type { ALIGNMENT, BEHAVIOR, JUSTIFICATION, WIDTH, HEIGHT }
export default Block
