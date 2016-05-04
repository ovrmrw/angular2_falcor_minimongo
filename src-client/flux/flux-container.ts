import {bind} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/zip';

import {Action} from './flux-action';
import {nowStateReducer, messagePage1StateReducer} from './flux-container.reducer';

export class Container {
  private stateSubject$: Subject<AppState>;

  constructor(initState: AppState, dispatcher$: Observable<Action>) {
    this.stateSubject$ = new BehaviorSubject(initState);

    Observable
      .zip<AppState>(
        nowStateReducer(initState.statePage1.nowByObservable, dispatcher$),
        messagePage1StateReducer(initState.statePage1.messageByFalcor, dispatcher$, initState.falcorModel),
        (now, message) => {
          return {
            falcorModel: initState.falcorModel,
            statePage1: {
              nowByObservable: now,
              messageByFalcor: message
            }
          } as AppState;
        }
      )
      .subscribe(appState => {
        this.stateSubject$.next(appState); // Componentでこのnextを受ける。
        // console.log(appState);
      });
  }

  get state$() {
    return this.stateSubject$ as Observable<AppState>;
  }
}
