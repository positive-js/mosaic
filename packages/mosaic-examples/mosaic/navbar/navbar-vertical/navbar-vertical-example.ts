import { Component } from '@angular/core';
import { PopUpPlacements, ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Vertical Navbar
 */
@Component({
    selector: 'navbar-vertical-example',
    templateUrl: 'navbar-vertical-example.html',
    styleUrls: ['navbar-vertical-example.css']
})
export class NavbarVerticalExample {
    popUpPlacements = PopUpPlacements;
    themePalette = ThemePalette;
}
