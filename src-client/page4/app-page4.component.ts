import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppPageParent} from '../app/app-page-parent';
import {AppPage4Table} from './app-page4-table.component';
import {AppModal} from '../app/app-modal.component';
import {getArrayFromJsonGraph, getValueFromJsonGraph} from '../app/falcor-utils';
import lodash from 'lodash';
// import falcor from 'falcor'; // const falcor = require('falcor');
import {serializeQueryObjectForFalcor} from '../../src-middle/falcor-json-serializer';
declare var jQuery: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

import {Action, NextNow, NextDocumentsFromFalcorPage4} from '../flux/flux-action';
import {Container} from '../flux/flux-container';
import {Dispatcher} from '../flux/flux-di';

const COMPONENT_SELECTOR = 'my-page4';
@Component({
  selector: COMPONENT_SELECTOR,
  template: `
    <div class="row">
      <div class="col s12">
        <h4>Falcor sample Page4</h4>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s6">
        <input id="condition" [(ngModel)]="condition" type="text" class="validate">
        <label for="condition">Condition Path</label>
      </div>
      <div class="input-field col s6">
        <input id="searchWord" [(ngModel)]="searchWord" type="text" class="validate">
        <label for="searchWord">Search Word</label>
      </div>
    </div>
    
    <my-complicated-table [fields]="fields" [aliases]="aliases" [aligns]="aligns" [documents]="documentsByPush"
      [totalItems]="totalItemsByPush" [itemsPerPage]="itemsPerPage" [currentPage]="currentPageByObservable"></my-complicated-table>
      
    <my-modal [texts]="modalTexts" [now]="nowByPush | async"></my-modal>
  `,
  directives: [AppPage4Table, AppModal],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPage4 extends AppPageParent implements OnInit {
  // 以下2つのstatic変数(及びgetter/setter)はページ遷移しても値が失われない。
  static _condition: string = 'name.first';
  get condition() { return AppPage4._condition; }
  set condition(condition: string) { AppPage4._condition = condition; }
  static _searchWord: string = '';
  get searchWord() { return AppPage4._searchWord; }
  set searchWord(word: string) { AppPage4._searchWord = word; }

  // nowByPush: number; // Observableイベントハンドラによって値が代入される。
  get nowByPush() {
    return this.container.state$.map(appState => {
      return appState.now;
    });
  }
  private documentsByPush: {}[];
  private totalItemsByPush: number;
  subscribeState() {
    // Promiseではなく直接値を取得しておかないとページネーションの動作がおかしくなる。(不必要に表示が一瞬消える)
    // subscribeの中でPromiseをthenして値を取得する場合はエラーを発生させないようにinstanceofのチェックを入れている。
    // エラーを発生させるとChangeDetectionがちゃんと変更検知してくれない。
    this.container.state$.map(appState => {
      return appState.page4;
    }).subscribe(page4 => {
      if (page4 instanceof Promise)
        page4.then(s => {
          this.documentsByPush = s.documents;
          this.totalItemsByPush = s.totalItems;
        });
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
    this.subscribeState();
    this.loadJsonGraph();
    document.getElementById('condition').focus();
  }

  // 以下2つのinitializable関数は親クラスから呼び出される初期化専用の関数。
  initializableJQueryPlugins(): void {
    jQuery(`${COMPONENT_SELECTOR} .modal-trigger`).leanModal();
  }
  initializableEventObservables(): void {
    // 2つのinputエレメントの入力を束ねて(mergeして)listenしています。
    this.disposableSubscription = Observable.fromEvent<KeyboardEvent>(document.getElementById('searchWord'), 'keyup')
      .merge(Observable.fromEvent<KeyboardEvent>(document.getElementById('condition'), 'keyup'))
      // .debounce(() => Observable.timer(1000)) // イベントストリームが1秒間途切れるのを待つ。
      .subscribe(() => {
        this.currentPageByObservable = 1;
        this.loadJsonGraph(); // eventからvalueを取り出さなくても既にthis.searchWordの値は変わっている。
        // Materialize.toast(`Falcor query with word '${this.searchWord}' in '${this.condition}' is triggered`, 2000);
      });

    // app-page4-table.component.ts で定義されたカスタムイベントの発火をこのObservableがlistenする。
    this.disposableSubscription = Observable.fromEvent<CustomEvent>(document.getElementsByTagName('my-complicated-table'), 'emitTargetPage')
      .do(event => event.stopPropagation()) // CustomEventの伝播をここで止める。cancelableをtrueにしなくても止められる。
      .map(event => event.detail as number)
      .subscribe(targetPage => {
        this.currentPageByObservable = targetPage;
        this.loadJsonGraph();
      });

    this.disposableSubscription = Observable.fromEvent<MouseEvent>(document.getElementsByTagName(COMPONENT_SELECTOR), 'click')
      .map(event => event.target.textContent)
      .filter(text => text.trim().length > 0)
      .subscribe(text => {
        Materialize.toast(`You clicked "${text}"`, 300);
      });

    this.disposableSubscription = Observable.timer(1, 1000) // 開始1ms後にスタートして、その後1000ms毎にストリームを発行する。
      .subscribe(() => {
        // this.nowByPush = lodash.now();
        this.dispatcher$.next(new NextNow(lodash.now()));
      });
  }

  // 以下7つのプロパティは<my-complicated-table>に渡す。
  fields: string[] = ['name.first, name.last', 'gender', 'birthday', 'contact.phone.0', 'contact.email.0', 'contact.address.street, contact.address.city, contact.address.state'];
  aliases: string[] = ['name', null, null, 'phone', 'email', 'address'];
  aligns: string[] = [null, 'center', null, null, null, 'right'];
  // documentsByFalcor: any[]; // loadJsonGraph()のクエリ結果を格納する。
  // totalItemsByFalcor: number = 0; // loadJsonGraph()のクエリ結果を格納する。
  currentPageByObservable: number = 1; // Observableイベントハンドラによって値が代入される。
  itemsPerPage: number = 10;

  // ここからFalcorのコード。
  //model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  loadJsonGraph() {
    this.getJsonGraph(this.condition, this.searchWord, (this.currentPageByObservable - 1) * this.itemsPerPage, this.itemsPerPage);
  }
  getJsonGraph(condition: string, keyword: string, from: number = 0, length: number = 10) {
    const queryName = 'query4';
    const queryJson = serializeQueryObjectForFalcor<QueryParamsForQuery4>({
      collection: 'names',
      condition: condition,
      keyword: keyword
    });

    // this.model // this.modelは親クラスで定義されている。
    //   .get([queryName, queryJson, { from: from, length: length }, [...this.fields, 'totalItems']])
    //   .then(jsonGraph => {
    //     console.log(JSON.stringify(jsonGraph, null, 2)); // Falcorから返却されるJSON Graphを確認。        
    //     this.documentsByFalcor = getArrayFromJsonGraph(jsonGraph, ['json', queryName, queryJson], []);
    //     this.totalItemsByFalcor = getValueFromJsonGraph(jsonGraph, ['json', queryName, queryJson, from, 'totalItems'], 0);
    //     console.log(this.documentsByFalcor); // tableに描画するための配列を確認。

    //     // 次のページがある場合はプリロードしてキャッシュしておく。これにより次のページに遷移したときはキャッシュから読み込まれる。
    //     // この例ではわかりやすくするため敢えて1ページ目を表示したときだけ2ページ目のプリロードをする。(from === 0を外せば2ページ目以降もプリロードが動く)
    //     if (from === 0 && this.totalItemsByFalcor > from + length) {
    //       this.model
    //         .get([queryName, queryJson, { from: from + length, length: length }, [...this.fields, 'totalItems']])
    //         .then(() => { });
    //     }
    //   });
    this.dispatcher$.next(new NextDocumentsFromFalcorPage4(
      [queryName, queryJson, { from: from, length: length }, [...this.fields, 'totalItems']],
      [queryName, queryJson],
      [queryName, queryJson, from, 'totalItems']
    ));
  }

  // ここからモーダルウインドウのテキスト。
  modalTexts = [
    'Search Word欄に文字を入力するとFalcorの検索クエリが発行されます。正規表現で入力できます。',
    'Condition Path欄に入力されたパスが検索対象となります。',
    '例えばCondition Pathを "name.last" にしてみてください。 "name.first" のときとは結果が違いますね？',
    '例えば ニューヨーク州 に住んでいる人だけを検索したい場合、どうすればいいかわかりますか？',
    '(ブラウザのコンソールとサーバーサイドのコンソールをよく観察すればきっと答えがわかります)',
    '例えば 1月生まれ の人だけを検索したい場合、どうすればいいかわかりますか？',
    '例えば 男性 だけを検索したい場合、どうすればいいかわかりますか？',
    '(正規表現で入力できるということを思い出してください)',
    'ブラウザの表示は更新されているのにサーバーサイドのコンソールは更新されないときがありますね。どういうときですか？',
    '2ページ目を表示したとき、サーバーサイドのコンソールは更新されません。なぜでしょうか？',
    'テーブルとページネーションのコンポーネント定義は app-page4-table.component.ts に書いてあります。',
    'my-complicated-tableタグのコードは理解が難しいかもしれませんが、一度わかると実に合理的な処理をしていることが読み取れると思います。',
    '1ページに表示される件数を100件や1000件に増やすことはできますか？',
    'aliases という変数が app-page4.component.ts の中にあります。これは何のためにありますか？これが全てnullだと表示結果はどう変わりますか？',
    'aligns という変数が app-page4.component.ts の中にあります。これは何のためにありますか？これが全てnullだと表示結果はどう変わりますか？',
    '例えば テーブルに"趣味の列"を追加したいとき、ソースコードのどこを変更すれば良いかわかりますか？',
  ];
}