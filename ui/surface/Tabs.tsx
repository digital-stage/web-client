import React, {useState} from "react";

const Tabs = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  color?: "primary" | "secondary"
}): JSX.Element => {
  const {children, className, color, ...other} = props;
  const [active, setActive] = useState<number>(0);

  return (
    <div className={`wrapper ${className}`} {...other}>
      <div className="header">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return;
          const {title} = child.props
          const isActive = active === index;
          let className = "tab";
          if (isActive) {
            className += " active";
          }
          return (
            <div
              onClick={!isActive ? () => setActive(index) : undefined}
              className={className}
            >
              {title}
            </div>
          );
        })}
      </div>
      {React.Children.map(children, (child, index) => index === active ? child : undefined)}

      <style jsx>{`
        .wrapper {
          width: 100%;
        }
        .header {
          display: flex;
          width: 100%;
          padding-bottom: 12px;
        }
        .tab {
          padding: 10px 12px;
          color: var(---muted, #808080);
          font-weight: bold;
          border-bottom-width: 1px;
          border-bottom-style: solid;
          border-color: transparent;
          transition-duration: 200ms;
          transition-property: color, border-color;
          transition-timing-function: cubic-bezier(0, 0, 1, 1);
        }
        .tab:not(.active) {
          cursor: pointer;
        }
        .tab:not(.active):hover {
          color: var(---text, #F4F4F4);
        }
        .tab.active {
          color: var(---text, #F4F4F4);
          border-color: var(---tab-border-${color || "primary"}, #5779D9);
        }
        .tab.active:hover {
        }
      `}</style>
    </div>
  )
};

export default Tabs;
