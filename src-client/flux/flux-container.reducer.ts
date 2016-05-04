import {Observable} from 'rxjs/Observable';
import {Action} from './flux-action';
import {NextNow, NextMessageFromFalcorPage1, NextMessageFromFalcorPage2, NextDocumentsFromFalcorPage3} from './flux-action';
import 'rxjs/add/operator/scan';

import { getValueFromJsonGraph, getArrayFromJsonGraph } from '../app/falcor-utils';

// 現在日時を更新するReducer。
export function nowStateReducer(initState: number, dispatcher$: Observable<Action>): Observable<number> {
  return dispatcher$.scan((datetime: number, action: Action) => {
    if (action instanceof NextNow) {
      return action.datetime;
    } else {
      return datetime;
    }
  }, initState);
}

// Falcorを通してデータを取得するReducer。戻り値がObservable<Promise<any>>になるのが特徴。
export function messageStateReducerPage1(initState: Promise<string>, dispatcher$: Observable<Action>, falcorModel: any): Observable<Promise<string>> {
  return dispatcher$.scan((message: Promise<string>, action: Action) => {
    if (action instanceof NextMessageFromFalcorPage1) {
      return new Promise<string>(resolve => {
        falcorModel
          .get(action.falcorQuery)
          .then(jsonGraph => {
            console.log(JSON.stringify(jsonGraph, null, 2));
            const message = getValueFromJsonGraph(jsonGraph, ['json', ...action.falcorQuery], '?????') as string;
            resolve(message);
          });
      });
    } else {
      return message;
    }
  }, initState);
}

// Falcorを通してデータを取得するReducer。戻り値がObservable<Promise<any>>になるのが特徴。
export function messageStateReducerPage2(initState: Promise<string>, dispatcher$: Observable<Action>, falcorModel: any): Observable<Promise<string>> {
  return dispatcher$.scan((message: Promise<string>, action: Action) => {
    if (action instanceof NextMessageFromFalcorPage2) {
      return new Promise<string>(resolve => {
        falcorModel
          .get(action.falcorQuery)
          .then(jsonGraph => {
            console.log(JSON.stringify(jsonGraph, null, 2));
            const message = getValueFromJsonGraph(jsonGraph, ['json', ...action.falcorQuery], '?????') as string;
            resolve(message);
          });
      });
    } else {
      return message;
    }
  }, initState);
}

// Falcorを通してデータを取得するReducer。戻り値がObservable<Promise<any>>になるのが特徴。
export function documentsStateReducerPage3(initState: Promise<{}[]>, dispatcher$: Observable<Action>, falcorModel: any): Observable<Promise<{}[]>> {
  return dispatcher$.scan((message: Promise<{}[]>, action: Action) => {
    if (action instanceof NextDocumentsFromFalcorPage3) {
      return new Promise<{}[]>(resolve => {
        falcorModel
          .get(action.falcorQuery)
          .then(jsonGraph => {
            console.log(JSON.stringify(jsonGraph, null, 2));
            const documents = getArrayFromJsonGraph(jsonGraph, ['json', ...action.targetLayerArray], []);
            console.log(documents);
            resolve(documents);
          });
      });
    } else {
      return message;
    }
  }, initState);
}
