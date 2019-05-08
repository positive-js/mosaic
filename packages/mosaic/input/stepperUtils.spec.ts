// tslint:disable:no-magic-numbers
import { stepDown, stepUp } from './index';


describe('stepperUtils', () => {
    it('stepUp common', () => {
        expect(stepUp(10, 100, -100, 1)).toBe(11);
    });

    it('stepDown common', () => {
        expect(stepDown(10, 100, -100, 1)).toBe(9);
    });


    it('stepUp empty', () => {
        expect(stepUp(null, 100, -100, 1)).toBe(-99);
    });

    it('stepDown empty', () => {
        expect(stepDown(null, 100, -100, 1)).toBe(99);
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
        expect(stepUp(null, 100, -Infinity, 5)).toBe(null);
    });

    it('stepDown no max', () => {
        expect(stepDown(null, Infinity, -100, 5)).toBe(null);
    });
});
