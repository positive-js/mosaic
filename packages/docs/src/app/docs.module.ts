import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { ComponentViewerModule } from './components/component-viewer/component-viewer.module';
import { MainLayoutModule } from './components/main-layout/main-layout.module';
import { DocsComponent } from './docs.component';
import { APP_ROUTES } from './docs.module-routes';
import { DocumentationItems } from './shared/documentation-items/documentation-items';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,

        RouterModule.forRoot(APP_ROUTES, {
            scrollPositionRestoration: 'enabled',
            onSameUrlNavigation: 'reload',
            anchorScrolling: 'enabled'
        }),

        ComponentViewerModule,
        MainLayoutModule
    ],
    declarations: [DocsComponent],
    providers: [
        DocumentationItems,
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        }
    ],
    bootstrap: [DocsComponent]
})
export class AppModule {}
