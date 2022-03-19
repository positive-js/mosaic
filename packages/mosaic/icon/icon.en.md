### Installation
Note that Mosaic Icons is optional package and it should be installed manually.

##### NPM
`npm install @ptsecurity/mosaic-icons --save`

Then you should add icons styles:

`@import "~@ptsecurity/mosaic-icons/dist/styles/mc-icons.css";`

And finally import McIconModule to your component module.

`import { McIconModule } from '@ptsecurity/mosaic';`

If mc-icons.css does't suit your project, you can also add:

- mc-icons.less;
- mc-icons-embed.css with embedded font included.

### Variants

There are two icon usage variants:

1. `<i mc-icon="mc-gear_16"></i>`;

    In this case you can provide `[color]` attribute. It can have following values: *primary*, *second*, *error*.

2. Simply `<i class="mc mc-gear_16"></i>`.
