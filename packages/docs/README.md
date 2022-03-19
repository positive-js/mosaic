
## Production Build
1. generate basic module
```bash
npm run build:mosaic-examples-module
```

2. generate dynamic examples
```bash
npm run build:mosaic-examples
```

2.1.
```bash
npm run styles:built-all
```

3. generate `docs-content` folder (dgeni)
```bash
npm run build:docs-content && npm run build:highlight && npm run build:package-docs-content
```

4. build
```bash
npm run docs:prod-build:aot
```


## Development Server
Generate `docs-content` folder (dgeni)
```bash
npm run build:docs-content && npm run build:highlight && npm run build:package-docs-content
```

Generate basic module
```bash
npm run build:mosaic-examples-module
```

Generate dynamic examples
```bash
npm run build:mosaic-examples
```

Start ng server documentation as dev (source components from packages)
```bash
npm run docs:start:dev
```
