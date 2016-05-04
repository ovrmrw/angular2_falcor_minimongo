import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppPageParent} from '../app/app-page-parent';
import {AppModal} from '../app/app-modal.component';
import {getValueFromJsonGraph} from '../app/falcor-utils';
import lodash from 'lodash';
// import falcor from 'falcor'; // const falcor = require('falcor');
declare var jQuery: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

import {Action, NextNow, NextMessageFromFalcorPage2} from '../flux/flux-action';
import {Container} from '../flux/flux-container';
import {Dispatcher} from '../flux/flux-di';

const COMPONENT_SELECTOR = 'my-page2'
@Component({
  selector: COMPONENT_SELECTOR,
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
        <h3>{{messageByPush | async | async}}</h3>
      </div>
    </div>
    <my-modal [texts]="modalTexts" [now]="nowByPush | async"></my-modal>
  `,
  directives: [AppModal],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPage2 extends AppPageParent implements OnInit {
  // 以下のstatic変数(及びgetter/setter)はページ遷移しても値が失われない。
  static _keyword: string = 'Falcor';
  get keyword() { return AppPage2._keyword; }
  set keyword(keyword: string) { AppPage2._keyword = keyword; }

  // nowByObservable: number; // Observableイベントハンドラによって値が代入される。
  // messageByFalcor: string; // loadJsonGraph()のクエリ結果を格納する。
  get nowByPush() {
    return this.container.state$.map(state => {
      return state.nowByPush;
    });
  }
  get messageByPush() {
    // 戻り値がObservable<Promise<string>>なのでtemplateではasyncパイプを2回通すこと。
    // 1回目のasyncパイプでobservableをsubscribeし、2回目のasyncパイプでpromiseをthenする。
    return this.container.state$.map(state => {
      return state.page2.messageByPush;
    });
  }

  // ページ遷移で入る度に呼び出される。
  constructor(
    private dispatcher$: Dispatcher<Action>,
    private container: Container
  ) {
    super(COMPONENT_SELECTOR);
  }
  ngOnInit() {
    super.ngOnInit();
    this.loadJsonGraph();
    document.getElementById('keyword').focus();
  }

  // 以下2つのinitializable関数は親クラスから呼び出される初期化専用の関数。
  initializableJQueryPlugins(): void {
    jQuery(`${COMPONENT_SELECTOR} .modal-trigger`).leanModal();
  }
  initializableEventObservables(): void {
    this.disposableSubscription = Observable.fromEvent<KeyboardEvent>(document.getElementById('keyword'), 'keyup')
      // .debounce(() => Observable.timer(1000)) // イベントストリームが1秒間途切れるのを待つ。
      .subscribe(() => {
        this.loadJsonGraph(); // eventからvalueを取り出さなくても既にthis.keywordの値は変わっている。
        // Materialize.toast(`Falcor query with word '${this.keyword}' is triggered`, 2000);
      });

    this.disposableSubscription = Observable.fromEvent<MouseEvent>(document.getElementsByTagName(COMPONENT_SELECTOR), 'click')
      .map(event => event.target.textContent)
      .filter(text => text.trim().length > 0)
      .subscribe(text => {
        Materialize.toast(`You clicked "${text}"`, 300);
      });

    this.disposableSubscription = Observable.timer(1, 1000) // 開始1ms後にスタートして、その後1000ms毎にストリームを発行する。
      .subscribe(() => {
        // this.nowByObservable = lodash.now();
        this.dispatcher$.next(new NextNow(lodash.now()));
      });
  }

  // ここからFalcorのコード。
  //model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  getJsonGraph(keyword: string) {
    const queryName = 'query2';

    // this.model // this.modelは親クラスで定義されている。
    //   .get([queryName, keyword])
    //   .then(jsonGraph => {
    //     console.log(JSON.stringify(jsonGraph, null, 2)); // Falcorから返却されるJSON Graphを確認。
    //     this.messageByFalcor = getValueFromJsonGraph(jsonGraph, ['json', queryName, keyword], '?????');
    //   });
    this.dispatcher$.next(new NextMessageFromFalcorPage2([queryName, keyword]));
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