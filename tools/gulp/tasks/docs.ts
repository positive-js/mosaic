/* tslint:disable:no-var-requires */
import { Dgeni } from 'dgeni';
import { task, src, dest, series } from 'gulp';
import * as path from 'path';

import { apiDocsPackageConfig } from '../../dgeni/bin';
import { buildConfig } from '../../packages';


const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
const highlight = require('gulp-highlight-files');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const flatten = require('gulp-flatten');
const hljs = require('highlight.js');
const dom  = require('gulp-dom');

const { outputDir, packagesDir } = buildConfig;

const DIST_DOCS = path.join(outputDir, 'docs-content');

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
    'table',
    'tbody',
    'thead',
    'td',
    'tr',
    'ul',
    'pre',
    'code',
    'img'
];

// separating th and p to prevent it's conflict with thead and pre
const MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS = [
    'th',
    'p'
];
const CLASS_PREFIX: string = 'docs-markdown';
const tagNameStringAliaser = createTagNameStringAliaser(CLASS_PREFIX);

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


task('api-docs', () => {

    // Run the docs generation. The process will be automatically kept alive until Dgeni
    // completed. In case the returned promise has been rejected, we need to manually exit the
    // process with the proper exit code because Dgeni doesn't use native promises which would
    // automatically cause the error to propagate.
    const docs = new Dgeni([apiDocsPackageConfig]);

    return docs.generate().catch((e: any) => {
        // tslint:disable-next-line:no-console
        console.error(e);
        process.exit(1);
    });
});

task('markdown-docs-mosaic', () => {

    markdown.marked.Renderer.prototype.heading = (text: string, level: number): string => {
        // tslint:disable-next-line:no-magic-numbers
        if (level === 3 || level === 4) {
            const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

            return `
        <div class="docs-header-link docs-header-link_${level}">
          <span header-link="${escapedText}" id="${escapedText}"></span>
          ${text}
        </div>
      `;
        } else {
            return `<div class="docs-header-link docs-header-link_${level}">${text}</div>`;
        }
    };

    return src(['packages/mosaic/**/!(README).md', 'guides/*.md'])
        .pipe(markdown(markdownOptions))
        .pipe(transform(transformMarkdownFiles))
        .pipe(flatten())
        .pipe(dest('dist/docs-content/overviews/mosaic'));
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

    return src([
            'packages/mosaic-examples/**/*.+(html|css|ts)',
            '!packages/mosaic-examples/*.ts'
        ])
        .pipe(flatten())
        .pipe(rename(renameFile))
        .pipe(highlight())
        .pipe(dest('dist/docs-content/examples-highlighted'));
});


/** Copies example sources to be used as stackblitz assets for the docs site. */
task('copy-stackblitz-examples', () => {
    return src(
        [path.join(packagesDir, 'mosaic-examples', '**/*.+(html|css|ts)'),
            '!packages/mosaic-examples/*.ts'
        ])
        .pipe(flatten())
        .pipe(dest(path.join(DIST_DOCS, 'examples-source')));
});

task('docs', series(
        'markdown-docs-mosaic',
        'build-highlighted-examples',
        'build-examples-module',
        'api-docs',
        'copy-stackblitz-examples'
    )
);

/** Updates the markdown file's content to work inside of the docs app. */
function transformMarkdownFiles(buffer: Buffer, file: any): string {
    let content = buffer.toString('utf-8');
    content = tagNameStringAliaser(content);
    content = setTargetBlank(content);

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


function createTagNameStringAliaser(classPrefix: string) {
    return (content: string) => {
        let str = setImageCaption(content);

        MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            const regex = new RegExp(`<${tag}`, 'g');
            str = str.replace(regex, (_match: string) =>
                `<${tag} class="${classPrefix}__${tag}"`
            );
        });

        MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            const regex = new RegExp(`<${tag}\s*>`, 'g');
            str = str.replace(regex, (_match: string) =>
                `<${tag} class="${classPrefix}__${tag}">`
            );
        });

        return str;
    };
}

function setImageCaption(content: string): string  {
    let html = content;
    let pos = 0;

    while (html.includes('<img', pos)) {
        const imgIndex = html.indexOf('<img', pos);
        const captionIndex = html.indexOf('>', imgIndex) + 1;
        html = [html.slice(0, captionIndex),
                '<span class="docs-markdown__caption">',
                html.slice(captionIndex)].join('');
        const captionEndIndex = html.indexOf('</', captionIndex);
        html = [html.slice(0, captionEndIndex), '</span>', html.slice(captionEndIndex)].join('');

        pos = imgIndex + 1;
    }

    return html;
}

function setTargetBlank(content: string): string {
    let html = content;
    const regex = new RegExp(`href=".[^"]*"`, 'g'); // .[^"]* - any symbol exept "
    html = html.replace(regex, (match: string) =>
        `${match} target="_blank"`
    );

    return html;
}
