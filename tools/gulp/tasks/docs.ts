import * as path from 'path';

import { Dgeni } from 'dgeni';
import { task, src, dest } from 'gulp';

import { apiDocsPackage } from '../../dgeni';
import { buildConfig, sequenceTask } from '../../packages';


const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
const highlight = require('gulp-highlight-files');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const flatten = require('gulp-flatten');
const hljs = require('highlight.js');
const dom  = require('gulp-dom');

const { outputDir, packagesDir } = buildConfig;

const DIST_DOCS = path.join(outputDir, 'docs');

const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

// Markdown files can contain links to other markdown files.
// Most of those links don't work in the Mosaic docs, because the paths are invalid in the
// documentation page. Using a RegExp to rewrite links in HTML files to work in the docs.
const LINK_PATTERN = /(<a[^>]*) href="([^"]*)"/g;

// HTML tags in the markdown generated files that should receive a .docs-markdown-${tagName} class
// for styling purposes.
const MARKDOWN_TAGS_TO_CLASS_ALIAS = [
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'li',
    'ol',
    'p',
    'table',
    'tbody',
    'td',
    'th',
    'tr',
    'ul',
    'pre',
    'code'
];

// Options for the html-minifier that minifies the generated HTML files.
const htmlMinifierOptions = {
    collapseWhitespace: true,
    removeComments: true,
    caseSensitive: true,
    removeAttributeQuotes: false
};

const markdownOptions = {
    // Add syntax highlight using highlight.js
    highlight: (code: string, language: string): string => {
        if (language) {
            // highlight.js expects "typescript" written out, while Github supports "ts".
            const lang = language.toLowerCase() === 'ts' ? 'typescript' : language;

            return hljs.highlight(lang, code).value;
        }

        return code;
    }
};

task('docs', sequenceTask(
    [
        'markdown-docs-mosaic',
        'markdown-docs-cdk',
        'build-highlighted-examples',
        'build-examples-module',
        'api-docs',
        'copy-stackblitz-examples'
    ],
    'minify-html-files'
));

task('api-docs', () => {
    const docs = new Dgeni([apiDocsPackage]);

    return docs.generate();
});

task('markdown-docs-mosaic', () => {

    markdown.marked.Renderer.prototype.heading = (text: string, level: number): string => {
        if (level === 3 || level === 4) {
            const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

            return `
        <h${level} id="${escapedText}" class="docs-header-link">
          <span header-link="${escapedText}"></span>
          ${text}
        </h${level}>
      `;
        } else {
            return `<h${level}>${text}</h${level}>`;
        }
    };

    return src(['src/lib/**/!(README).md', 'guides/*.md'])
        .pipe(rename({prefix: 'mosaic-'}))
        .pipe(markdown(markdownOptions))
        .pipe(transform(transformMarkdownFiles))
        .pipe(dom(createTagNameAliaser('docs-markdown')))
        .pipe(dest('dist/docs/markdown'));
});

task('markdown-docs-cdk', () => {
    return src(['src/cdk/**/!(README).md'])
        .pipe(rename({prefix: 'cdk-'}))
        .pipe(markdown(markdownOptions))
        .pipe(transform(transformMarkdownFiles))
        .pipe(dom(createTagNameAliaser('docs-markdown')))
        .pipe(dest('dist/docs/markdown'));
});

/**
 * Creates syntax-highlighted html files from the examples to be used for the source view of
 * live examples on the docs site.
 */
task('build-highlighted-examples', () => {
    // rename files to fit format: [filename]-[filetype].html
    const renameFile = (filePath: any) => {
        const extension = filePath.extname.slice(1);
        filePath.basename = `${filePath.basename}-${extension}`;
    };

    return src('src/mosaic-examples/**/*.+(html|css|ts)')
        .pipe(flatten())
        .pipe(rename(renameFile))
        .pipe(highlight())
        .pipe(dest('dist/docs/examples'));
});

/**
 * Minifies all HTML files that have been generated. The HTML files for the
 * highlighted examples can be skipped, because it won't have any effect.
 */
task('minify-html-files', () => {
    return src('dist/docs/+(api|markdown)/**/*.html')
        .pipe(htmlmin(htmlMinifierOptions))
        .pipe(dest('dist/docs'));
});

/** Copies example sources to be used as stackblitz assets for the docs site. */
task('copy-stackblitz-examples', () => {
    src(path.join(packagesDir, 'mosaic-examples', '**/*'))
        .pipe(dest(path.join(DIST_DOCS, 'stackblitz', 'examples')));
});

/** Updates the markdown file's content to work inside of the docs app. */
function transformMarkdownFiles(buffer: Buffer, file: any): string {
    let content = buffer.toString('utf-8');

    // Replace <!-- example(..) --> comments with HTML elements.
    content = content.replace(EXAMPLE_PATTERN, (_match: string, name: string) =>
        `<div mosaic-docs-example="${name}"></div>`
    );

    // Replace the URL in anchor elements inside of compiled markdown files.
    content = content.replace(LINK_PATTERN, (_match: string, head: string, link: string) =>
        // The head is the first match of the RegExp and is necessary to ensure that the RegExp matches
        // an anchor element. The head will be then used to re-create the existing anchor element.
        // If the head is not prepended to the replaced value, then the first match will be lost.
        `${head} href="${fixMarkdownDocLinks(link, file.path)}"`
    );

    // Finally, wrap the entire generated in a doc in a div with a specific class.
    return `<div class="docs-markdown">${content}</div>`;
}

/** Fixes paths in the markdown files to work in the mosaic. */
function fixMarkdownDocLinks(link: string, filePath: string): string {
    // As for now, only markdown links that are relative and inside of the guides/ directory
    // will be rewritten.
    if (!filePath.includes(path.normalize('guides/')) || link.startsWith('http')) {
        return link;
    }

    const baseName = path.basename(link, path.extname(link));

    // Temporary link the file to the /guide URL because that's the route where the
    // guides can be loaded in the Mosaic docs.
    return `guide/${baseName}`;
}

/**
 * Returns a function to be called with an HTML document as its context that aliases HTML tags by
 * adding a class consisting of a prefix + the tag name.
 * @param classPrefix The prefix to use for the alias class.
 */
function createTagNameAliaser(classPrefix: string) {
    return function() {
        MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            for (const el of this.querySelectorAll(tag)) {
                el.classList.add(`${classPrefix}-${tag}`);
            }
        });

        return this;
    };
}
