
export function isBoolean(val: any): val is boolean { return typeof val === 'boolean'; }

export function toBoolean(value: any): boolean {
    return value != null && `${value}` !== 'false';
}
