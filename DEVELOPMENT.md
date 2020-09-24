# Development

1. install [Node.js](https://nodejs.org/en/)
2. start coding 🚀

## Create a local development setup

### Install Node.js

To start contributing you need [Node.js](https://nodejs.org/en/) installed on
your machine. For macOS users, we recommend doing that with
[nvm](https://github.com/nvm-sh/nvm) a node version manager. While Windows users
should go with the LTS version of Node.js.

## Documentation

### Structure

- **packages**:
  - **docs**: main web-site
  - **mosaic**:
    - **button**: button.md – button description
    - **button-toggle**: button-toggle.md – button-toggle description
  - **mosaic-examples**: examples that are displayed in the documentation

### Adding new examples

1. Create (or update) a Markdown file with the component description.
This file is located in the component folder `mosaic/<component>/<component>.md`.

2. Create (or update) files with the component code.
This file is located in the `mosaic-examples` folder.
