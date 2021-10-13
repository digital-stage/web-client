import {DependencyList, useEffect, useRef} from "react";

// Reusable component that also takes dependencies
const useAnimationFrame = (cb: (params: { time: number, delta: number }) => unknown, deps?: DependencyList) => {
    const frame = useRef<number>();
    const last = useRef<number>(performance.now());
    const init = useRef<number>(performance.now());

    const animate = () => {
        const now = performance.now();
        const time = (now - init.current) / 1000;
        const delta = (now - last.current) / 1000;
        // In seconds ~> you can do ms or anything in userland
        cb({time, delta});
        last.current = now;
        frame.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        frame.current = requestAnimationFrame(animate);
        return () => {
            if (frame.current)
                cancelAnimationFrame(frame.current)
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps); // Make sure to change it if the deps change
};

export {useAnimationFrame}