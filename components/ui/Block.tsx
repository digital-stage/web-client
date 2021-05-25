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
    align,
    justify,
    behavior,
    vertical,
    padding,
    paddingTop,
    paddingLeft,
    paddingBottom,
    paddingRight,
    ...other
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    children: React.ReactNode
    width?: 'full' | 'auto' | number | number[]
    align?: ALIGNMENT[keyof ALIGNMENT]
    justify?: JUSTIFICATION[keyof JUSTIFICATION]
    behavior?: BEHAVIOR[keyof BEHAVIOR]
    vertical?: boolean
    padding?: number | number[]
    paddingTop?: number | number[]
    paddingLeft?: number | number[]
    paddingBottom?: number | number[]
    paddingRight?: number | number[]
}): JSX.Element => {
    // let needsFlex = false
    let classes = ''
    if (width) {
        classes += getResponsiveClasses<number | string>(width, 'w', '', 0, 12)
    }
    if (align) {
        classes += ` ${getResponsiveClasses<string>(align, 'align')}`
        // needsFlex = true
    }
    if (justify) {
        classes += ` ${getResponsiveClasses<string>(justify, 'justify')}`
        // needsFlex = true
    }
    if (behavior) {
        classes += ` ${styles[behavior]}`
        // needsFlex = true
    }
    if (vertical) {
        classes += ` ${styles.column}`
        // needsFlex = true
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

    /* if (needsFlex) {
        classes += ` ${styles.flex}`
    } */

    return (
        <div className={`${styles.block} ${classes}`} {...other}>
            {children}
        </div>
    )
}
Block.defaultProps = {
    width: undefined,
    align: undefined,
    justify: undefined,
    behavior: undefined,
    vertical: undefined,
    padding: undefined,
    paddingTop: undefined,
    paddingLeft: undefined,
    paddingBottom: undefined,
    paddingRight: undefined,
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
export { Row }
export type { ALIGNMENT, BEHAVIOR, JUSTIFICATION }
export default Block
