`<mc-radio>` provides the same functionality as a native `<input type="radio">`.

<!-- example(radio-overview) -->

### Radio groups
Radio-buttons should typically be placed inside of an `<mc-radio-group>` unless the DOM structure
would make that impossible (e.g., radio-buttons inside of table cells). The radio-group has a
`value` property that reflects the currently selected radio-button inside of the group.

Individual radio-buttons inside of a radio-group will inherit the `name` of the group.


### Use with `@angular/forms`
`<mc-radio-group>` is compatible with `@angular/forms` and supports both `FormsModule`
and `ReactiveFormsModule`.

### Accessibility
The `<mc-radio-button>` uses an internal `<input type="radio">` to provide an accessible experience.
This internal radio button receives focus and is automatically labelled by the text content of the
`<mc-radio-button>` element.