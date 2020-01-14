// tslint:disable:no-magic-numbers
import { stepDown, stepUp } from './index';


describe('stepperUtils', () => {
    it('stepUp common', () => {
        expect(stepUp(10, 100, -100, 1)).toBe(11);
    });

    it('stepDown common', () => {
        expect(stepDown(10, 100, -100, 1)).toBe(9);
    });

    it('stepUp over step', () => {
        expect(stepUp(99, 100, -100, 5)).toBe(100);
    });

    it('stepDown over step', () => {
        expect(stepDown(-99, 100, -100, 5)).toBe(-100);
    });


    it('stepUp no max', () => {
        expect(stepUp(99, Infinity, -100, 5)).toBe(104);
    });

    it('stepDown no min', () => {
        expect(stepDown(-99, 100, -Infinity, 5)).toBe(-104);
    });

    it('stepUp no min', () => {
        expect(stepUp(0, 100, -Infinity, 5)).toBe(5);
    });

    it('stepDown no max', () => {
        expect(stepDown(0, Infinity, -100, 5)).toBe(-5);
    });
});
