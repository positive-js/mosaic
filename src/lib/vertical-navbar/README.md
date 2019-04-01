# Vertical Navbar component

Provides configurable layout for expandable navbar panel.

## General description

So the navbar is just a container for items and its general scheme looks like this:
```
<mc-vertical-navbar>
    <mc-vertical-navbar-header>Some header here</mc-vertical-navbar-header>
    
    <div>Some custom element</div>
    
    <mc-vertical-navbar-item>Item with default styling</mc-vertical-navbar-item>
    <a mc-vertical-navbar-item>Anchor item</a>
    <mc-vertical-navbar-item>
        <mc-vertical-navbar-item>First nested item</mc-vertical-navbar-item>    
        <a mc-vertical-navbar-item>Second nested anchor item</a>    
    </mc-vertical-navbar-item>
</mc-vertical-navbar>
```

It also has two states: *expanded* and *collapsed*, with transition between them.
In the collapsed state its width equals to exact 64px and isn't configurable out of the box for now.

You're allowed to put inside `<mc-vertical-navbar>` any content you like,
but `<mc-vertical-navbar-header>` and `<mc-vertical-navbar-item>` have their special appearance and behavior.

## Header 

`<mc-vertical-navbar-header>` is positioned at the very top and is only shown in the expanded state.
It's also possible to define it as `<a mc-vertical-navbar-header>`.

## Items

The default usage is something like this:
```
<mc-vertical-navbar-item>
    <mc-vertical-navbar-item-icon><i mc-icon="mc-gear_16"></i></mc-vertical-navbar-item-icon>
    <mc-vertical-navbar-title>Simple item with icon</mc-vertical-navbar-title>
</mc-vertical-navbar-item>
```
In this case the title is hidden in collapsed state while the icon is always visible.

It's also possible to define items as `<a mc-vertical-navbar-item>` to make them behave as anchors.
```
<a mc-vertical-navbar-item routerLink="/some-path">Any content</a>
```

And again, you can put any content into `<mc-vertical-navbar-item>`, but its appearance in the collapsed state is your duty.

## Item states

Of course, you are able to manage your `mc-vertical-navbar-item` from outside, applying any styles you like,
but we also provide some states which are allowed to be combined with each other.
 - class `mc-vertical-navbar-item-active` highlights an item,
 - class `mc-progress` stands for striped animation,
 - class `cdk-focused` - focused state, we control it as well for common tab order behavior,
 - attribute `disabled` works as expected, making an item unselectable and grayed-out.

## Nested items

By putting one item into another you make them work together as a menu:

```
<mc-vertical-navbar-item>
    I'm expandable!
    
    <mc-vertical-navbar-item>Nested item</mc-vertical-navbar-item>
    <a mc-vertical-navbar-item>Nested item</a>
</mc-vertical-navbar-item>
```

And you are *not* limited to the one level of nesting:
```
<mc-vertical-navbar-item>Zero
    <mc-vertical-navbar-item>One
        <mc-vertical-navbar-item>Two
            <mc-vertical-navbar-item>Three
            </mc-vertical-navbar-item>
        </mc-vertical-navbar-item>
    </mc-vertical-navbar-item>
</mc-vertical-navbar-item>
```

## Positioning toolbar content

By default the navbar puts the items one below the other.
However you're able to customize the positioning.

For instance, putting some items at the bottom is as simple as this:
```
<mc-vertical-navbar>
    <mc-vertical-navbar-item>Top aligned</mc-vertical-navbar-item>
    <mc-vertical-navbar-item style="margin-top: auto;">Bottom aligned</mc-vertical-navbar-item>
    <mc-vertical-navbar-item>Bottom aligned</mc-vertical-navbar-item>
</mc-vertical-navbar-item>
```

Nested items can be vertically aligned by setting `alignNestedItems` property with allowed values `'bottom'` and `'top'`