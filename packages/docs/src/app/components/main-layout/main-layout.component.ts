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
        const search =  this.getParams();
        if (!search || !search.nextRoute) { return; }
        const nextRoute = search.nextRoute;
        delete search.nextRoute;
        const route = nextRoute + this.setParams(search) + location.hash;
        this.router.navigateByUrl(route.split(',').join('/'));
    }

    getParams() {
        const search = location.search.substring(1);

        if (search) {
            return JSON.parse(`{"${decodeURI(search).replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"')}"}`);
        }
    }

    setParams(search) {
        if (Object.keys(search).length) {
            return `?${JSON.stringify(search).replace(/","/g, '&').replace(/":"/g, '=').slice(2,-2)}`;
        }

        return '';
    }

}
