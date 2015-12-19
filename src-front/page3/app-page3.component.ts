import {Component} from 'angular2/core'
import {OnDeactivate} from 'angular2/router'
import {Observable} from 'rxjs/Observable'
import {AppPageParent} from '../app/app-page-parent'
import _ from 'lodash'
const falcor = require('falcor');
declare var $: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

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
            <tr *ngFor="#document of documentsByFalcor">
              <td>{{ document['name.first'] }}</td>
              <td>{{ document['name.last'] }}</td>
              <td>{{ document.gender }}</td>
              <td>{{ document.birthday }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <!-- Modal Trigger -->
        <a class="waves-effect waves-light btn modal-trigger" href="#modal1">explanation</a>
        <!-- Modal Structure -->
        <div id="modal1" class="modal">
          <div class="modal-content">
            <h4>説明</h4>
            <p>Search Word欄に文字を入力するとFalcorの検索クエリが発行され、"name.first"プロパティで絞り込みをします。正規表現で入力できます。</p>
            <p>例えば ber と ^ber では検索結果が違いますね？</p>
            <p>検索対象がたくさんあったとしても10件までしか取得しません。ページネーションはPage4で実装します。</p>
            <p>コンソールをよく観察してください。まるで "そういう構造のJSON" がそこにあって、それをただ引っ張ってきているかのようではないですか？</p>
            <p>実際にはFalcorがクエリを受け取ってからルート定義の中で "そういう構造のJSON" を構築して返却しているのです。</p>
            <p>このテンプレートのテーブル定義を見てください。少し変更するだけでもかなりの作業が必要になりますね。Page4ではこの問題の解決に取り組んでいます。</p>      
            <h5>{{nowByObservable | date:'yyyy-MM-dd HH:mm:ss'}}</h5>
          </div>
          <div class="modal-footer">
            <a class=" modal-action modal-close waves-effect waves-green btn-flat">OK</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppPage3 extends AppPageParent implements OnDeactivate {
  // 以下のstatic変数(及びgetter/setter)はページ遷移しても値が失われない。
  static _searchWord: string = '';
  get searchWord() { return AppPage3._searchWord; }
  set searchWord(word: string) { AppPage3._searchWord = word; }

  nowByObservable: number; // Observableイベントハンドラによって値が代入される。
  
  // ページ遷移で入る度に呼び出される。
  constructor() {
    super(componentSelector);
    this.loadJsonGraph();
    document.getElementById('searchWord').focus();
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
    this.disposableSubscription = Observable.fromEvent<KeyboardEvent>(document.getElementById('searchWord'), 'keyup')
      .debounce(() => Observable.timer(1000)) // イベントストリームが1秒間途切れるのを待つ。
      .subscribe(() => {
        this.loadJsonGraph(); // eventからvalueを取り出さなくても既にthis.searchWordの値は変わっている。
        Materialize.toast(`Falcor query with word '${this.searchWord}' is triggered`, 2000);
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

  documentsByFalcor: any[]; // loadJsonGraph()のクエリ結果を格納する。
  itemsPerPage: number = 10;  
  
  // ここからFalcorのコード。
  collection = 'names';
  model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  getJsonGraph(keyword: string, itemsPerPage: number) {
    this.model
      .get([this.collection, keyword, { from: 0, length: itemsPerPage }, ['name.first', 'name.last', 'gender', 'birthday']])
      .then(jsonGraph => { // subscribe()だと動作がおかしくなる。
        console.log(JSON.stringify(jsonGraph, null, 2)); // Falcorから返却されるJSON Graphを確認。
        this.documentsByFalcor = jsonGraph ? _.toArray(jsonGraph.json[this.collection][keyword]) : [];
        console.log(this.documentsByFalcor); // tableに描画するための配列を確認。
      });
  }
  loadJsonGraph() {
    this.getJsonGraph(this.searchWord, this.itemsPerPage);
  }
}