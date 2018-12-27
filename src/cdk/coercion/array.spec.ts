import { coerceArray } from './array';


describe('coerceArray', () => {

    it('should wrap a string in an array', () => {
        const stringVal = 'just a string';
        expect(coerceArray(stringVal)).toEqual([stringVal]);
    });

    it('should wrap a number in an array', () => {
        const numberVal = 42;
        expect(coerceArray(numberVal)).toEqual([numberVal]);
    });

    it('should wrap an object in an array', () => {
        const objectVal = {something: 'clever'};
        expect(coerceArray(objectVal)).toEqual([objectVal]);
    });

    it('should wrap a null vall in an array', () => {
        const nullVal = null;
        expect(coerceArray(nullVal)).toEqual([nullVal]);
    });

    it('should wrap an undefined value in an array', () => {
        const undefinedVal = undefined;
        expect(coerceArray(undefinedVal)).toEqual([undefinedVal]);
    });

    it('should not wrap an array in an array', () => {
        const arrayVal = [1, 2, 3]; // tslint:disable-line
        expect(coerceArray(arrayVal)).toBe(arrayVal);
    });

});
