import { Observable } from 'rxjs';


/** Represents a range of numbers with a specified start and end. */
// tslint:disable-next-line
export type ListRange = { start: number, end: number };


/**
 * Interface for any component that provides a view of some data collection and wants to provide
 * information regarding the view and any changes made.
 */
export interface ICollectionViewer {
    /**
     * A stream that emits whenever the `ICollectionViewer` starts looking at a new portion of the
     * data. The `start` index is inclusive, while the `end` is exclusive.
     */
    viewChange: Observable<ListRange>;
}
