import {addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId} from './aria-reference';


describe('AriaReference', () => {
  let testElement: HTMLElement | null;

  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    document.body.removeChild(testElement!); //tslint:disable-line
  });

  it('should be able to append/remove aria reference IDs', () => {
    addAriaReferencedId(testElement!, 'aria-describedby', 'reference_1'); //tslint:disable-line
    expectIds('aria-describedby', ['reference_1']);

    addAriaReferencedId(testElement!, 'aria-describedby', 'reference_2'); //tslint:disable-line
    expectIds('aria-describedby', ['reference_1', 'reference_2']);

    removeAriaReferencedId(testElement!, 'aria-describedby', 'reference_1'); //tslint:disable-line
    expectIds('aria-describedby', ['reference_2']);

    removeAriaReferencedId(testElement!, 'aria-describedby', 'reference_2'); //tslint:disable-line
    expectIds('aria-describedby', []);
  });

  it('should trim whitespace when adding/removing reference IDs', () => {
    addAriaReferencedId(testElement!, 'aria-describedby', '    reference_1   '); //tslint:disable-line
    addAriaReferencedId(testElement!, 'aria-describedby', '    reference_2   '); //tslint:disable-line
    expectIds('aria-describedby', ['reference_1', 'reference_2']);

    removeAriaReferencedId(testElement!, 'aria-describedby', '   reference_1   '); //tslint:disable-line
    expectIds('aria-describedby', ['reference_2']);

    removeAriaReferencedId(testElement!, 'aria-describedby', '   reference_2   '); //tslint:disable-line
    expectIds('aria-describedby', []);
  });

  it('should ignore empty string', () => {
    addAriaReferencedId(testElement!, 'aria-describedby', '  '); //tslint:disable-line
    expectIds('aria-describedby', []);
  });

  it('should not add the same reference id if it already exists', () => {
    addAriaReferencedId(testElement!, 'aria-describedby', 'reference_1'); //tslint:disable-line
    addAriaReferencedId(testElement!, 'aria-describedby', 'reference_1'); //tslint:disable-line
    expect(['reference_1']);
  });

  it('should retrieve ids that are deliminated by extra whitespace', () => {
    testElement!.setAttribute('aria-describedby', 'reference_1      reference_2'); //tslint:disable-line
    expect(getAriaReferenceIds(testElement!, 'aria-describedby')) //tslint:disable-line
        .toEqual(['reference_1', 'reference_2']);
  });

  /**
   * Expects the equal array from getAriaReferenceIds and a space-deliminated list from
   * the actual element attribute. If ids is empty, assumes the element should not have any
   * value
   */
  function expectIds(attr: string, ids: string[]) {
    expect(getAriaReferenceIds(testElement!, attr)).toEqual(ids); //tslint:disable-line
    expect(testElement!.getAttribute(attr)).toBe(ids.length ? ids.join(' ') : ''); //tslint:disable-line
  }
});
