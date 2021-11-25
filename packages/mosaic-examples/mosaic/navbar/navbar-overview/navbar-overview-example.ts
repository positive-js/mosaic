import { Component } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';


/**
 * @title Navbar
 */
@Component({
    selector: 'navbar-overview-example',
    templateUrl: 'navbar-overview-example.html',
    styleUrls: ['navbar-overview-example.css']
})
export class NavbarOverviewExample {
    themePalette = ThemePalette;
}
