import React from "react";

const Test = () => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [pos, setPos] = React.useState<{ x: number, y: number }>()
    React.useEffect(() => {
        if (ref.current) {
            const currentRef = ref.current
            const onMove = (e: MouseEvent) => {
                const x = e.offsetX - (100 / 2)
                const y = -e.offsetY + (100 / 2)
                setPos({
                    x, y
                })
            }
            currentRef.addEventListener("mousemove", onMove)
            return () => {
                currentRef.removeEventListener("mousemove", onMove)
            }
        }
    }, [])

    return (
        <>
            {pos && (
                <div className="info">
                    x={pos.x}<br/>
                    y={pos.y}
                </div>
            )}
            <div className="room" ref={ref}>
                <div className="center"/>
                <div className="point"/>
            </div>
            <style jsx>{`
                .info {
                    position: absolute;
                    top: 500px;
                    left: 500px;
                }
                .room {
                    position: absolute;
                    top: 200px;
                    left: 200px;
                    width: 100px;
                    height: 100px;
                    border: 1px solid black;
                    transform: rotate(45deg);
                }
                .center {
                    position: absolute;
                    top: calc(50% - 5px);
                    left: calc(50% - 5px);
                    width: 10px;
                    height: 10px;
                    background-color: blue;
                }
                .point {
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 10px;
                    height: 10px;
                    background-color: red;
                }
            `}</style>
        </>
    )
}
export default Test