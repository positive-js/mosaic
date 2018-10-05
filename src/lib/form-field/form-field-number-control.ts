import { Observable } from 'rxjs';


/** An interface which allows a control to work inside of a `MсFormField`. */
export abstract class McFormFieldNumberControl<T> {
    /** The value of the control. */
    value: T | null;

    /**
     * Stream that emits whenever the state of the control changes such that the parent `MсFormField`
     * needs to run change detection.
     */
    readonly stateChanges: Observable<void>;

    /** the number step */
    step: number;

    /** the number big step */
    bigStep: number;

    /** Whether the control is focused. */
    readonly focused: boolean;

    /** Handles step up and down */
    abstract stepUp(step: number): void;

    abstract stepDown(step: number): void;
}
