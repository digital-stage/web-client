/* eslint-disable react/jsx-props-no-spreading,react/button-has-type */
import React from 'react'

const PrimaryHeadlineButton = (
    props: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > & {
        toggled?: boolean
    }
): JSX.Element => {
    const { className, toggled, ...other } = props
    return (
        <button
            className={`headline-button primary ${toggled ? 'active' : ''} ${
                className || ''
            } ${other}`}
            {...other}
        />
    )
}
PrimaryHeadlineButton.defaultProps = {
    toggled: undefined,
}

const SecondaryHeadlineButton = (
    props: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > & {
        toggled?: boolean
    }
): JSX.Element => {
    const { className, toggled, ...other } = props
    return (
        <button
            className={`headline-button secondary ${toggled ? 'active' : ''} ${
                className || ''
            } ${other}`}
            {...other}
        />
    )
}
SecondaryHeadlineButton.defaultProps = {
    toggled: undefined,
}

export { PrimaryHeadlineButton, SecondaryHeadlineButton }

export default PrimaryHeadlineButton
