// tslint:disable:no-console
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';


export class MyDataSource extends DataSource<string | undefined> {
    private length = 100000;
    private pageSize = 100;
    private cachedData = Array.from<string>({length: this.length});
    private fetchedPages = new Set<number>();
    private dataStream = new BehaviorSubject<(string | undefined)[]>(this.cachedData);
    private subscription = new Subscription();

    connect(collectionViewer: CollectionViewer): Observable<(string | undefined)[]> {
        this.subscription.add(collectionViewer.viewChange.subscribe((range) => {
            const startPage = this.getPageForIndex(range.start);
            const endPage = this.getPageForIndex(range.end - 1);
            for (let i = startPage; i <= endPage; i++) {
                this.fetchPage(i);
            }
        }));

        return this.dataStream;
    }

    disconnect(): void {
        this.subscription.unsubscribe();
    }

    private getPageForIndex(index: number): number {
        return Math.floor(index / this.pageSize);
    }

    private fetchPage(page: number) {
        const minTimeout = 200;
        const timeInterval = 1000;
        if (this.fetchedPages.has(page)) {
            return;
        }
        this.fetchedPages.add(page);

        // Use `setTimeout` to simulate fetching data from server.
        setTimeout(() => {
            this.cachedData.splice(page * this.pageSize, this.pageSize,
                ...Array.from({length: this.pageSize})
                    .map((_, i) => `Item #${page * this.pageSize + i}`));
            this.dataStream.next(this.cachedData);
        },
            // tslint:disable insecure-random
            Math.random() * timeInterval + minTimeout);
    }
}


@Component({
    selector: 'app',
    styleUrls: ['styles.css'],
    template: `
        <cdk-virtual-scroll-viewport itemSize="50" class="example-viewport">
            <div *cdkVirtualFor="let item of ds" class="example-item">{{item || 'Loading...'}}</div>
        </cdk-virtual-scroll-viewport>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CdkVirtualScrollDataSourceExample {
    ds = new MyDataSource();
}

@NgModule({
    declarations: [
        CdkVirtualScrollDataSourceExample
    ],
    imports: [
        BrowserModule,
        ScrollingModule
    ],
    bootstrap: [
        CdkVirtualScrollDataSourceExample
    ]
})
export class DemoModule {
}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
