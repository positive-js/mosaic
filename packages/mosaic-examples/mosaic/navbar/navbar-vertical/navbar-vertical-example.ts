import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Vertical Navbar
 */
@Component({
    selector: 'navbar-vertical-example',
    templateUrl: 'navbar-vertical-example.html',
    styleUrls: ['navbar-vertical-example.css']
})
export class NavbarVerticalExample {
    themePalette = ThemePalette;

    onItemClick(event: MouseEvent) {
        alert(`innerText: ${(<HTMLElement> event.target).innerText}`);
    }
}
