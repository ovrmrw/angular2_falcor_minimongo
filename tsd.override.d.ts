///////////////////////////////////////////////////
// import xxx from 'xxx' の構文が書けるようにオーバーライド
declare module "lodash" {
  export default _;
}

declare module 'moment' {
  export default moment;
}

declare module "numeral" {
  export default numeral;
}

declare module "prominence" {
  var prominence: any;
  export default prominence;
}

declare module 'd3' {
    export default d3;
}

declare module "jquery" {
    export default $;
}

// Expressはexpress.d.tsの最後を直接書き換える。
// Sequelizeはsequelize.d.tsの最後を直接書き換える。

///////////////////////////////////////////////////
// Electronのレンダラプロセスでrequire('remote')をSystem._nodeRequire('remote')と書くため
declare interface System {
  _nodeRequire: (module: string) => any;
}
