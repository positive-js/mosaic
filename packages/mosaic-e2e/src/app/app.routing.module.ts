// tslint:disable:no-reserved-keywords
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: 'button',
        loadChildren: () =>
            import('../components/button/button.module').then(
                (module) => module.McE2EButtonModule
            )
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            paramsInheritanceStrategy: 'always',
            enableTracing: false,
            initialNavigation: 'enabled',
            relativeLinkResolution: 'legacy'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
