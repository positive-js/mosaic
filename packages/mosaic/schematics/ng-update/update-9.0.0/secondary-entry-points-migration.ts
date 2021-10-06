// tslint:disable
import { Migration, TargetVersion } from '@angular/cdk/schematics';
import * as ts from 'typescript';


const ONLY_SUBPACKAGE_FAILURE_STR = `Importing from "@ptsecurity/mosaic" is deprecated. ` +
    `Instead import from the entry-point the symbol belongs to.`;

const NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR = `Imports from Mosaic should import ` +
    `specific symbols rather than importing the entire library.`;


const legacyMosaicModuleSpecifier = '@ptsecurity/mosaic';
const currentMosaicModuleSpecifier = '@ptsecurity/mosaic';

const MOSAIC_AC_FILEPATH_REGEX = new RegExp(
    `${legacyMosaicModuleSpecifier}/(.*?)/`
);

// tslint:disable-next-line:no-var-requires
const ENTRY_POINT_MAPPINGS: {[name: string]: string} = require('./mosaic-symbols.json');


// tslint:disable-next-line:no-null-keyword
export class SecondaryEntryPointsMigration extends Migration<null> {

    printer = ts.createPrinter();

    // Only enable this rule if the migration targets version 8.
    enabled = this.targetVersion === TargetVersion.V8 || this.targetVersion === TargetVersion.V9;

    // tslint:disable-next-line:max-func-body-length
    visitNode(declaration: ts.Node): void {

        if (
            !ts.isImportDeclaration(declaration) ||
            !ts.isStringLiteralLike(declaration.moduleSpecifier)
        ) {
            return;
        }

        const importLocation = declaration.moduleSpecifier.text;
        // skip check - if the import module is not @ptsecurity/mosaic
        if (importLocation !== legacyMosaicModuleSpecifier) {
            return;
        }

        // If no import clause is found, or nothing is named as a binding in the
        // import, add failure saying to import symbols in clause.
        if (!declaration.importClause || !declaration.importClause.namedBindings) {
            this.createFailureAtNode(declaration, NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);

            return;
        }

        // All named bindings in import clauses must be named symbols, otherwise add
        // failure saying to import symbols in clause.
        if (!ts.isNamedImports(declaration.importClause.namedBindings)) {
            this.createFailureAtNode(declaration, NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);

            return;
        }

        // If no symbols are in the named bindings then add failure saying to
        // import symbols in clause.
        if (!declaration.importClause.namedBindings.elements.length) {
            this.createFailureAtNode(declaration, NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);

            return;
        }

        // Map which consists of secondary entry-points and import specifiers which are used
        // within the current import declaration.
        const importMap = new Map<string, ts.ImportSpecifier[]>();

        // Determine the subpackage each symbol in the namedBinding comes from.
        for (const element of declaration.importClause.namedBindings.elements) {

            const elementName = element.propertyName ? element.propertyName : element.name;

            const moduleName = resolveModuleName(elementName, this.typeChecker) ||
                // tslint:disable-next-line:no-null-keyword
                ENTRY_POINT_MAPPINGS[elementName.text] || null;

            if (!moduleName) {

                this.createFailureAtNode(
                    element, `"${element.getText()}" was not found in the Mosaic library.`);

                return;
            }

            // The module name where the symbol is defined e.g. card, dialog. The
            // first capture group is contains the module name.
            if (importMap.has(moduleName)) {
                importMap.get(moduleName)!.push(element);
            } else {
                importMap.set(moduleName, [element]);
            }
        }

        const singleQuoteImport = declaration.moduleSpecifier.getText()[0] === `'`;

        // Transforms the import declaration into multiple import declarations that import
        // the given symbols from the individual secondary entry-points. For example:
        // import { McCardModule } from '@ptsecurity/mosaic/card';
        // import { McRadioModule } from '@ptsecurity/mosaic/radio';
        const newImportStatements =
            Array.from(importMap.entries())
                .sort()
                .map(([name, elements]) => {
                    const newImport = ts.createImportDeclaration(
                        undefined, undefined,
                        ts.createImportClause(undefined, ts.createNamedImports(elements)),
                        createStringLiteral(`${currentMosaicModuleSpecifier}/${name}`, singleQuoteImport));

                    return this.printer.printNode(
                        ts.EmitHint.Unspecified, newImport, declaration.getSourceFile());
                })
                .join('\n');

        // Without any import statements that were generated, we can assume that this was an empty
        // import declaration. We still want to add a failure in order to make developers aware that
        // importing from "@ptsecurity/mosaic" is deprecated.
        if (!newImportStatements) {
            this.createFailureAtNode(declaration.moduleSpecifier, ONLY_SUBPACKAGE_FAILURE_STR);

            return;
        }

        const filePath = this.fileSystem.resolve(
            declaration.moduleSpecifier.getSourceFile().fileName);

        const recorder = this.fileSystem.edit(filePath);

        // Perform the replacement that switches the primary entry-point import to
        // the individual secondary entry-point imports.
        recorder.remove(declaration.getStart(), declaration.getWidth());
        recorder.insertRight(declaration.getStart(), newImportStatements);
    }
}

/**
 * Creates a string literal from the specified text.
 * @param text Text of the string literal.
 * @param singleQuotes Whether single quotes should be used when printing the literal node.
 */
function createStringLiteral(text: string, singleQuotes: boolean): ts.StringLiteral {
    const literal = ts.createStringLiteral(text);
    // See: https://github.com/microsoft/TypeScript/blob/master/src/compiler/utilities.ts#L584-L590
    // tslint:disable-next-line: no-string-literal
    literal['singleQuote'] = singleQuotes;

    return literal;
}

function getDeclarationSymbolOfNode(node: ts.Node, checker: ts.TypeChecker): ts.Symbol | undefined {
    // tslint:disable-next-line:no-reserved-keywords
    const symbol = checker.getSymbolAtLocation(node);

    // Symbols can be aliases of the declaration symbol. e.g. in named import specifiers.
    // We need to resolve the aliased symbol back to the declaration symbol.
    // tslint:disable-next-line:no-bitwise
    if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
        return checker.getAliasedSymbol(symbol);
    }

    return symbol;
}

function resolveModuleName(node: ts.Identifier, typeChecker: ts.TypeChecker) {
    // Get the symbol for the named binding element. Note that we cannot determine the
    // value declaration based on the type of the element as types are not necessarily
    // specific to a given secondary entry-point (e.g. exports with the type of "string")
    // would resolve to the module types provided by TypeScript itself.
    // tslint:disable-next-line:no-reserved-keywords
    const symbol = getDeclarationSymbolOfNode(node, typeChecker);

    // If the symbol can't be found, or no declaration could be found within
    // the symbol, add failure to report that the given symbol can't be found.
    if (!symbol || !(symbol.valueDeclaration || (symbol.declarations && symbol.declarations.length !== 0))) {
        // tslint:disable-next-line:no-null-keyword
        return null;
    }

    // The filename for the source file of the node that contains the
    // first declaration of the symbol. All symbol declarations must be
    // part of a defining node, so parent can be asserted to be defined.
    const resolvedNode = symbol.valueDeclaration || symbol.declarations?.[0];

    if (!resolvedNode) { return null; }

    const sourceFile = resolvedNode.getSourceFile().fileName;

    // File the module the symbol belongs to from a regex match of the
    // filename. This will always match since only "@ptsecurity/mosaic"
    // elements are analyzed.
    const matches = sourceFile.match(MOSAIC_AC_FILEPATH_REGEX);

    // tslint:disable-next-line:no-null-keyword
    return matches ? matches[1] : null;
}
