import React from 'react'
const Select = ({
    label,
    ...props
}: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    label?: string
}) => {
    return (
        <label className="select">
            {label && <span>{label}</span>}
            <select {...props} />
            <svg
                className="arrow"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z" />
                </g>
            </svg>
        </label>
    )
}
export { Select }
