import { Component, ViewEncapsulation } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';


@Component({
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MainLayoutComponent {
    nextRoute: string = '';

    extras: NavigationExtras = {
        preserveFragment: true,
        queryParamsHandling: 'preserve'
    };

    constructor(private router: Router) {
        const href = location.href;

        if (href.match('github')) {
            this.setNextRoute();
        } else {
            this.setDefaultRoute();
        }
    }

    setDefaultRoute() {
        if (location.pathname === '/') {
            this.router.navigate(['components/button/overview'], this.extras);
        }
    }

    setNextRoute() {
        this.nextRoute = localStorage.getItem('PT_nextRoute');

        if (this.nextRoute) {
            this.router.navigate([this.nextRoute], this.extras);
        } else {
            this.router.navigate(['button/overview'], this.extras);
        }
        localStorage.removeItem('PT_nextRoute');
    }
}
