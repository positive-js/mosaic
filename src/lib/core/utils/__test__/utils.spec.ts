// tslint:disable:no-magic-numbers
import { toBoolean } from '../utils';


describe('[Core]::utils', () => {
    it('should work for null values', () => {
        expect(toBoolean(null)).toBe(false);
        expect(toBoolean(undefined)).toBe(false);
    });

    it('should work with string values', () => {
        expect(toBoolean('true')).toBe(true);
        expect(toBoolean('false')).toBe(false);
        expect(toBoolean('')).toBe(true);
        expect(toBoolean('blablabla')).toBe(true);
    });
});
