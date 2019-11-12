import { Component } from '@angular/core';


/**
 * @title Pseudo link
 */
@Component({
    selector: 'link-pseudo-example',
    templateUrl: 'link-pseudo-example.html',
    styleUrls: ['link-pseudo-example.css']
})
export class LinkPseudoExample {
    active = true;
    focus = true;
    disabled = true;
}
