# Mosaic schematics

## ng update

The angular cli provides an interface to run automatic update scripts with
`ng update` for library authors. To achieve this we are using the
`collection.json` file to specify the schematics that need to run for each
version individually.

### Testing

There are tests for the update schematics that create a virtual demo app that is
used to check whether the schematic changes the correct things.

If you want to test the schematic on a real world app you should perform the
following steps:

- Run `ng build` - this builds the library including the schematics and puts it
  into the `dist/mosaic` folder
- Link the npm dependency of the `@ptsecurity/mosaic` to the
  `dist/mosaic` folder
- run
  `ng update @ptsecurity/mosaic --migrateOnly=true --from="8.0.0" --to="9.0.0"`
  with the correct versions respectively

## ng add

The ng-add schematics is used to add the **mosaic components** to a new angular
project with all its dependencies

### Testing

To run the unit tests with Jasmine:
* Build Schematics `ng build schematics`
* Run tests `npm run unit:schematics`
