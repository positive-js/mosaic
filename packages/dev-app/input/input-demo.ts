import { Component } from '@angular/core';


@Component({
    selector: 'input-demo',
    templateUrl: 'input-demo.html',
    styleUrls: ['input-demo.css']
})
export class InputDemo {
    value: string = '';
    numberValue: number | null = null;
    min = -5;
}
