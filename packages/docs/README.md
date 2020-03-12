
## Development Setup
1. generate basic module
```bash
npx gulp build-examples-module
```

2. generate dynamic examples (for Stackblitz)
```
npx ng build mosaic-examples
```

3. generate `docs-content` folder (dgeni)
```bash
yarn run build:docs
```


## Development Server
Start ng server documentation

```bash
yarn run docs:start 
```

Open app
```
http://localhost:4200/
```
