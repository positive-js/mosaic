/** An interface which allows a control to work inside of a `MсFormField`. */
export abstract class McFormFieldNumberControl<T> {
    /** The value of the control. */
    value: T | null;

    /** the number step */
    step: number;

    /** Handles step up and down */
    abstract stepUp(step: number): void;

    abstract stepDown(step: number): void;
}
