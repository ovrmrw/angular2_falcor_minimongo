import {bind} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/zip';

import {Action} from './flux-action';
import {nowStateReducer, messageStateReducerPage1, messageStateReducerPage2} from './flux-container.reducer';

export class Container {
  private stateSubject$: Subject<AppState>;

  constructor(initState: AppState, dispatcher$: Observable<Action>) {
    this.stateSubject$ = new BehaviorSubject(initState);

    Observable
      .zip<AppState>(
        nowStateReducer(initState.statePage1.nowByPush, dispatcher$),
        messageStateReducerPage1(initState.statePage1.messageByPush, dispatcher$, initState.falcorModel),
        messageStateReducerPage2(initState.statePage2.messageByPush, dispatcher$, initState.falcorModel),
        (now, messagePage1, messagePage2) => {
          return {
            falcorModel: initState.falcorModel,
            statePage1: {
              nowByPush: now,
              messageByPush: messagePage1
            },
            statePage2: {
              nowByPush: now,
              messageByPush: messagePage2
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
