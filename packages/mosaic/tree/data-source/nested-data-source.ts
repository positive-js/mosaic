import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


/**
 * Data source for nested tree.
 *
 * The data source for nested tree doesn't have to consider node flattener, or the way to expand
 * or collapse. The expansion/collapsion will be handled by ITreeControl and each non-leaf node.
 */
export class McTreeNestedDataSource<T> extends DataSource<T> {

    get data() {
        return this._data.value;
    }

    set data(value: T[]) {
        this._data.next(value);
    }

    /* tslint:disable-next-line:naming-convention */
    private _data = new BehaviorSubject<T[]>([]);

    connect(collectionViewer: CollectionViewer): Observable<T[]> {
        return merge(...[collectionViewer.viewChange, this._data])
            .pipe(map(() => this.data));
    }

    disconnect() {
        // no op
    }
}

