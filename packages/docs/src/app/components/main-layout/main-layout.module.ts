import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTreeModule } from '@ptsecurity/mosaic/tree';

import { AnchorsModule } from '../anchors/anchors.module';
import { ComponentOverviewComponent, ComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { FooterModule } from '../footer/footer.module';
import { NavbarModule } from '../navbar';
import { SidenavModule } from '../sidenav/sidenav.module';

import { MainLayoutComponent } from './main-layout.component';


const routes: Routes = [{
    path: '',
    component: MainLayoutComponent,
    children: [
        {
            path: ':id',
            component: ComponentViewerComponent,
            children: [
                {path: '', redirectTo: 'overview', pathMatch: 'full'},
                {path: 'overview', component: ComponentOverviewComponent, pathMatch: 'full'}
            ]
        }

    ]
}];

@NgModule({
    imports: [
        AnchorsModule,

        CommonModule,
        RouterModule.forChild(routes),

        McTreeModule,
        McButtonModule,
        McIconModule,
        McDropdownModule,

        NavbarModule,
        SidenavModule,
        FooterModule
    ],
    exports: [MainLayoutComponent],
    declarations: [MainLayoutComponent]
})
export class MainLayoutModule {}
