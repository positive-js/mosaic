`<mc-divider>` is a component that allows for Mosaic styling of a line separator with various orientation options.

<!-- example(divider-overview) -->


### Simple divider

A `<mc-divider>` element can be used on its own to create a horizontal or vertical line styled with a Mosaic theme

```html
<mc-divider></mc-divider>
```

### Inset divider

Add the `inset` attribute in order to set whether or not the divider is an inset divider.

```html
<mc-divider [inset]="true"></mc-divider>
```

### Vertical divider

Add the `vertical` attribute in order to set whether or not the divider is vertically-oriented.

```html
<mc-divider [vertical]="true"></mc-divider>
```


### Lists with inset dividers

Dividers can be added to lists as a means of separating content into distinct sections.
Inset dividers can also be added to provide the appearance of distinct elements in a list without cluttering content
like avatar images or icons. Make sure to avoid adding an inset divider to the last element
in a list, because it will overlap with the section divider.

```html
<mc-list>
   <h3 mc-subheader>Folders</h3>
   <mc-list-item *ngFor="let folder of folders; last as last">
      <mc-icon mc-list-icon>folder</mc-icon>
      <h4 mc-line>{{folder.name}}</h4>
      <p mc-line class="demo-2"> {{folder.updated}} </p>
      <mc-divider [inset]="true" *ngIf="!last"></mc-divider>
   </mc-list-item>
   <mc-divider></mc-divider>
   <h3 mc-subheader>Notes</h3>
   <mc-list-item *ngFor="let note of notes">
      <mc-icon mc-list-icon>note</mc-icon>
      <h4 mc-line>{{note.name}}</h4>
      <p mc-line class="demo-2"> {{note.updated}} </p>
   </mc-list-item>
</mc-list>
```
