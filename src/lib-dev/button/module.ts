import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button/';


@Component({
    selector: 'app',
    template: `
        <button mc-xs-button>mc-xs-button</button>&nbsp;
        <button mc-sm-button>mc-sm-button</button>&nbsp;
        <button mc-button>default</button>&nbsp;
        <button mc-lg-button>mc-lg-button</button>&nbsp;
        <button mc-xl-button>mc-xl-button</button>&nbsp;
        
        <br>
        <br>
        
        <a href="" mc-xs-button>mc-xs-button</a>&nbsp;
        <a href="" mc-sm-button>mc-sm-button</a>&nbsp;
        <a href="" mc-button>default</a>&nbsp;
        <a href="" mc-lg-button>mc-lg-button</a>&nbsp;
        <a href="" mc-xl-button>mc-xl-button</a>&nbsp;
        
        <br>
        <br>

        <button mc-button color="primary" disabled>disabled</button>&nbsp;
        <button mc-button color="primary">normal</button>&nbsp;
        <button class="mc-hover" mc-button color="primary">hover</button>&nbsp;
        <button class="cdk-focused" mc-button color="primary">focus</button>&nbsp;

        <br>
        <br>

        <button class="mc-progress" mc-button color="primary" disabled>disabled</button>&nbsp;
        <button class="mc-progress" mc-button color="primary">normal</button>&nbsp;
        <button class="mc-hover mc-progress" mc-button color="primary">hover</button>&nbsp;
        <button class="cdk-focused mc-progress" mc-button color="primary">focus</button>&nbsp;

        <br>
        <br>

        <button mc-button color="second" disabled>disabled</button>&nbsp;
        <button mc-button color="second">normal</button>&nbsp;
        <button class="mc-hover" mc-button color="second">hover</button>&nbsp;
        <button class="cdk-focused" mc-button color="second">focus</button>&nbsp;
        
        <br>
        <br>

        <button class="mc-progress" mc-button color="second" disabled>disabled</button>&nbsp;
        <button class="mc-progress" mc-button color="second">normal</button>&nbsp;
        <button class="mc-hover mc-progress" mc-button color="second">hover</button>&nbsp;
        <button class="cdk-focused mc-progress" mc-button color="second">focus</button>&nbsp;
        
        <br>
        <br>

        <button mc-button color="warn" disabled>disabled</button>&nbsp;
        <button mc-button color="warn">normal</button>&nbsp;
        <button class="mc-hover" mc-button color="warn">hover</button>&nbsp;
        <button class="cdk-focused" mc-button color="warn">focus</button>&nbsp;

        <br>
        <br>

        <button class="mc-progress" mc-button color="warn" disabled>disabled</button>&nbsp;
        <button class="mc-progress" mc-button color="warn">normal</button>&nbsp;
        <button class="mc-hover mc-progress" mc-button color="warn">hover</button>&nbsp;
        <button class="cdk-focused mc-progress" mc-button color="warn">focus</button>&nbsp;
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

