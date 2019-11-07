import { Component } from '@angular/core';


/**
 * @title Basic textarea
 */
@Component({
    selector: 'text-area-overview-example',
    templateUrl: 'text-area-overview-example.html',
    styleUrls: ['text-area-overview-example.css']
})
export class TextAreaOverviewExample {

    disabled: boolean = true;
    required: boolean = true;
    placeholder: string = 'placeholder';
}
