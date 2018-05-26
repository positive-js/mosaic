
/* tslint:disable */
/** DO NOT MANUALLY EDIT THIS FILE, IT IS GENERATED VIA GULP 'build-examples-module' */
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ExampleMosaicModule} from './mosaic-module';
import {ButtonBasicExample} from './button-basic/button-basic-example';

export interface LiveExample {
  title: string;
  component: any;
  additionalFiles?: string[];
  selectorName?: string;
}

export const EXAMPLE_COMPONENTS: {[key: string]: LiveExample} = {
  'button-basic': {
    title: 'Basic buttons',
    component: ButtonBasicExample
  },
};

export const EXAMPLE_LIST = [
  ButtonBasicExample,
];

@NgModule({
  declarations: EXAMPLE_LIST,
  entryComponents: EXAMPLE_LIST,
  imports: [
    ExampleMosaicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ExampleModule { }
