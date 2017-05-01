import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ButtonModule } from '../../lib/components/button/button.module';
import { bootloader } from '../helpers';


@Component({
    selector: 'app',
    template: `<button mc-button></button>`
})
export class ButtonDemoComponent {}

@NgModule({
    declarations: [
        ButtonDemoComponent
    ],
    imports: [
        BrowserModule,
        ButtonModule
    ],
    bootstrap: [
        ButtonDemoComponent
    ]
})
export class ButtonDemoModule {}

function main() {
    return platformBrowserDynamic()
            .bootstrapModule(ButtonDemoModule)
            .catch((error) => console.error(error));
}

bootloader(main);

