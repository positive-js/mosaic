import {ElementRef, Renderer} from '@angular/core';

export class BaseElement {

    _elementRef: ElementRef;

    _renderer: Renderer;

    _componentName: string;

    _id: string;

    constructor(elementRef: ElementRef, renderer: Renderer, componentName?: string) {
        this._elementRef = elementRef;
        this._renderer = renderer;
        this._componentName = componentName;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    setElementClass(className: string, isAdd: boolean) {
        this._renderer.setElementClass(this._elementRef.nativeElement, className, isAdd);
    }

    setElementAttribute(attributeName: string, attributeValue: any) {
        this._renderer.setElementAttribute(this._elementRef.nativeElement, attributeName, attributeValue);
    }

    setElementStyle(property: string, value: string) {
        this._renderer.setElementStyle(this._elementRef.nativeElement, property, value);
    }

    _setComponentName() {
        this.setElementClass(this._componentName, true);
    }

    getElementRef(): ElementRef {
        return this._elementRef;
    }

    getNativeElement(): any {
        return this._elementRef.nativeElement;
    }
}
