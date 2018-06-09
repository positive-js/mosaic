import { Observable, of as observableOf } from 'rxjs';

import { DataSource } from './data-source';


/** DataSource wrapper for a native array. */
export class ArrayDataSource<T> extends DataSource<T> {
    constructor(private _data: T[] | Observable<T[]>) {
        super();
    }

    connect(): Observable<T[]> {
        return this._data instanceof Observable ? this._data : observableOf(this._data);
    }

    disconnect() {}
}
