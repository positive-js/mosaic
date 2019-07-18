import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ExampleModule } from '@ptsecurity/mosaic-examples';

import { ComponentViewerModule } from './components/component-viewer/component-viewer.module';
import { MainLayoutModule } from './components/main-layout/main-layout.module';
import { ComponentListModule, HomepageModule } from './containers';
import { ComponentCategoryListModule } from './containers/component-category-list/component-category-list.module';
import { DocsComponent } from './docs.component';
import { APP_ROUTES } from './docs.module-routes';
import { DocumentationItems } from './shared/documentation-items/documentation-items';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ExampleModule,

        RouterModule.forRoot(APP_ROUTES),

        HomepageModule,
        ComponentListModule,
        ComponentViewerModule,
        ComponentCategoryListModule,
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
