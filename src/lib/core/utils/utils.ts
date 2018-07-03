
export function isBoolean(val: any): val is boolean { return typeof val === 'boolean'; }

export function toBoolean(value: any): boolean {
    return value != null && `${value}` !== 'false';
}

export function isNotNil(value: any): boolean {
    return value !== 'undefined' && value !== null;
}

export function debounce(f: (...args) => any, ms: number) {
    let timer: any; // at-loader expects Timer type here but there should be number by spec

    return  (...args) => {
        const onComplete = () => {
            f.apply(this, args);
            timer = null;
        };

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}
