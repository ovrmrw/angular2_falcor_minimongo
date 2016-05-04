import lodash from 'lodash';
const flatten = require('flat');
import Router from 'falcor-router'; // const Router = require('falcor-router');
import {deserializeQueryJsonForFalcor} from './falcor-json-serializer';

import {MinimongoFactory} from '../src-server/minimongo-factory';
const db = new MinimongoFactory().getDatabase(); // getDatabase()のときにDBがシングルトンで生成される。

let routes = []; // routeをどんどんpushしてRouter.createClass()の引数にする。

// Router.createClassと同じファイルにrouteの定義を書かないと動作しない？

const doubleLine = '='.repeat(10);

// Page1のクエリで使うルート定義
routes.push({
  route: "query1", // (1)
  get: (pathSet: any): any[] => {
    console.log(`${doubleLine} query1 ${doubleLine}`);
    console.log(pathSet);
    // pathSet[0] === 'query1'
    let results = [];

    results.push({
      path: pathSet, // (2) ['query1']
      value: `Can you find in where this message be written?`
    });
    console.log('falcor route result: ' + JSON.stringify(results));
    return results; // (2)のpathが(1)のrouteと一致する構造であれば結果がreturnされる。
  }
});

// Page2のクエリで使うルート定義
routes.push({
  route: "query2[{keys:keyword}]", // (1)
  get: (pathSet: any): any[] => {
    console.log(`${doubleLine} query2[{keys:keyword}] ${doubleLine}`);
    console.log(pathSet);
    // pathSet[0] === 'query2'
    const keyword = pathSet.keyword[0] as string;
    let results = [];

    results.push({
      path: pathSet, // (2) ['query2', ['Falcor']] (keywordがFaclorのとき)
      value: `Hello, ${keyword}.`
    });
    console.log('falcor route result: ' + JSON.stringify(results));
    return results; // (2)のpathが(1)のrouteと一致する構造であれば結果がreturnされる。
  }
});

// Page3のクエリで使うルート定義
routes.push({
  route: "query3[{keys:collection}][{keys:keyword}][{integers:range}]['name.first','name.last','gender','birthday']",
  get: (pathSet: any): any[] => {
    console.log(`${doubleLine} query3[{keys:collection}][{keys:keyword}][{integers:range}]['name.first','name.last','gender','birthday'] ${doubleLine}`);
    console.log(pathSet);
    const queryName = pathSet[0] as string;
    const collection = pathSet.collection[0] as string;
    const keyword = pathSet.keyword[0] as string;
    const range = pathSet.range as number[];
    const fields = pathSet[4] as string[]; // ['name.first','name.last','gender','birthday']
    let results = [];

    if (keyword.length > 0) {
      db[collection].find({ 'name.first': new RegExp(keyword, 'i') }, {})
        .fetch((responses: any[]) => {
          range.forEach(i => {
            if (i < responses.length) {
              const res = responses[i];
              const flattenRes = flatten(res); // 階層構造を持つJSONツリーをフラットに変換。
              fields.forEach(field => {
                const value = flattenRes[field];
                results.push({
                  path: [queryName, collection, keyword, i, field],
                  value: value
                });
              });
            }
          });
        });
    }
    //console.log('falcor route result: ' + JSON.stringify(results)); // コンソールが見にくくなるのでコメントアウト。
    return results;
  }
});

// Page4のクエリで使うルート定義
routes.push({
  route: "query4[{keys:queryJson}][{integers:range}][{keys:fields}]",
  get: (pathSet: any): any[] => {
    console.log(`${doubleLine} query4[{keys:queryJson}][{integers:range}][{keys:fields}] ${doubleLine}`);
    console.log(pathSet);
    const queryName = pathSet[0] as string;
    const queryJson = pathSet.queryJson[0] as string;
    const {collection, condition, keyword} = deserializeQueryJsonForFalcor<QueryParamsForQuery4>(queryJson);
    const range = pathSet.range as number[];
    const fields = pathSet.fields as string[];
    let results = [];
    let totalItems = 0;

    if (keyword.length > 0) {
      db[collection].find({ [condition]: new RegExp(keyword, 'i') }, {})
        .fetch((responses: any[]) => {
          totalItems = responses.length;
          range.forEach(i => {
            if (i < responses.length) {
              const res = responses[i];
              const flattenRes = flatten(res); // 階層構造を持つJSONツリーをフラットに変換。
              fields.forEach(field => {
                let value: any;
                if (field.indexOf(',') > -1) {
                  const joinableArray = field.split(',').reduce((result, fieldChild) => {
                    result.push(flattenRes[fieldChild.trim()]);
                    return result;
                  }, []);
                  value = joinableArray.join(', ');
                } else {
                  value = flattenRes[field];
                }
                results.push({
                  path: [queryName, queryJson, i, field],
                  value: value
                });
              });
            }
          });
        });
    }
    results.push({
      path: [queryName, queryJson, lodash.min(range), 'totalItems'], // totalItemsプロパティに…
      value: totalItems // 検索されたドキュメントがいくつあったか代入する。
    });
    //console.log('falcor route result: ' + JSON.stringify(results)); // コンソールが見にくくなるのでコメントアウト。
    return results;
  }
});

export const MinimongoFalcorRouter = Router.createClass(routes);