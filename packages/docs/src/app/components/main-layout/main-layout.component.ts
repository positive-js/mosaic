import { Component } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';


@Component({
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
    nextRoute: string = '';
    extras: NavigationExtras = {
        preserveFragment: true,
        queryParamsHandling: 'preserve'
    };

    constructor(private router: Router,
                private route: ActivatedRoute) {

        this.setNextRoute();
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
