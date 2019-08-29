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
        const nextRoute = localStorage.getItem("PT_nextRoute");
        /*if (searchStart) {
         const searchStart = nextRoute.indexOf('?');
        const anchorStart = nextRoute.indexOf('#');
        let href = '', search = '', anchor = '';
            const searchEnd = anchorStart || nextRoute.length - 1;
            href = nextRoute.substring(0, searchStart);
            search = nextRoute.substring(searchStart, searchEnd);
        }

        if (anchorStart) {
            const anchorEnd = nextRoute.length - 1;
            if (!href)  {
                href = nextRoute.substring(0, anchorStart);
            }
            anchor = nextRoute.substring(anchorStart, anchorEnd);
        }
                const search =  this.getParams();
        if (!search || !search.nextRoute) { return; }
        const nextRoute = search.nextRoute;
        delete search.nextRoute;
         const route = nextRoute + this.setParams(search) + location.hash;
         this.router.navigateByUrl(route.split(',').join('/'));
        */

        if (nextRoute) { this.router.navigateByUrl(nextRoute); }
    }

    /*getParams() {
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
    }*/

}
