import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {

    constructor(private router: Router,
                private route: ActivatedRoute) {
        this.setNextRoute();

        if (this.router.routerState.snapshot.url === '/') {
            this.router.navigateByUrl('button/overview');
        }
    }

    setNextRoute() {
        const isRoute = location.search.includes('nextRoute');
        const search =  location.search.split('=');
        if (!isRoute || search.length < 2) { return; }
        const nextRoute = search[1] + location.hash;
        this.router.navigateByUrl(nextRoute.split(',').join('/'));
    }

}
