import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import {
  switchMap,
  debounceTime,
  distinctUntilChanged,
  mapTo,
  tap,
  mergeMap,
  concatMap,
  exhaustMap,
  finalize
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'RxJS Operator Demo';

  searchResults$!: Observable<string>;
  searchLog: string[] = [];
  private search$ = new Subject<string>();

  mergeLog: string[] = [];
  concatLog: string[] = [];
  exhaustLog: string[] = [];

  publishCounter = 0;
  mergeCounter = 0;
  concatCounter = 0;
  exhaustCounter = 0;
  exhaustBusy = false;

  private subscriptions = new Subscription();
  private mergeRequests = new Subject<number>();
  private concatRequests = new Subject<number>();
  private exhaustRequests = new Subject<number>();

  constructor() {
    this.setupSearchDemo();
    this.setupMergeMapDemo();
    this.setupConcatMapDemo();
    this.setupExhaustMapDemo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSearch(value: string): void {
    this.search$.next(value.trim());
  }

  onMergeClick(): void {
    this.mergeRequests.next(++this.mergeCounter);
  }

  onConcatClick(): void {
    this.concatRequests.next(++this.concatCounter);
  }

  onExhaustClick(): void {
    const nextId = ++this.exhaustCounter;
    if (this.exhaustBusy) {
      this.log(this.exhaustLog, `exhaustMap ignored request ${nextId} while busy`);
      return;
    }
    this.exhaustRequests.next(nextId);
  }

  private setupSearchDemo(): void {
    this.searchResults$ = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        if (term) {
          this.log(this.searchLog, `search started for "${term}"`);
        }
      }),
      switchMap(term => this.fakeSearch(term))
    );
  }

  private setupMergeMapDemo(): void {
    const mergeSubscription = this.mergeRequests
      .pipe(
        tap(id => this.log(this.mergeLog, `mergeMap request ${id} started`)),
        mergeMap(id => this.fakeNetwork(id, 900 + Math.round(Math.random() * 900), 'mergeMap'))
      )
      .subscribe(result => this.log(this.mergeLog, result));

    this.subscriptions.add(mergeSubscription);
  }

  private setupConcatMapDemo(): void {
    const concatSubscription = this.concatRequests
      .pipe(
        tap(id => this.log(this.concatLog, `concatMap queued request ${id}`)),
        concatMap(id => this.fakeNetwork(id, 1200, 'concatMap'))
      )
      .subscribe(result => this.log(this.concatLog, result));

    this.subscriptions.add(concatSubscription);
  }

  private setupExhaustMapDemo(): void {
    const exhaustSubscription = this.exhaustRequests
      .pipe(
        exhaustMap(id => {
          this.exhaustBusy = true;
          this.log(this.exhaustLog, `exhaustMap accepted request ${id}`);
          return this.fakeNetwork(id, 1800, 'exhaustMap').pipe(
            finalize(() => {
              this.exhaustBusy = false;
              this.log(this.exhaustLog, `exhaustMap request ${id} finished`);
            })
          );
        })
      )
      .subscribe(result => this.log(this.exhaustLog, result));

    this.subscriptions.add(exhaustSubscription);
  }

  private fakeSearch(term: string): Observable<string> {
    if (!term) {
      return timer(0).pipe(mapTo('Type a value to begin search.'));
    }
    return timer(900).pipe(mapTo(`search results for "${term}"`));
  }

  private fakeNetwork(id: number, delayMs: number, label: string): Observable<string> {
    return timer(delayMs).pipe(mapTo(`${label} request ${id} completed after ${delayMs}ms`));
  }

  private log(target: string[], message: string): void {
    target.unshift(`${new Date().toLocaleTimeString()}: ${message}`);
    if (target.length > 15) {
      target.length = 15;
    }
  }
}
