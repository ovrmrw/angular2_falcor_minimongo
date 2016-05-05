import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/debounceTime';
const falcor = require('falcor');

import {Action} from './flux-action';
import {nowStateReducer,
  stateReducerPage1,
  stateReducerPage2,
  stateReducerPage3,
  stateReducerPage4} from './flux-container.reducer';

export class Container {
  private stateSubject$: Subject<AppState>;
  private falcorModel: any;

  constructor(initState: AppState, dispatcher$: Observable<Action>) {
    this.stateSubject$ = new BehaviorSubject(initState);
    this.falcorModel = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });

    Observable
      .zip<AppState>(
        nowStateReducer(initState.now, dispatcher$),
        stateReducerPage1(initState.page1, dispatcher$, this.falcorModel),
        stateReducerPage2(initState.page2, dispatcher$, this.falcorModel),
        stateReducerPage3(initState.page3, dispatcher$, this.falcorModel),
        stateReducerPage4(initState.page4, dispatcher$, this.falcorModel),
        (now, statePage1, statePage2, statePage3, statePage4) => {
          return {
            now: now,
            page1: statePage1,
            page2: statePage2,
            page3: statePage3,
            page4: statePage4
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
