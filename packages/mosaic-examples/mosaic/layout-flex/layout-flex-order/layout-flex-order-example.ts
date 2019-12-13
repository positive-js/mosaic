import { Component } from '@angular/core';


/**
 * @title Flex layout
 */
@Component({
    selector: 'layout-flex-order-example',
    templateUrl: 'layout-flex-order-example.html',
    styleUrls: ['layout-flex-order-example.css']
})
export class LayoutFlexOrderExample {
    selectedFirstBlockOrder: string = 'flex-order-0';
    selectedSecondBlockOrder: string = 'flex-order-1';
    selectedThirdBlockOrder: string = 'flex-order-2';

    flexOrders = [
        'flex-order-0',
        'flex-order-1',
        'flex-order-2',
        'flex-order-3',
        'flex-order-4',
        'flex-order-5',
        'flex-order-6',
        'flex-order-7',
        'flex-order-8',
        'flex-order-9'
    ];
}
