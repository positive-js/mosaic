### Getting started

### Step 1: Install

#### NPM
```bash
npm install --save @angular/cdk @ptsecurity/mosaic @ptsecurity/cdk @ptsecurity/mosaic-icons @ptsecurity/mosaic-luxon-adapter @ptsecurity/mosaic-moment-adapter moment @messageformat/core
```

#### NPM
```bash
npm add @angular/cdk @ptsecurity/mosaic @ptsecurity/cdk @ptsecurity/mosaic-icons @ptsecurity/mosaic-luxon-adapter @ptsecurity/mosaic-moment-adapter moment @messageformat/core
```

#### Snapshots builds
A snapshot build with the latest changes from master is also available.
Note that this snapshot build should not be considered stable and may break between releases.

#### NPM
```bash
npm install --save positive-js/mosaic-builds positive-js/cdk-builds
```

#### npm
```bash
npm add positive-js/mosaic-builds positive-js/cdk-builds
```

### Step 2: Animations

#### NPM
```bash
npm install --save @angular/animations
```

#### npm
```bash
npm add @angular/animations
```

```ts
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  ...
  imports: [ BrowserAnimationsModule ],
  ...
})
export class AppModule { }
```

### Step 3: Import the component modules

You can create a separate NgModule that imports all of the components that you will use in your application.
You can then include this module wherever you'd like to use the components.

```ts
import { McButtonModule, McCheckboxModule } from '@ptsecurity/mosaic';

@NgModule({
    imports: [ McButtonModule, McCheckboxModule ],
    exports: [ McButtonModule, McCheckboxModule ]
})
export class CoreCustomModule { }
```

### Step 4: Include a theme

Including a theme is **required** to apply all of the core and theme styles to your application.

```css
@import "~@ptsecurity/mosaic/prebuilt-themes/default-theme.css";
```

You should include mosaic-icons in order to use icons classes

```css
@import "~@ptsecurity/mosaic-icons/dist/styles/mc-icons.css";
```
