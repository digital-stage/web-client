import React, {ReactElement} from 'react'

const TextSwitch = ({
    children,
    value,
    onSelect,
    className,
}: {
    className?: string
    value: string
    onSelect?: (key: React.Key) => any
    children: Array<ReactElement<{ key: React.Key }>>
}) => {
    return (
        <div className={`text-switch ${className || ''}`}>
            {Array.isArray(children)
                ? children.map((child, i) => {
                      if (!child.key) throw new Error('No key specified')
                      return (
                          <div
                              className={`option ${child.key === value ? 'selected' : ''}`}
                              key={child.key}
                              onClick={onSelect ? () => {
                                  if (child.key) onSelect(child.key)
                              } : undefined}
                          >
                              {child}
                          </div>
                      )
                  })
                : null}
        </div>
    )
}
export { TextSwitch }
