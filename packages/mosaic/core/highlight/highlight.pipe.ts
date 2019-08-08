import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'mcHighlight' })
export class McHighlightPipePipe implements PipeTransform {
    transform(value: any, args: any): any {
        if (!args) { return value; }

        return value.replace(new RegExp(args, 'gi'), `<mark class="mc-highlight">${args}</mark>`);
    }
}
