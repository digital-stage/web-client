export const calculateActualSize = (width: number, height: number, deg: number): {
    width: number,
    height: number
} => {
    const radians = deg * Math.PI / 180
    const cos = Math.abs(Math.cos(radians))
    const sin = Math.abs(Math.sin(radians))
    const actualWidth = sin * height + cos * width
    const actualHeight = sin * width + cos * height
    return {
        width: Math.fround(Math.abs(actualWidth)),
        height: Math.fround(Math.abs(actualHeight))
    }
}
export const rotatePointAroundOrigin = (x: number, y: number, deg: number): { x: number, y: number } => {
    const radians = deg * Math.PI / 180
    const rX = x * Math.cos(radians) - y * Math.sin(radians)
    const rY = y * Math.cos(radians) + x * Math.sin(radians)
    return {
        x: Math.fround(rX),
        y: Math.fround(rY)
    }
}
