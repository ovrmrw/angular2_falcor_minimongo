import {Component} from 'angular2/core'
import {OnDeactivate} from 'angular2/router'
import {Observable} from 'rxjs/Observable'
import {AppPageParent} from '../app/app-page-parent'
import {AppModal} from '../app/app-modal.component'
import _ from 'lodash'
const falcor = require('falcor');
declare var $: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

const componentSelector = 'my-page2'
@Component({
  selector: componentSelector,
  template: `
    <div class="row">
      <div class="col s12">
        <h4>Falcor sample Page2</h4>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <input id="keyword" [(ngModel)]="keyword" type="text" class="validate">
        <label for="keyword">Keyword</label>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <h3>{{messageByFalcor}}</h3>
      </div>
    </div>
    <my-modal [texts]="modalTexts" [now]="nowByObservable"></my-modal>
  `,
  directives: [AppModal]
})
export class AppPage2 extends AppPageParent implements OnDeactivate {
  // 以下のstatic変数(及びgetter/setter)はページ遷移しても値が失われない。
  static _keyword: string = 'Falcor';
  get keyword() { return AppPage2._keyword; }
  set keyword(keyword: string) { AppPage2._keyword = keyword; }

  nowByObservable: number; // Observableイベントハンドラによって値が代入される。
  messageByFalcor: string; // loadJsonGraph()のクエリ結果を格納する。
  
  // ページ遷移で入る度に呼び出される。
  constructor() {
    super(componentSelector);
    this.loadJsonGraph();
    document.getElementById('keyword').focus();
  }
  // ページ遷移で出る度に呼び出される。
  routerOnDeactivate() {
    super.routerOnDeactivate();
  }

  // 以下2つのinitializable関数は親クラスから呼び出される初期化専用の関数。
  initializableJQueryPlugins(): void {
    $(`${componentSelector} .modal-trigger`).leanModal();
  }
  initializableEventObservables(): void {
    this.disposableSubscription = Observable.fromEvent<KeyboardEvent>(document.getElementById('keyword'), 'keyup')
      .debounce(() => Observable.timer(1000)) // イベントストリームが1秒間途切れるのを待つ。
      .subscribe(() => {
        this.loadJsonGraph(); // eventからvalueを取り出さなくても既にthis.keywordの値は変わっている。
        Materialize.toast(`Falcor query with word '${this.keyword}' is triggered`, 2000);
      });

    this.disposableSubscription = Observable.fromEvent<MouseEvent>(document.getElementsByTagName(componentSelector), 'click')
      .map(event => event.target.textContent)
      .filter(text => _.trim(text).length > 0)
      .subscribe(text => {
        Materialize.toast(`You clicked "${text}"`, 300);
      });

    this.disposableSubscription = Observable.timer(1, 1000) // 開始1ms後にスタートして、その後1000ms毎にストリームを発行する。
      .subscribe(() => {
        this.nowByObservable = _.now();
      });
  }

  // ここからFalcorのコード。
  model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  getJsonGraph(keyword: string) {
    this.model
      .get(['hoge', 'foo', 'bar', keyword])
      .then(jsonGraph => { // subscribe()だと動作がおかしくなる。
        console.log(JSON.stringify(jsonGraph, null, 2));
        this.messageByFalcor = jsonGraph ? jsonGraph.json.hoge.foo.bar[keyword] : '?????';
      });
  }
  loadJsonGraph() {
    this.getJsonGraph(this.keyword);
  }
  
  // ここからモーダルウインドウのテキスト。
  modalTexts = [
    'Page2ではKeyword欄に文字を入力するとFalcorのクエリが発行されて画面のメッセージが更新されます。いわゆるFalcor版Hello Worldですね。',
    'Keywordが空欄になるとFalcorは"Pathの解決"(JSON Graphの生成)ができなくなり正常動作しません。',
    'Keywordを数字だけにしても正常動作しません。それがなぜだかなんとなくでもわかりますか？ ',
    'FalcorではJSON Graphという概念がとても重要です。それが全てと言ってもいいぐらいです。よくわからないうちは、「JSONの構造を要求したらその構造が返ってくる」ぐらいに考えておけばいいかもしれません。',
    'Helloだけでは味気ないですね。もう少し言葉を追加してみましょう。ソースコードのどこを変更すれば良いかわかりますか？',
    'Keywordを色々変えながらクライアントサイド(ブラウザ)のコンソールとサーバーサイドのコンソールをよく観察してみてください。サーバーサイドから出力されたものが少し変換されてクライアントサイドに届きます。',
    'このモーダル画面に時刻が表示されていますね。どうやってこの表示を更新しているかわかりますか？時刻の更新を1秒毎ではなく5秒毎や10秒毎に変えることはできますか？'
  ];
}