const falcor = require('falcor');

// 階層構造のオブジェクトから指定した階層を取り出し、$__pathプロパティを除去して配列化して返す。
export function getArrayFromJsonGraph(targetObject: {}, targetLayerArray: any[], alt: {}[] = []): {}[] {
  try {
    const object = targetLayerArray.reduce((result, property) => {
      if (property in result) {
        return result[property];
      }
      return result;
    }, targetObject) as {};

    const array = falcor.keys(object).reduce((result, key) => {
      result.push(object[key]);
      return result;
    }, []) as {}[];

    return array;

  } catch (err) {
    return alt;
  }
}

// 階層構造のオブジェクトから指定した階層の値を取り出して返す。
export function getValueFromJsonGraph(targetObject: {}, targetLayerArray: any[], alt: any = null): any {
  try {
    const value = targetLayerArray.reduce((result, property) => {
      if (property in result) {
        return result[property];
      }
      return result;
    }, targetObject) as any;

    return value;
    
  } catch (err) {
    return alt;
  }
}