import { Routes } from '@angular/router';

import { ButtonDemo } from './button/button-demo';
import { DatepickerDemo } from './datepicker/datepicker-demo';
import { DevApp404, DevAppHome } from './dev-app';
import { InputDemo } from './input/input-demo';


export const DEV_APP_ROUTES: Routes = [
  {path: '', component: DevAppHome},

  {path: 'button', component: ButtonDemo},
  {path: 'input', component: InputDemo},
  {path: 'datepicker', component: DatepickerDemo},

  {path: '**', component: DevApp404}
];
