
export * from './portal';
export * from './dom-portal-outlet';
export * from './portal-directives';
export * from './portal-injector';

export {DomPortalOutlet as DomPortalHost} from './dom-portal-outlet';
export {
  CdkPortalOutlet as PortalHostDirective,
  CdkPortal as TemplatePortalDirective
} from './portal-directives';
export {IPortalOutlet as PortalHost, BasePortalOutlet as BasePortalHost} from './portal';
