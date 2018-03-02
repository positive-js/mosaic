import { ElementRef } from '@angular/core';

import { mixinColor } from './color';


describe('MixinColor', () => {

    it('should augment an existing class with a color property', () => {
        const classWithColor = mixinColor(TestClass);
        const instance = new classWithColor();

        expect(instance.color)
            .toBeFalsy('Expected the mixed-into class to have a color property');

        instance.color = 'accent';

        expect(instance.color)
            .toBe('accent', 'Expected the mixed-into class to have an updated color property');
    });

    it('should remove old color classes if new color is set', () => {
        const classWithColor = mixinColor(TestClass);
        const instance = new classWithColor();

        expect(instance.testElement.classList.length)
            .toBe(0, 'Expected the element to not have any classes at initialization');

        instance.color = 'primary';

        expect(instance.testElement.classList)
            .toContain('mc-primary', 'Expected the element to have the "mc-primary" class set');

        instance.color = 'accent';

        expect(instance.testElement.classList)
            .not.toContain('mc-primary', 'Expected the element to no longer have "mc-primary" set.');
        expect(instance.testElement.classList)
            .toContain('mc-accent', 'Expected the element to have the "mc-accent" class set');
    });

    it('should allow having no color set', () => {
        const classWithColor = mixinColor(TestClass);
        const instance = new classWithColor();

        expect(instance.testElement.classList.length)
            .toBe(0, 'Expected the element to not have any classes at initialization');

        instance.color = 'primary';

        expect(instance.testElement.classList)
            .toContain('mc-primary', 'Expected the element to have the "mc-primary" class set');

        instance.color = undefined;

        expect(instance.testElement.classList.length)
            .toBe(0, 'Expected the element to have no color class set.');
    });

    it('should allow having a default color if specified', () => {
        const classWithColor = mixinColor(TestClass, 'accent');
        const instance = new classWithColor();

        expect(instance.testElement.classList)
            .toContain('mc-accent', 'Expected the element to have the "mc-accent" class by default.');

        instance.color = undefined;

        expect(instance.testElement.classList)
            .toContain('mc-accent', 'Expected the default color "mc-accent" to be set.');
    });

});

class TestClass {
    testElement: HTMLElement = document.createElement('div');

    /** Fake instance of an ElementRef. */
    _elementRef = new ElementRef(this.testElement);
}
