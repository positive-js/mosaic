import { Component, ViewEncapsulation } from '@angular/core';


/** Root component for the dev-app demos. */
@Component({
    selector: 'dev-app',
    templateUrl: 'dev-app.html',
    styleUrls: ['dev-app.css'],
    encapsulation: ViewEncapsulation.None
})
export class DevAppComponent {
    dark = false;
    navItems = [
        { name: 'Button', route: '/button' }
    ];
}


/** Home component which includes a welcome message for the dev-app. */
@Component({
    selector: 'home',
    template: `
        <p>Welcome to the development demos for Angular Material!</p>
        <p>Open the sidenav to select a demo.</p>
    `
})
export class DevAppHome {
}

@Component({
    template: `
        <h1>404</h1>
        <p>This page does not exist</p>
        <a routerLink="/">Go back to the home page</a>
    `,
    host: { class: 'mc-typography' }
})
export class DevApp404 {
}
