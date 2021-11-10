`<mc-progress-bar>` is a component that allows display progress bar.

### Simple progress bar

A `<mc-progress-bar>` element can be used on its own to create a horizontal progress line with Mosaic theme

```html
<mc-progress-bar></mc-progress-bar>
```

### Props

#### `value`
Displaying length of progress bar depends on this property  
The range of value is [0, 100]  
Default: 0

```html
This will fill 30% of the hole progress bar
<mc-progress-bar value="30"></mc-progress-bar>
```
<!-- example(progress-bar-overview) -->

#### `mode`
Enum ('determinate', 'indeterminate')  
Default: 'determinate'  

```html
To show indeterminate progress
<mc-progress-bar mode="indeterminate"></mc-progress-bar>
Or for determinate progress
<mc-progress-bar mode="determinate" value="30"></mc-progress-bar>
```
<!-- example(progress-bar-indeterminate) -->


#### `color`
Enum ('primary', 'second', 'error')  
Default: 'primary'  
Set theming of element

```html
<mc-progress-bar [color]="'primary'"></mc-progress-bar>
<mc-progress-bar [color]="'second'"></mc-progress-bar>
<mc-progress-bar [color]="'error'"></mc-progress-bar>
```

### Theming
The color of a `<mc-progress-bar>` can be changed by using the `color` property. By default, it
use the theme's `primary` color. This can be changed to `'second'` or `'error'`.
