export function getBaseLog(x: number, y: number): number {
  return Math.log(y) / Math.log(x);
}

/***
 * Calulcate the db measurement with an value between 0 and 1
 * @param value, float value between 0 and 1
 */
export const convertRangeToDbMeasure = (value: number): number => {
  if (value > 0) {
    return 20 * Math.log10(value);
  }
  return Number.NEGATIVE_INFINITY;
};

export const convertDbMeasureToRange = (value: number): number => {
  return Math.pow(value, 10) / 20;
};

export const formatDbMeasure = (value: number, unit?: boolean): string => {
  if (value > Number.NEGATIVE_INFINITY) {
    let str: string = (Math.round(value * 10) / 10).toString();
    if (value > 0) str = '+' + str;
    if (unit) str += 'db';
    return str;
  }
  return '-∞';
};
