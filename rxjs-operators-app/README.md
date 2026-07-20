# RxJS Operators Demo App

This Angular app demonstrates how `switchMap`, `mergeMap`, `concatMap`, and `exhaustMap` behave in real interactive scenarios.

## Run locally

1. Open terminal in `rxjs-operators-app`
2. Install dependencies:
   `npm install`
3. Start the app:
   `npm start`

## What the app shows

- `switchMap`: search input that cancels outdated requests and only shows the latest result.
- `mergeMap`: concurrent requests that may complete out of order.
- `concatMap`: queued requests that preserve order.
- `exhaustMap`: ignores new requests while one is already running.
