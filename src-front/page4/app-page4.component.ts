import {Component} from 'angular2/core'
import {OnDeactivate} from 'angular2/router'
import {Observable} from 'rxjs/Observable'
import {AppPageParent} from '../app/app-page-parent'
import {AppPage4Table} from './app-page4-table.component'
import _ from 'lodash'
const falcor = require('falcor');
declare var $: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

const componentSelector = 'my-page4';
@Component({
  selector: componentSelector,
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
    <div class="row">
      <div class="col s12">
        <my-complicated-table [fields]="fields" [aliases]="aliases" [aligns]="aligns" [documents]="documentsByFalcor"
          [totalItems]="totalItemsByFalcor" [itemsPerPage]="itemsPerPage" [currentPage]="currentPageByObservable"></my-complicated-table>
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
            <p>Search Word欄に文字を入力するとFalcorの検索クエリが発行されます。正規表現で入力できます。</p>
            <p>Condition Path欄に入力されたパスが検索対象となります。</p>
            <p>例えばCondition Pathを "name.last" にしてみてください。 "name.first" のときとは結果が違いますね？</p>
            <p>例えば ニューヨーク州 に住んでいる人だけを検索したい場合、どうすればいいかわかりますか？</p>
            <p>(ブラウザのコンソールとサーバーサイドのコンソールをよく観察すればきっと答えがわかります)</p>
            <p>例えば 1月生まれ の人だけを検索したい場合、どうすればいいかわかりますか？</p>
            <p>例えば 男性 だけを検索したい場合、どうすればいいかわかりますか？</p>
            <p>(正規表現で入力できるということを思い出してください)</p>
            <p>ブラウザの表示は更新されているのにサーバーサイドのコンソールは更新されないときがありますね。どういうときですか？</p>  
            <p>テーブルとページネーションのコンポーネント定義は app-page4-table.component.ts に書いてあります。</p>    
            <p>my-complicated-tableタグのコードは理解が難しいかもしれませんが、一度わかると実に合理的な処理をしていることが読み取れると思います。</p>
            <p>例えば テーブルに"趣味の列"を追加したいとき、ソースコードのどこを変更すれば良いかわかりますか？</p>
            <h5>{{nowByObservable | date:'yyyy-MM-dd HH:mm:ss'}}</h5>
          </div>
          <div class="modal-footer">
            <a class=" modal-action modal-close waves-effect waves-green btn-flat">OK</a>
          </div>
        </div>
      </div>
    </div>
  `,
  directives: [AppPage4Table]
})
export class AppPage4 extends AppPageParent implements OnDeactivate {
  // 以下2つのstatic変数(及びgetter/setter)はページ遷移しても値が失われない。
  static _condition: string = 'name.first';
  get condition() { return AppPage4._condition; }
  set condition(condition: string) { AppPage4._condition = condition; }
  static _searchWord: string = '';
  get searchWord() { return AppPage4._searchWord; }
  set searchWord(word: string) { AppPage4._searchWord = word; }

  nowByObservable: number; // Observableイベントハンドラによって値が代入される。
  
  // ページ遷移で入る度に呼び出される。
  constructor() {
    super(componentSelector);
    this.loadJsonGraph();
    document.getElementById('condition').focus();
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
    // 2つのinputエレメントの入力を束ねて(mergeして)listenしています。
    this.disposableSubscription = Observable.fromEvent<KeyboardEvent>(document.getElementById('searchWord'), 'keyup')
      .merge(Observable.fromEvent<KeyboardEvent>(document.getElementById('condition'), 'keyup'))
      .debounce(() => Observable.timer(1000)) // イベントストリームが1秒間途切れるのを待つ。
      .subscribe(() => {
        this.currentPageByObservable = 1;
        this.loadJsonGraph(); // eventからvalueを取り出さなくても既にthis.searchWordの値は変わっている。
        Materialize.toast(`Falcor query with word '${this.searchWord}' in '${this.condition}' is triggered`, 2000);
      });

    // app-page4-table.component.ts で定義されたカスタムイベントの発火をこのObservableがlistenする。
    this.disposableSubscription = Observable.fromEvent<CustomEvent>(document.getElementsByTagName('my-complicated-table'), 'emitTargetPage')
      .map(event => event.detail as number)
      .subscribe(targetPage => {
        this.currentPageByObservable = targetPage;
        this.loadJsonGraph();
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

  // 以下7つのプロパティは<my-complicated-table>に渡す。
  fields: string[] = ['name.first, name.last', 'gender', 'birthday', 'contact.phone.0', 'contact.email.0', 'contact.address.street, contact.address.city, contact.address.state'];
  aliases: string[] = ['name', null, null, 'phone', 'email', 'address'];
  aligns: string[] = [null, 'center', null, null, null, 'right'];
  documentsByFalcor: any[]; // loadJsonGraph()のクエリ結果を格納する。
  totalItemsByFalcor: number = 0; // loadJsonGraph()のクエリ結果を格納する。
  currentPageByObservable: number = 1; // Observableイベントハンドラによって値が代入される。
  itemsPerPage: number = 10;  
  
  // ここからFalcorのコード。
  collection = 'names';
  model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  getJsonGraph(condition: string, keyword: string, from: number = 0, length: number = 10) {
    this.model
      .get([this.collection, condition, keyword, { from: from, length: length }, this.fields.concat('totalItems')])
      .then(jsonGraph => { // subscribe()だと動作がおかしくなる。
        console.log(JSON.stringify(jsonGraph, null, 2)); // Falcorから返却されるJSON Graphを確認。
        this.documentsByFalcor = jsonGraph ? _.toArray(jsonGraph.json[this.collection][condition][keyword]) : [];
        this.totalItemsByFalcor = jsonGraph ? jsonGraph.json[this.collection][condition][keyword][from]['totalItems'] : 0;
        console.log(this.documentsByFalcor); // tableに描画するための配列を確認。
      });
  }
  loadJsonGraph() {
    this.getJsonGraph(this.condition, this.searchWord, (this.currentPageByObservable - 1) * this.itemsPerPage, this.itemsPerPage);
  }
}