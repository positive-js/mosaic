import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button/';


@Component({
    selector: 'app',
    template: `
        <button mc-xs-button>mc-xs-button</button>
        <button mc-sm-button>mc-sm-button</button>
        <button mc-button>default</button>
        <button mc-lg-button>mc-lg-button</button>
        <button mc-xl-button>mc-xl-button</button>
        
        <br>
        
        <a href="" mc-xs-button>mc-xs-button</a>
        <a href="" mc-sm-button>mc-sm-button</a>
        <a href="" mc-button>default</a>
        <a href="" mc-lg-button>mc-lg-button</a>
        <a href="" mc-xl-button>mc-xl-button</a>
        
        <br>

        <button mc-button color="primary" disabled>disabled</button>&nbsp;
        <button mc-button color="primary">normal</button>&nbsp;
        <button class="mc-hover" mc-button color="primary">hover</button>&nbsp;
        <button class="cdk-focused" mc-button color="primary">focus</button>&nbsp;
        <button class="mc-active" mc-button color="primary">pressed</button>&nbsp;
        <button class="mc-active mc-hover" mc-button color="primary">pressed-hover</button>

        <br>
        <br>

        <button mc-button color="second" disabled>disabled</button>&nbsp;
        <button mc-button color="second">normal</button>&nbsp;
        <button class="mc-hover" mc-button color="second">hover</button>&nbsp;
        <button class="cdk-focused" mc-button color="second">focus</button>&nbsp;
        <button class="mc-active" mc-button color="second">pressed</button>&nbsp;
        <button class="mc-active mc-hover" mc-button color="second">pressed-hover</button>
        
        <br><br>

        <button mc-button color="warn">warn</button>
    `,
    styleUrls: ['./theme.scss']
})
export class ButtonDemoComponent {}


/* tslint:disable:max-classes-per-file */
@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule
    ],
    bootstrap: [
        ButtonDemoComponent
    ]
})
export class ButtonDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ButtonDemoModule)
    .catch((error) => console.error(error));

