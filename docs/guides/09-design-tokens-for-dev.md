0. Intro

To describe the tokens, we use [Style-Dictionary](https://amzn.github.io/style-dictionary/#/architecture)


1. Add Design Tokens to project

Copy the contents of the design-tokens folder to the style folder of your project.
For example, to the default-theme folder

```
.
 -- scripts/
    |-- build-tokens.js
 -- src/
    |-- app
    |-- assets
    |-- environments
    |-- styles/
    |   |-- default-theme/
    |   |   |-- components/
    |   |   |   |-- alert.json5
    |   |   |   |-- autocomplete.json5
    |   |   |   |-- badge.json5
    |   |   |   |-- button.json5
    |   |   |   `-- ...
    |   |   |-- properties/
    |   |   |   |-- aliases.json5
    |   |   |   |-- colors.json5
    |   |   |   |-- font.json5
    |   |   |   `-- ...
    |   |   |-- _palette.scss
    |   |   |-- _theme.scss
    |   |   |-- _typography.scss
    |   |   |-- _variables.scss
    |   |   |-- config.json5
    |   |   `-- css-tokens.css
    |   |-- _common.scss
    |   |-- _fonts.scss
    |   `-- _variables.scss
    |-- favicon.ico
    |-- index.html
    |-- styles.scss
    -- main.ts
```



2. Create build script

```javascript
const buildTokens = require('@ptsecurity/mosaic/design-tokens/style-dictionary/build');


const mosaicTokensProps = '../node_modules/@ptsecurity/mosaic/design-tokens/tokens/properties/**/*.json5';
const mosaicTokensComponents = '../node_modules/@packages/mosaic/design-tokens/tokens/components/**/*.json5';

buildTokens([
    {
        name: 'default-theme',
        buildPath: [
            mosaicTokensProps,
            mosaicTokensComponents
        ],
        outputPath: 'src/styles/default-theme/'
    }
]);

```

3. Usage: SASS ```styles.scss```

The design tokens are also published as SASS variables.


```scss
@import './styles/fonts';

@import '~@ptsecurity/mosaic/visual.scss';
@import '~@ptsecurity/mosaic-icons/dist/styles/mc-icons.css';
@import '~pt-product-icons/dist/styles/Product';

@include mosaic-visual();

// Include Design Tokens
@import './styles/default-theme/theme';

$typography: mc-typography-config();

// Include all typography for the components.
@include mc-core($typography);

@mixin app-theme($theme) {

    $background: map-get($theme, background);
    $foreground: map-get($theme, foreground);

    background: mc-color($background, background);
    color: mc-color($foreground, text);

    @include mosaic-theme($theme);
}

.theme-default {
    &.color-blue {

        // Include all theme styles for the mosaic components.
        @include app-theme($default-light-theme);
    }
}

```

3. Usage: TypeScript

TypeScript type declarations are also published.

```typescript
import {
    VerticalNavbarSizeStatesCollapsedWidth as closedWidth,
    VerticalNavbarSizeStatesExpandedWidth as openedWidth
} from '@ptsecurity/mosaic/design-tokens';


```
