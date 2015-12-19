import _ from 'lodash';
const flatten = require('flat');
const Router = require('falcor-router');

import {MinimongoFactory} from './minimongo-factory';
const db = new MinimongoFactory().getDatabase(); // getDatabase()のときにDBがシングルトンで生成される。

let routes = []; // routeをどんどんpushしてRouter.createClass()の引数にする。

// Router.createClassと同じファイルにrouteの定義を書かないと動作しない？

// Page1のクエリで使うルート定義
routes.push({
  route: "hoge", // (1)
  get: (pathSet: any): any[] => {
    console.log(`${_.repeat('=', 10)} hoge ${_.repeat('=', 10)}`);
    console.log(pathSet);
    // pathSet[0] === ['hoge']
    let results = [];

    results.push({
      path: pathSet, // (2) [['hoge']]
      value: `Can you find in where this message be written?`
    });
    console.log(JSON.stringify(results));
    return results; // (2)のpathが(1)のrouteと一致する構造であれば結果がreturnされる。
  }
});

// Page2のクエリで使うルート定義
routes.push({
  route: "hoge.foo.bar[{keys:keyword}]", // (1)
  get: (pathSet: any): any[] => {
    console.log(`${_.repeat('=', 10)} hoge.foo.bar[{keys:keyword}] ${_.repeat('=', 10)}`);
    console.log(pathSet);
    // pathSet[0] === ['hoge']
    // pathSet[1] === ['foo']
    // pathSet[2] === ['bar']
    const keyword = pathSet.keyword[0] as string;
    let results = [];

    results.push({
      path: pathSet, // (2) [['hoge','foo','bar','Falcor']] (keywordがFaclorのとき)
      value: `Hello, ${keyword}.`
    });
    console.log(JSON.stringify(results));
    return results; // (2)のpathが(1)のrouteと一致する構造であれば結果がreturnされる。
  }
});

// Page3のクエリで使うルート定義
routes.push({
  route: "[{keys:collection}][{keys:keyword}][{integers:ranges}]['name.first','name.last','gender','birthday']",
  get: (pathSet: any): any[] => {
    console.log(`${_.repeat('=', 10)} [{keys:collection}][{keys:keyword}][{integers:ranges}]['name.first','name.last','gender','birthday'] ${_.repeat('=', 10)}`);
    console.log(pathSet);
    const collection = pathSet.collection[0] as string;
    const keyword = pathSet.keyword[0] as string;
    const ranges = pathSet.ranges as number[];
    const fields = pathSet[3] as string[]; // ['name.first','name.last','gender','birthday']
    let results = [];

    if (keyword.length > 0) {
      db[collection].find({ 'name.first': new RegExp(keyword, 'i') }, {})
        .fetch((responses: any[]) => {
          ranges.forEach(i => {
            if (i < responses.length) {
              const res = responses[i];
              const flattenRes = flatten(res); // 階層構造を持つJSONツリーをフラットに変換。
              fields.forEach(field => {
                const value = flattenRes[field];
                results.push({
                  path: [collection, keyword, i, field],
                  value: value
                });
              });
            }
          });
        });
    }
    console.log(JSON.stringify(results));
    return results;
  }
});

// Page4のクエリで使うルート定義
routes.push({ 
  route: "[{keys:collection}][{keys:condition}][{keys:keyword}][{integers:ranges}][{keys:fields}]",
  get: (pathSet: any): any[] => {
    console.log(`${_.repeat('=', 10)} [{keys:collection}][{keys:condition}][{keys:keyword}][{integers:ranges}][{keys:fields}] ${_.repeat('=', 10)}`);
    console.log(pathSet);
    const collection = pathSet.collection[0] as string;
    const condition = pathSet.condition[0] as string;
    const keyword = pathSet.keyword[0] as string;
    const ranges = pathSet.ranges as number[];
    const fields = pathSet.fields as string[];
    let results = [];
    let totalItems = 0;

    if (keyword.length > 0) {
      db[collection].find({ [condition]: new RegExp(keyword, 'i') }, {})//.sort({ 'name.first': 1 }, { 'name.last': 1 })
        .fetch((responses: any[]) => {
          totalItems = responses.length;
          ranges.forEach(i => {
            if (i < responses.length) {
              const res = responses[i];
              const flattenRes = flatten(res); // 階層構造を持つJSONツリーをフラットに変換。
              fields.forEach(field => {
                let value: any;
                if (field.indexOf(',') > -1) {
                  const joinableArray = _.reduce(field.split(','), (result, fieldChild) => {
                    result.push(flattenRes[_.trim(fieldChild)]);
                    return result;
                  }, []);
                  value = joinableArray.join(', ');
                } else {
                  value = flattenRes[field];
                }
                results.push({
                  path: [collection, condition, keyword, i, field],
                  value: value
                });
              });
            }
          });
        });
    }
    results.push({
      path: [collection, condition, keyword, _.min(ranges), 'totalItems'], // totalCountプロパティに…
      value: totalItems // 検索されたドキュメントがいくつあったか代入する。
    });
    console.log(JSON.stringify(results));
    return results;
  }
});

const MinimongoFalcorRouter = Router.createClass(routes);
export {MinimongoFalcorRouter}