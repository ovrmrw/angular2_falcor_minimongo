///////////////////////////////////////////////////
// Electronのレンダラプロセスでrequire('remote')をSystem._nodeRequire('remote')と書くため
declare interface System {
  _nodeRequire: (module: string) => any;
}
