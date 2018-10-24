import {
    createFakeEvent,
    createKeyboardEvent,
    createMouseEvent,
    createTouchEvent
} from './event-objects';


/** Utility to dispatch any event on a Node. */
export function dispatchEvent(node: Node | Window, event: Event): Event {
    node.dispatchEvent(event);

    return event;
}

/** Shorthand to dispatch a fake event on a specified node. */
// tslint:disable-next-line:no-reserved-keywords
export function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event {
    return dispatchEvent(node, createFakeEvent(type, canBubble));
}

/** Shorthand to dispatch a keyboard event with a specified key code. */
// tslint:disable-next-line:no-reserved-keywords
export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number, target?: Element,
                                      shiftKey = false, ctrlKey = false, altKey = false):
    KeyboardEvent {
    const event =  createKeyboardEvent(type, keyCode, target, undefined, shiftKey, ctrlKey, altKey);

    return dispatchEvent(node, event) as KeyboardEvent;
}

/** Shorthand to dispatch a mouse event on the specified coordinates. */
// tslint:disable-next-line:no-reserved-keywords
export function dispatchMouseEvent(node: Node, type: string, x = 0, y = 0,
                                   event = createMouseEvent(type, x, y)): MouseEvent {
    return dispatchEvent(node, event) as MouseEvent;
}

/** Shorthand to dispatch a touch event on the specified coordinates. */
// tslint:disable-next-line:no-reserved-keywords
export function dispatchTouchEvent(node: Node, type: string, x = 0, y = 0) {
    return dispatchEvent(node, createTouchEvent(type, x, y));
}
