import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppPageParent} from '../app/app-page-parent';
import {AppModal} from '../app/app-modal.component';
import {getArrayFromJsonGraph} from '../app/falcor-utils';
import lodash from 'lodash';
// import falcor from 'falcor'; // const falcor = require('falcor');
declare var jQuery: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

import {Action, NextNow, NextDocumentsFromFalcorPage3} from '../flux/flux-action';
import {Container} from '../flux/flux-container';
import {Dispatcher} from '../flux/flux-di';

const componentSelector = 'my-page3';
@Component({
  selector: componentSelector,
  template: `
    <div class="row">
      <div class="col s12">
        <h4>Falcor sample Page3</h4>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <input id="searchWord" [(ngModel)]="searchWord" type="text" class="validate">
        <label for="searchWord">Search Word</label>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <table class="bordered">
          <thead>
            <tr>
              <th>FirstName</th>
              <th>LastName</th>
              <th>Gender</th>
              <th>Birthday</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let document of (stateByPush | async | async)?.documents">
              <td>{{ document['name.first'] }}</td>
              <td>{{ document['name.last'] }}</td>
              <td>{{ document.gender }}</td>
              <td>{{ document.birthday }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <my-modal [texts]="modalTexts" [now]="nowByPush | async"></my-modal>
  `,
  directives: [AppModal],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPage3 extends AppPageParent implements OnInit {
  // 以下のstatic変数(及びgetter/setter)はページ遷移しても値が失われない。
  static _searchWord: string = '';
  get searchWord() { return AppPage3._searchWord; }
  set searchWord(word: string) { AppPage3._searchWord = word; }

  // nowByObservable: number; // Observableイベントハンドラによって値が代入される。
  get nowByPush() {
    // 戻り値がObservable<any>なのでtemplateでasyncパイプを1回通すこと。
    return this.container.state$.map(appState => {
      return appState.now;
    });
  }
  get stateByPush() {
    // 戻り値がObservable<Promise<any>>なのでtemplateでasyncパイプを2回通すこと。
    return this.container.state$.map(appState => {
      return appState.page3;
    });
  }

  // ページ遷移で入る度に呼び出される。
  constructor(
    private dispatcher$: Dispatcher<Action>,
    private container: Container
  ) {
    super(componentSelector);
  }
  ngOnInit() {
    super.ngOnInit();
    this.loadJsonGraph();
    document.getElementById('searchWord').focus();
  }

  // 以下2つのinitializable関数は親クラスから呼び出される初期化専用の関数。
  initializableJQueryPlugins(): void {
    jQuery(`${componentSelector} .modal-trigger`).leanModal();
  }
  initializableEventObservables(): void {
    this.disposableSubscription = Observable.fromEvent<KeyboardEvent>(document.getElementById('searchWord'), 'keyup')
      // .debounce(() => Observable.timer(1000)) // イベントストリームが1秒間途切れるのを待つ。
      .subscribe(() => {
        this.loadJsonGraph(); // eventからvalueを取り出さなくても既にthis.searchWordの値は変わっている。
        // Materialize.toast(`Falcor query with word '${this.searchWord}' is triggered`, 2000);
      });

    this.disposableSubscription = Observable.fromEvent<MouseEvent>(document.getElementsByTagName(componentSelector), 'click')
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

  documentsByFalcor: any[]; // loadJsonGraph()のクエリ結果を格納する。
  itemsPerPage: number = 10;

  // ここからFalcorのコード。
  collection = 'names';
  //model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  loadJsonGraph() {
    this.getJsonGraph(this.searchWord, this.itemsPerPage);
  }
  getJsonGraph(keyword: string, itemsPerPage: number) {
    const queryName = 'query3';

    // this.model // this.modelは親クラスで定義されている。
    //   .get([queryName, this.collection, keyword, { from: 0, length: itemsPerPage }, ['name.first', 'name.last', 'gender', 'birthday']])
    //   .then(jsonGraph => {
    //     console.log(JSON.stringify(jsonGraph, null, 2)); // Falcorから返却されるJSON Graphを確認。
    //     this.documentsByFalcor = getArrayFromJsonGraph(jsonGraph, ['json', queryName, this.collection, keyword], []);
    //     console.log(this.documentsByFalcor); // tableに描画するための配列を確認。
    //   });
    this.dispatcher$.next(new NextDocumentsFromFalcorPage3(
      [queryName, this.collection, keyword, { from: 0, length: itemsPerPage }, ['name.first', 'name.last', 'gender', 'birthday']],
      [queryName, this.collection, keyword])
    );
  }

  // ここからモーダルウインドウのテキスト。
  modalTexts = [
    'Search Word欄に文字を入力するとFalcorの検索クエリが発行され、"name.first"プロパティで絞り込みをします。正規表現で入力できます。',
    '例えば ber と ^ber では検索結果が違いますね？',
    'Search Wordを入力して1秒経過すると検索が実行されます。この時間をもう少し長くしたり短くしたりすることはできますか？',
    '検索対象がたくさんあったとしても10件までしか取得しません。この件数をもっと増やすことはできますか？',
    'コンソールをよく観察してください。まるで "そういう構造のJSON" がそこにあって、それをただ引っ張ってきているだけのようではないですか？',
    '実際にはFalcorがクエリを受け取ってからルート定義の中で "そういう構造のJSON" を構築して返却しているのです。',
    '"name.first"プロパティではなく他のプロパティ、例えば"gender"で絞り込みをするにはソースコードのどこを変更すれば良いかわかりますか？少なくとも app-page3.component.ts ではありません。',
    'このテンプレートのテーブル定義(app-page3.component.ts)を見てください。少し変更するだけでもかなりの作業が必要になりますね。どう改善すれば良いかわかりますか？ Page4ではこの問題の解決に取り組んでいます。',
  ];
}