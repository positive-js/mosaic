# Directory structure

The top-level directory structure:

```
├─ docs ····················· Project documentation & guides
├─ scripts ·················· Public sh scripts
├─ packages ··················Public packages & source code for components
├─ tests ···················· Configs for tests
├─ tools ···················· infrastructure/build scripts 
├─ commitlint.config.js ····· scope-enum declaration
├─ gulpfile.js ·············· Gulp tasks config
├─ wallaby.js ··············· Wallaby/Webpack config
└─ package.json ············· Project config
``` 

## packages

```
├─ cdk ················· component development kit
├─ mosaic ·············· component source code
├─ mosaic-dev ·········· dev examples
└─ mosaic-examples ····· examples for documentation
```

### mosaic/button

```
└─ button ···························· component name
    ├─ _button-base.scss ············· Base styles for component (include to button.scss)
    ├─ _button-theme.scss ············ Theme & typograhy styles (include to _all-themes & _all-typograhy)
    ├─ button.component.html ········· Component template
    ├─ button.component.spec.ts
    ├─ button.component.ts
    ├─ button.md ····················· Documentation for component
    ├─ button.module.ts
    ├─ button.scss ··················· Main styles (inline to component)
    ├─ index.ts ······················ Main entry point
    ├─ public-api.ts ················· Public exports
    ├─ README.md
    └─ tsconfig.build.json
```
