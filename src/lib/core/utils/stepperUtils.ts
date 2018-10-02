
function sanitizeNumber(value: number): number | null {
    return !isFinite(value) || isNaN(value)
        ? null
        : value;
}

function getPrecision(value: number): number {
    const arr = value.toString().split('.');

    return arr.length === 1
        ? 1
        // tslint:disable-next-line:no-magic-numbers
        :  Math.pow(10, arr[1].length);
}

function add(value1: number, value2: number) {
    const precision = Math.max(getPrecision(value1), getPrecision(value2));

    const res = (value1 * precision + value2 * precision) / precision;

    return sanitizeNumber(res);
}

export const stepUp = (value: number | null,
                       max: number,
                       min: number,
                       step: number
): number | null => {
    let res;

    if (value === null) {
        res = add(min, step);

        return res === null ? null : Math.min(res, max);
    }

    res = add(value, step);

    return res === null ? null : Math.max(Math.min(res, max), min);
};

export const stepDown = (value: number | null,
                         max: number,
                         min: number,
                         step: number
): number | null => {
    let res;

    if (value === null) {
        res = add(max, -step);

        return res === null ? null : Math.max(res, min);
    }

    res = add(value, -step);

    return res === null ? null : Math.min(Math.max(res, min), max);
};
