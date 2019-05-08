import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'toCssUnit'
})
export class CssUnitPipe implements PipeTransform {
    transform(value: number | string, defaultUnit: string = 'px'): string {
        const formatted = +value;

        return isNaN(formatted) ? `${value}` : `${formatted}${defaultUnit}`;
    }
}
