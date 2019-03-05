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
        {
            text: 'Form controls',
            children: [
                { text: 'Button', route: '/button' },
                { text: 'Input', route: '/input' }
            ]
        }
    ];
}

/** Home component which includes a welcome message for the dev-app. */
@Component({
    selector: 'home',
    template: `
        <p>Welcome to the development demos for Angular Mosaic!</p>
        <p>Select demo on the navbar.</p>
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
