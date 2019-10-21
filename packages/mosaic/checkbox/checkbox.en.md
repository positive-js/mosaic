Checkboxes are defined using the `<mc-checkbox>` element. Clicking the checkbox or its label toggles the checkbox state, which can be checked, unchecked, or indeterminate.

### Label

The checkbox label describes an option to be selected. The label is provided as the content of the `<mc-checkbox>` element.

### Label position

To place the label before or after the checkbox, use the `[labelPosition]` attribute with possible values `'before'` and `'after'`. The default position is after the checkbox.

`<mc-checkbox [labelPosition]="'before'">Left side label</mc-checkbox>`

If you don't want the label to appear next to the checkbox, you can use 
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) or 
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) to 
specify an appropriate label.

### Use with `@angular/forms`
`<mc-checkbox>` is compatible with `@angular/forms` and supports both `FormsModule` 
and `ReactiveFormsModule`.

### Dual-state

The dual-state is applied using the `[checked]` boolean attribute to show whether the checkbox is selected or not. The default state is checked.

<!-- example(checkbox-overview) -->

### Indeterminate state (partially selected)

The indeterminate state is applied using the `[indeterminate]` boolean attribute and can be used when you have a group of options, and a higher-level checkbox must represent their state:
+ if only some of the options in a group are selected, the higher-level checkbox appears partially selected (`[indeterminate]="true"`).
+ If all of them are selected, the higher-level checkbox appears selected.
+ If none are selected, the higher-level checkbox appears not selected.

<Можно пример с группой чекбоксов?>
<!-- example(checkbox-indeterminate) -->

### Disabled checkboxes

You can use the `[disabled]` boolean attribute to make a checkbox look unclickable.

`<mc-checkbox [disabled]="true">Disabled</mc-checkbox>`

### Click action config
When user clicks on the `mc-checkbox`, the default behavior is toggle `checked` value and set
`indeterminate` to `false`. This behavior can be customized by
[providing a new value](https://angular.io/guide/dependency-injection)
of `MC_CHECKBOX_CLICK_ACTION` to the checkbox.

```
providers: [
  {provide: MC_CHECKBOX_CLICK_ACTION, useValue: 'check'}
]
```

The possible values are:

#### `noop`
Do not change the `checked` value or `indeterminate` value. Developers have the power to
implement customized click actions.

#### `check`
Toggle `checked` value of the checkbox, ignore `indeterminate` value. If the
checkbox is in `indeterminate` state, the checkbox will display as an `indeterminate` checkbox
regardless the `checked` value.

#### `check-indeterminate`
Default behavior of `mc-checkbox`. Always set `indeterminate` to `false`
when user click on the `mc-checkbox`.
This matches the behavior of native `<input type="checkbox">`.

### Theming
The color of a `<mc-checkbox>` can be changed by using the `color` property. By default, checkboxes
use the theme's accent color. This can be changed to `'primary'` or `'error'`.  

### Accessibility
The `<mc-checkbox>` uses an internal `<input type="checkbox">` to provide an accessible experience.
This internal checkbox receives focus and is automatically labelled by the text content of the
`<mc-checkbox>` element.

Checkboxes without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`.
