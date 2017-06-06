import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ROUTING } from './app.routes';


@NgModule({
    imports: [
        BrowserModule,

        ROUTING
    ],
    declarations: [AppComponent],
    providers: [],
    bootstrap: [
        AppComponent
    ],
})
export class AppModule {}
