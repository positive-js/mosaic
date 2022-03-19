## Extending Angular classes

All classes in Mosaic's public API are `final` (they should not be extended) unless explicitly stated in the API documentation.

Extending such `final` classes is not supported, since protected members and internal implementation may change outside of major releases.

## Golden files

Mosaic tracks the status of the public API in a *golden file*, maintained with a tool called the *public API guard*.
If you modify any part of a public API in one of the supported public packages, the PR can fail a test in CI with an error message that instructs you to accept the golden file.

The public API guard provides a command that updates the current status of a given package. If you add to or modify the public API in any way, you must use [npm](https://docs.npmjs.com/) to execute the command in your terminal shell of choice (a recent version of `bash` is recommended).

```shell
npm run approve-api <component>
```
