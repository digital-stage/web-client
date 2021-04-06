const Row = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  align?: "center" | "flex-start" | "flex-end" | "space-between"
}) => {
  const {align, ...other} = props;

  return <>
    <div className="row" {...other}/>
    <style jsx>{`
    .row {
      display: flex;
      width: 100%;
      flex-direction: row;
      ${align ? "align-items: " + align : ""}
    }
    `}</style>
  </>
};
export default Row;