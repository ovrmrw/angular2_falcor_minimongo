import {Observable} from 'rxjs/Observable';
import {ActionTypeAll, ActionTypePage1, } from './flux-action';
import {NextNow, NextMessageFromFalcorForPage1} from './flux-action';
import 'rxjs/add/operator/scan';

import { getValueFromJsonGraph } from '../app/falcor-utils';

// 現在日時を更新するReducer。
export function nowStateReducer(initState: number, dispatcher$: Observable<ActionTypeAll>): Observable<number> {
  return dispatcher$.scan<number>((datetime: number, action: ActionTypeAll) => {
    if (action instanceof NextNow) {
      return action.datetime;
    } else {
      return datetime; 
    }
  }, initState);
}

// Falcorを通してデータを取得するReducer。戻り値がObservable<Promise<any>>になるのが特徴。
export function messagePage1StateReducer(initState: Promise<string>, dispatcher$: Observable<ActionTypePage1>, falcorModel: any): Observable<Promise<string>> {
  return dispatcher$.scan<Promise<string>>((message: Promise<string>, action: ActionTypePage1) => {
    if (action instanceof NextMessageFromFalcorForPage1) {
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