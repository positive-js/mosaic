import { coerceCssPixelValue } from '@ptsecurity/cdk/coercion';
import { ViewportRuler } from '@ptsecurity/cdk/scrolling';

import { IScrollStrategy } from './scroll-strategy';


/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy implements IScrollStrategy {
    private _previousHTMLStyles = { top: '', left: '' };
    private _previousScrollPosition: { top: number, left: number };
    private _isEnabled = false;
    private _document: Document;

    constructor(private _viewportRuler: ViewportRuler, document: any) {
        this._document = document;
    }

    /** Attaches this scroll strategy to an overlay. */
    attach() {
    } // tslint:disable-line

    /** Blocks page-level scroll while the attached overlay is open. */
    enable() { // tslint:disable-line

        if (this._canBeEnabled()) {
            const root = this._document.documentElement!;

            this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();

            // Cache the previous inline styles in case the user had set them.
            this._previousHTMLStyles.left = root.style.left || '';
            this._previousHTMLStyles.top = root.style.top || '';

            // Note: we're using the `html` node, instead of the `body`, because the `body` may
            // have the user agent margin, whereas the `html` is guaranteed not to have one.
            root.style.left = coerceCssPixelValue(-this._previousScrollPosition.left);
            root.style.top = coerceCssPixelValue(-this._previousScrollPosition.top);
            root.classList.add('cdk-global-scrollblock');
            this._isEnabled = true;
        }
    }

    /** Unblocks page-level scroll while the attached overlay is open. */
    disable() {
        if (this._isEnabled) {
            const html = this._document.documentElement!;
            const body = this._document.body!;
            const previousHtmlScrollBehavior = html.style['scrollBehavior'] || ''; // tslint:disable-line
            const previousBodyScrollBehavior = body.style['scrollBehavior'] || ''; // tslint:disable-line

            this._isEnabled = false;

            html.style.left = this._previousHTMLStyles.left;
            html.style.top = this._previousHTMLStyles.top;
            html.classList.remove('cdk-global-scrollblock');

            // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
            // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
            html.style['scrollBehavior'] = body.style['scrollBehavior'] = 'auto'; // tslint:disable-line

            window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);

            html.style['scrollBehavior'] = previousHtmlScrollBehavior; // tslint:disable-line
            body.style['scrollBehavior'] = previousBodyScrollBehavior; // tslint:disable-line
        }
    }

    private _canBeEnabled(): boolean {
        // Since the scroll strategies can't be singletons, we have to use a global CSS class
        // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
        // scrolling multiple times.
        const html = this._document.documentElement!;

        if (html.classList.contains('cdk-global-scrollblock') || this._isEnabled) {
            return false;
        }

        const body = this._document.body;
        const viewport = this._viewportRuler.getViewportSize();

        return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
    }
}
