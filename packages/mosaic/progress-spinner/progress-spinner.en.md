`<mc-progress-spinner>` is a component that allows display progress spinner.

### Simple progress spinner

A `<mc-progress-spinner>` element can be used on its own to create a sector progress with Mosaic theme

```html
<mc-progress-spinner></mc-progress-spinner>
```
<!-- example(progress-spinner-overview) -->

### Props

#### `value`
Displaying sector filling progress depends on this property  
The range of value is [0, 100]  
Default: 0

```html
This will fill 30% of the sector
<mc-progress-spinner [value]="30"></mc-progress-spinner>
```

#### `mode`
Enum ('determinate', 'indeterminate')  
Default: 'determinate'  

```html
To show indeterminate progress
<mc-progress-spinner [mode]="'indeterminate'"></mc-progress-spinner>
Or for determinate progress
<mc-progress-spinner [mode]="'determinate'" [value]="30"></mc-progress-spinner>
```
<!-- example(progress-spinner-indeterminate) -->

#### `color`
Enum ('primary', 'second', 'error')
Default: 'primary'
Set theming of element

```html
<mc-progress-spinner [color]="'primary'"></mc-progress-spinner>
<mc-progress-spinner [color]="'second'"></mc-progress-spinner>
<mc-progress-spinner [color]="'error'"></mc-progress-spinner>
```

### Theming
The color of a `<mc-progress-spinner>` can be changed by using the `color` property. By default, it
use the theme's `primary` color. This can be changed to `'second'` or `'error'`.
