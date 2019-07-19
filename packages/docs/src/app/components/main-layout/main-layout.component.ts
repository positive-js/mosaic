import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {

    constructor(private router: Router) {
        if (this.router.routerState.snapshot.url === '/') {
            this.router.navigateByUrl('button/overview');
        }
    }

}
