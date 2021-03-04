import { Directive } from '@angular/core';


@Directive({
    selector: `[mc-modal-title], mc-modal-title, [mcModalTitle]`,
    host: {
        class: 'mc-modal-header mc-modal-title'
    }
})
export class McModalTitle {}

@Directive({
    selector: `[mc-modal-body], mc-modal-body, [mcModalBody]`,
    host: {
        class: 'mc-modal-body'
    }
})
export class McModalBody {}

@Directive({
    selector: `[mc-modal-footer], mc-modal-footer, [mcModalFooter]`,
    host: {
        class: 'mc-modal-footer'
    }
})
export class McModalFooter {}

@Directive({
    selector: `[mc-modal-main-action], mc-modal-main-action`
})
export class McModalMainAction {
}
