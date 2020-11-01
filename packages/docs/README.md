
## Production Build
1. generate basic module
```bash
yarn run build:mosaic-examples-module
```

2. generate dynamic examples
```bash
yarn run build:mosaic-examples
```

2.1.
```bash
yarn run styles:built-all
```

3. generate `docs-content` folder (dgeni)
```bash
yarn run build:docs
```

4. build
```bash
yarn run docs:prod-build:aot
```


## Development Server
Generate `docs-content` folder (dgeni)
```bash
yarn run build:docs
```

Generate basic module
```bash
yarn run build:mosaic-examples-module
```

Start ng server documentation as dev (source components from packages)
```bash
yarn run docs:start:dev
```
