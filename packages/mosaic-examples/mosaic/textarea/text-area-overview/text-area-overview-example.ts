import { Component } from '@angular/core';


/**
 * @title Basic textarea
 */
@Component({
    selector: 'textarea-overview-example',
    templateUrl: 'textarea-overview-example.html',
    styleUrls: ['textarea-overview-example.css']
})
export class TextAreaOverviewExample {

    disabled: boolean = true;
    required: boolean = true;
    placeholder: string = 'placeholder';
}
