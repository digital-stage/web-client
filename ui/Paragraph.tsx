export interface KIND {
    default: '',
    micro: 'micro'
}

const Paragraph = ({
                       kind,
                       className,
                       ...props
                   }: {
                       kind?: KIND[keyof KIND]
                   } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
) => <p className={`${kind || ''} ${className || ''}`} {...props}/>

export default Paragraph