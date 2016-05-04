import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/debounceTime';
const falcor = require('falcor');

import {Action} from './flux-action';
import {nowStateReducer, messageStateReducerPage1, messageStateReducerPage2, documentsStateReducerPage3} from './flux-container.reducer';

export class Container {
  private stateSubject$: Subject<AppState>;
  private falcorModel: any;

  constructor(initState: AppState, dispatcher$: Observable<Action>) {
    this.stateSubject$ = new BehaviorSubject(initState);
    this.falcorModel = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });

    Observable
      .zip<AppState>(
        nowStateReducer(initState.nowByPush, dispatcher$),
        messageStateReducerPage1(initState.page1.messageByPush, dispatcher$, this.falcorModel),
        messageStateReducerPage2(initState.page2.messageByPush, dispatcher$, this.falcorModel),
        documentsStateReducerPage3(initState.page3.documentsByPush, dispatcher$, this.falcorModel),
        (now, messagePage1, messagePage2, documentsPage3) => {
          return {
            nowByPush: now,
            page1: {
              messageByPush: messagePage1
            },
            page2: {
              messageByPush: messagePage2
            },
            page3: {
              documentsByPush: documentsPage3
            }
          } as AppState;
        }
      )
      .debounceTime(1)
      .subscribe(appState => {
        this.stateSubject$.next(appState); // Componentでこのnextを受ける。
        // console.log(appState);
      });
  }

  get state$() {
    return this.stateSubject$ as Observable<AppState>;
  }
}
