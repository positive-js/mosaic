export enum TimeParts {
    hours,
    minutes,
    seconds
}

export enum TimeFormats {
    HHmmss = 'HH:mm:ss',
    HHmm = 'HH:mm'
}

export const DEFAULT_TIME_FORMAT: TimeFormats = TimeFormats.HHmm;

// TODO Move it to common CDK
export const ARROW_UP_KEYCODE: string = 'ArrowUp';
export const ARROW_DOWN_KEYCODE: string = 'ArrowDown';
export const ARROW_LEFT_KEYCODE: string = 'ArrowLeft';
export const ARROW_RIGHT_KEYCODE: string = 'ArrowRight';
