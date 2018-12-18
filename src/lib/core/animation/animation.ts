export enum AnimationCurves {
    StandardCurve = 'cubic-bezier(0.4,0.0,0.2,1)',
    DecelerationCurve = 'cubic-bezier(0.0,0.0,0.2,1)',
    AccelerationCurve = 'cubic-bezier(0.4,0.0,1,1)',
    SharpCurve = 'cubic-bezier(0.4,0.0,0.6,1)'
}

/** @docs-private */
export enum AnimationDurations {
    Complex = '375ms',
    Entering = '225ms',
    Exiting = '195ms'
}
