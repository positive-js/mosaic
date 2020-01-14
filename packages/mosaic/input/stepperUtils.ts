function getPrecision(value: number): number {
    const arr = value.toString().split('.');

    return arr.length === 1
        ? 1
        // tslint:disable-next-line:no-magic-numbers
        :  Math.pow(10, arr[1].length);
}

function add(value1: number, value2: number) {
    const precision = Math.max(getPrecision(value1), getPrecision(value2));

    return (value1 * precision + value2 * precision) / precision;
}

export const stepUp = (value: number, max: number, min: number, step: number): number => {
    return Math.max(Math.min(add(value, step), max), min);
};

export const stepDown = (value: number, max: number, min: number, step: number): number => {
    return Math.min(Math.max(add(value, -step), min), max);
};
