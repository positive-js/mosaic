### Getting started

### Step 1: Install

#### NPM
```bash
npm install --save @ptsecurity/mosaic @ptsecurity/cdk
```

#### Yarn
```bash
yarn add @ptsecurity/mosaic @ptsecurity/cdk
```

#### Nightly (Snapshots) builds

#### NPM
```bash
npm install --save positive-js/mosaic-builds positive-js/cdk-builds
```

#### Yarn
```bash
yarn add positive-js/mosaic-builds positive-js/cdk-builds
```

### Step 2: Animations

#### NPM
```bash
npm install --save @angular/animations
```

#### Yarn
```bash
yarn add @angular/animations
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

```ts
import { McButtonModule, McCheckboxModule } from '@ptsecurity/mosaic';

@NgModule({
  imports: [ McButtonModule, McCheckboxModule ],
  exports: [ McButtonModule, McCheckboxModule ]
})
export class CoreCustomModule { }
```

### Step 4: Include a theme

```css
@import "~@ptsecurity/mosaic/prebuilt-themes/default-theme.css";
```