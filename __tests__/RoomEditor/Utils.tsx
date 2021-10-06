import {calculateActualSize, rotatePointAroundOrigin} from "../../components/room/RoomEditorV2/RoomEditor/utils";

describe('RoomEditor Utils', () => {
    it('Calculation of actual size', () => {
        expect(calculateActualSize(2000, 2500, -720).width).toBe(2000)
        expect(calculateActualSize(2000, 2500, -450).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, -405).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, -360).width).toBe(2000)
        expect(calculateActualSize(2000, 2500, -270).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, -225).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, -180).width).toBe(2000)
        expect(calculateActualSize(2000, 2500, -135).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, -90).width).toBe(2500)
        expect(calculateActualSize(2000, 2500, -45).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, 0).width).toBe(2000)
        expect(calculateActualSize(2000, 2500, 45).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, 90).width).toBe(2500)
        expect(calculateActualSize(2000, 2500, 135).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, 180).width).toBe(2000)
        expect(calculateActualSize(2000, 2500, 225).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, 270).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, 360).width).toBe(2000)
        expect(calculateActualSize(2000, 2500, 405).width).toBeGreaterThanOrEqual(2000)
        expect(calculateActualSize(2000, 2500, 450).width).toBe(2500)
        expect(calculateActualSize(2000, 2500, 720).width).toBe(2000)
    })

    it('Point Rotation', () => {
        expect(rotatePointAroundOrigin(10, 10, -360).x).toBe(10)
        expect(rotatePointAroundOrigin(10, 10, 0).x).toBe(10)
        expect(rotatePointAroundOrigin(10, 10, 180).x).toBe(-10)
        expect(rotatePointAroundOrigin(10, 10, 180).y).toBe(-10)
        expect(rotatePointAroundOrigin(23, 18.3, 180).x).toBe(-23)
        expect(Math.round(rotatePointAroundOrigin(23.4, 18.3, 180).x)).toBe(-23)
        expect(Math.round(rotatePointAroundOrigin(23.45, 18.3, 180).x)).toBe(-23)
        expect(Math.round(rotatePointAroundOrigin(23.45, 18.3, 180).y)).toBe(-18)
        expect(rotatePointAroundOrigin(10, 10, 360).x).toBe(10)
        expect(rotatePointAroundOrigin(21, 21, 360).x).toBe(21)
        expect(rotatePointAroundOrigin(-21, 21, 360).x).toBe(-21)
    })
})