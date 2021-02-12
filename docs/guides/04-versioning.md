# Versioning

For the sake of keeping things simple, refer to the [Semver spec](semver-org)
for anything this document does not cover.

## Versioning semver

1. **MAJOR** version when
  - Change named exports exposed via the main entry point.
  - Changing and renaming public interfaces (@Inputs/@Outputs).
  - Change named exports exposed via the main entry point.
  - Changes in CSS that can affect layout outside of a component.
  - Upgrade peer dependencies.
  - You've made a visual change in a component that could affect someone using the public API.
    Box sizing could affect positioning, or child content.

2. **MINOR** version when
  - Anything that has a leading underscore.
  - Anything inside Template(). This includes elements, attributes and classes.
  For example, add / removing attributes or changing text content.
  Some integration tests may be relying on this, but it's still not a breaking change.
  It won't break you in production if you're using caret versions from NPM.
  It'll break your tests, but you'll update those prior to releasing anything.

3. **PATCH** version when
  - update package dependencies
  - Directory structure changes

4. **NO RELEASE** when
  - Update dev dependencies
  - Add tests or examples
  - Update examples
  - Update internal documentation
  

[semver-org]: http://semver.org/
