import React from "react";

const Background = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  insideStage?: boolean;
}) => {
  const {insideStage, ...other} = props;
  return (
    <>
      <div {...other}/>
      <style jsx>{`
        div {
          display: block;
          position: relative;
          background: transparent linear-gradient(221deg, #F20544 0%, #F00544 2%, #F20544 2%, #F20544 10%, #721542 50%, #012340 100%) no-repeat fixed 0 0;
          width: 100%;
          min-height: 100%
          flex-direction: column;
          z-index: 0;
        }
        div::before {
          display: block;
          position: absolute;
          content: "";
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: transparent linear-gradient(221deg, #343434 0%, #141414 100%) 0 0 no-repeat padding-box;
          transition-property: opacity;
          transition-duration: 200ms;
          transition-timing-function: cubic-bezier(0.2, 0.8, 0.4, 1);
          z-index: -1;
          opacity: ${insideStage ? 0 : 1}
        }
      `}</style>
    </>
  );
}

export default Background;
