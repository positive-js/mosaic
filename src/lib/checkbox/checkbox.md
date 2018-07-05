`<mc-checkbox>` provides the same functionality as a native `<input type="checkbox">`
enhanced with Mosaic styling.

<!-- example(checkbox-overview) -->

### Checkbox label
The checkbox label is provided as the content to the `<mc-checkbox>` element. The label can be 
positioned before or after the checkbox by setting the `labelPosition` property to `'before'` or
`'after'`.

If you don't want the label to appear next to the checkbox, you can use 
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) or 
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) to 
specify an appropriate label.

### Use with `@angular/forms`
`<mc-checkbox>` is compatible with `@angular/forms` and supports both `FormsModule` 
and `ReactiveFormsModule`.

### Indeterminate state
`<mc-checkbox>` supports an `indeterminate` state, similar to the native `<input type="checkbox">`.
While the `indeterminate` property of the checkbox is true, it will render as indeterminate 
regardless of the `checked` value. Any interaction with the checkbox by a user (i.e., clicking) will
remove the indeterminate state.

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
use the theme's accent color. This can be changed to `'primary'` or `'warn'`.  

### Accessibility
The `<mc-checkbox>` uses an internal `<input type="checkbox">` to provide an accessible experience.
This internal checkbox receives focus and is automatically labelled by the text content of the
`<mc-checkbox>` element.

Checkboxes without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`.
