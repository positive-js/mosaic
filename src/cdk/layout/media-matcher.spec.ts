
import {async, TestBed, inject} from '@angular/core/testing';
import {Platform} from '@ptsecurity/cdk/platform';

import {LayoutModule} from './index';
import {MediaMatcher} from './media-matcher';


describe('MediaMatcher', () => {
  let mediaMatcher: MediaMatcher;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayoutModule]
    });
  }));

  beforeEach(inject([MediaMatcher], (mm: MediaMatcher) => {
    mediaMatcher = mm;
  }));

  it('correctly returns a MediaQueryList to check for matches', () => {
    expect(mediaMatcher.matchMedia('(min-width: 1px)').matches).toBeTruthy();
    expect(mediaMatcher.matchMedia('(max-width: 1px)').matches).toBeFalsy();
  });

  it('should add CSS rules for provided queries when the platform is webkit',
    inject([Platform], (platform: Platform) => {
      const randomWidth = `${Math.random()}px`; //tslint:disable-line

      expect(getStyleTagByString(randomWidth)).toBeFalsy();
      mediaMatcher.matchMedia(`(width: ${randomWidth})`);

      if (platform.WEBKIT) {
        expect(getStyleTagByString(randomWidth)).toBeTruthy();
      } else {
        expect(getStyleTagByString(randomWidth)).toBeFalsy();
      }

      function getStyleTagByString(str: string): HTMLStyleElement | undefined {
        return Array.from(document.head.querySelectorAll('style')).find((tag) => {
          const rules = tag.sheet ? Array.from((tag.sheet as CSSStyleSheet).cssRules) : [];

          return !!rules.find((rule) => rule.cssText.includes(str));
        });
      }
  }));
});
