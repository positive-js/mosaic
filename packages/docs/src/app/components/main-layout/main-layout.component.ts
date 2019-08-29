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
        const nextRoute = localStorage.getItem('PT_nextRoute');

        if (nextRoute) {
            this.router.navigate([nextRoute], { preserveFragment: true, queryParamsHandling: 'preserve' });
        }
    }

}
