Mosaic buttons are available using native `<button>` or `<a>` elements.

### Variants
There are two button variants, each applied as an attribute:
+ basic buttons;
+ icon buttons.

#### Basic buttons

Basic `mc-button` buttons are rectangular buttons containing text only.

<!-- example(button-overview) -->

![Button states](./assets/images/Basic_buttons.png)
Basic button's states

#### Icon buttons
Icon buttons consist of an icon and can contain text.
To create an icon button, add the `<i mc-icon="icon_name"></i>` element within `<button c-icon-button>` where `"icon_name"` is the name of a [Mosaic icon](https://github.com/positive-js/mosaic-icons). For example:


Add any text before or after the `<i>` element to place a button label to the right or to the left of the icon.

### Colors

Mosaic provides three button colors, applied using the `color` property with possible values `primary`, `second`, and `error`.

### Progress indication
If processing an action takes more than 1-2 seconds, the progress indication ("loading") can be used. This shows that the system takes action, and the user won't wonder whether the button is working or not.
To enable the button progress indication, use `class="mc-progress"` which can be combined with other properties.