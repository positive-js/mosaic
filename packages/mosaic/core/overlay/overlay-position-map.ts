import { ConnectionPositionPair } from '@angular/cdk/overlay';


export const POSITION_MAP: { [key: string]: ConnectionPositionPair } = {
    top: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
    },
    topCenter: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
    },
    topLeft: {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
    },
    topRight: {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom'
    },
    right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center'
    },
    rightTop: {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top'
    },
    rightBottom: {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'bottom'
    },
    bottom: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top'
    },
    bottomCenter: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top'
    },
    bottomLeft: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
    },
    bottomRight: {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
    },
    left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center'
    },
    leftTop: {
        originX: 'start',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'top'
    },
    leftBottom: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'bottom'
    }
};

export const DEFAULT_4_POSITIONS = objectValues([
    POSITION_MAP.top, POSITION_MAP.right, POSITION_MAP.bottom, POSITION_MAP.left
]);

export const EXTENDED_OVERLAY_POSITIONS = objectValues([
    POSITION_MAP.top, POSITION_MAP.topLeft, POSITION_MAP.topRight, POSITION_MAP.right, POSITION_MAP.rightTop,
    POSITION_MAP.rightBottom, POSITION_MAP.bottom, POSITION_MAP.bottomLeft, POSITION_MAP.bottomRight,
    POSITION_MAP.left, POSITION_MAP.leftTop, POSITION_MAP.leftBottom
]);

export const TOP_POSITION_PRIORITY = objectValues([
    POSITION_MAP.top,
    POSITION_MAP.bottom,
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftBottom,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight
]);

export const BOTTOM_POSITION_PRIORITY = objectValues([
    POSITION_MAP.bottom,
    POSITION_MAP.top,
    POSITION_MAP.topLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftBottom
]);

export const RIGHT_POSITION_PRIORITY = objectValues([
    POSITION_MAP.right,
    POSITION_MAP.left,
    POSITION_MAP.leftTop,
    POSITION_MAP.leftBottom,
    POSITION_MAP.top,
    POSITION_MAP.bottom
]);

export const LEFT_POSITION_PRIORITY = objectValues([
    POSITION_MAP.left,
    POSITION_MAP.right,
    POSITION_MAP.rightTop,
    POSITION_MAP.rightBottom,
    POSITION_MAP.top,
    POSITION_MAP.bottom
]);

export const RIGHT_TOP_POSITION_PRIORITY = objectValues([
    POSITION_MAP.rightTop,
    POSITION_MAP.leftTop,
    POSITION_MAP.left,
    POSITION_MAP.leftBottom,
    POSITION_MAP.topLeft,
    POSITION_MAP.bottomLeft
]);

export const RIGHT_BOTTOM_POSITION_PRIORITY = objectValues([
    POSITION_MAP.rightBottom,
    POSITION_MAP.leftBottom,
    POSITION_MAP.left,
    POSITION_MAP.leftTop,
    POSITION_MAP.topLeft,
    POSITION_MAP.bottomLeft
]);

export const LEFT_TOP_POSITION_PRIORITY = objectValues([
    POSITION_MAP.leftTop,
    POSITION_MAP.rightTop,
    POSITION_MAP.right,
    POSITION_MAP.rightBottom,
    POSITION_MAP.topRight,
    POSITION_MAP.bottomRight
]);

export const LEFT_BOTTOM_POSITION_PRIORITY = objectValues([
    POSITION_MAP.leftBottom,
    POSITION_MAP.rightBottom,
    POSITION_MAP.right,
    POSITION_MAP.rightTop,
    POSITION_MAP.topRight,
    POSITION_MAP.bottomRight
]);

export const TOP_LEFT_POSITION_PRIORITY = objectValues([
    POSITION_MAP.topLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottom,
    POSITION_MAP.bottomRight,
    POSITION_MAP.leftBottom,
    POSITION_MAP.rightBottom
]);

export const TOP_RIGHT_POSITION_PRIORITY = objectValues([
    POSITION_MAP.topRight,
    POSITION_MAP.topLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.bottom,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.leftBottom,
    POSITION_MAP.rightBottom
]);

export const BOTTOM_RIGHT_POSITION_PRIORITY = objectValues([
    POSITION_MAP.bottomRight,
    POSITION_MAP.bottomLeft,
    POSITION_MAP.topRight,
    POSITION_MAP.top,
    POSITION_MAP.topLeft,
    POSITION_MAP.leftTop,
    POSITION_MAP.rightTop
]);

export const BOTTOM_LEFT_POSITION_PRIORITY = objectValues([
    POSITION_MAP.bottomLeft,
    POSITION_MAP.bottomRight,
    POSITION_MAP.topLeft,
    POSITION_MAP.top,
    POSITION_MAP.topRight,
    POSITION_MAP.rightTop,
    POSITION_MAP.leftTop
]);

export const POSITION_PRIORITY_STRATEGY = {
    top: TOP_POSITION_PRIORITY,
    topLeft: TOP_LEFT_POSITION_PRIORITY,
    topRight: TOP_RIGHT_POSITION_PRIORITY,
    bottom: BOTTOM_POSITION_PRIORITY,
    bottomLeft: BOTTOM_LEFT_POSITION_PRIORITY,
    bottomRight: BOTTOM_RIGHT_POSITION_PRIORITY,
    left: LEFT_POSITION_PRIORITY,
    leftTop: LEFT_TOP_POSITION_PRIORITY,
    leftBottom: LEFT_BOTTOM_POSITION_PRIORITY,
    right: RIGHT_POSITION_PRIORITY,
    rightTop: RIGHT_TOP_POSITION_PRIORITY,
    rightBottom: RIGHT_BOTTOM_POSITION_PRIORITY
};

export const POSITION_TO_CSS_MAP: {[key: string]: string} = {
    top: 'top',
    topLeft: 'top-left',
    topRight: 'top-right',
    right: 'right',
    rightTop: 'right-top',
    rightBottom: 'right-bottom',
    left: 'left',
    leftTop: 'left-top',
    leftBottom: 'left-bottom',
    bottom: 'bottom',
    bottomLeft: 'bottom-left',
    bottomRight: 'bottom-right'
};

export const DEFAULT_4_POSITIONS_TO_CSS_MAP: {[key: string]: string} = {
    top: 'top',
    bottom: 'bottom',
    right: 'right',
    left: 'left'
};

function arrayMap<T, S>(array: T[], iteratee: (item: T, index: number, arr: T[]) => S): S[] {
    let index = -1;
    const length = array == null ? 0 : array.length;
    const result = Array(length);

    while (++index < length) {
        result[ index ] = iteratee(array[ index ], index, array);
    }

    return result;
}
function baseValues<T>(object: { [key: string]: T } | T[], props: string[]): T[] {
    return arrayMap(props,  (key) => {
        return object[ key ];
    });
}
function objectValues<T>(object: { [key: string]: T } | T[]): T[] {
    return object == null ? [] : baseValues(object, Object.keys(object));
}
