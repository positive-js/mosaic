import { Observable } from 'rxjs';

import { ICollectionViewer } from './collection-viewer';


export abstract class DataSource<T> {
    /**
     * Connects a collection viewer (such as a data-table) to this data source. Note that
     * the stream provided will be accessed during change detection and should not directly change
     * values that are bound in template views.
     * @param collectionViewer The component that exposes a view over the data provided by this
     *     data source.
     * @returns Observable that emits a new value when the data changes.
     */
    abstract connect(collectionViewer: ICollectionViewer): Observable<T[]>;

    /**
     * Disconnects a collection viewer (such as a data-table) from this data source. Can be used
     * to perform any clean-up or tear-down operations when a view is being destroyed.
     *
     * @param collectionViewer The component that exposes a view over the data provided by this
     *     data source.
     */
    abstract disconnect(collectionViewer: ICollectionViewer): void;
}
