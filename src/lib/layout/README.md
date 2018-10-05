## Component Overview

- `mc-layout`: The layout wrapper, in which `mc-header` `mc-sider` `mc-content` `mc-footer` or `mc-layout` itself can be nested, and can be placed in any parent container.
- `mc-header`: The top layout with default style, in which any element can be nested, and must be placed in `mc-layout`.
- `mc-sider`: The sidebar with default style and basic functions, in which any element can be nested, and must be placed in `mc-layout`.
- `mc-content`: The content layout with default style, in which any element can be nested, and must be placed in `mc-layout`.
- `mc-footer`: The bottom layout with default style, in which any element can be nested, and must be placed in `mc-layout`.

> Based on `flex layout`, please pay attention to the [compatibility](http://caniuse.com/#search=flex).

## API

```html
<mc-layout>
  <mc-header>header</mc-header>
  <mc-layout>
    <mc-sider>left sidebar</mc-sider>
    <mc-content>main content</mc-content>
    <mc-sider>right sidebar</mc-sider>
  </mc-layout>
</mc-layout>
```