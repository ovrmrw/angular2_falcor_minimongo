import {Component} from 'angular2/core'
import {OnDeactivate} from 'angular2/router'
import {Observable} from 'rxjs/Observable'
import {AppPageParent} from '../app/app-page-parent'
import {AppModal} from '../app/app-modal.component'
import _ from 'lodash'
const falcor = require('falcor');
declare var $: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

const componentSelector = 'my-page1'
@Component({
  selector: componentSelector,
  template: `
    <div class="row">
      <div class="col s12">
        <h4>Falcor sample Page1</h4>
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
export class AppPage1 extends AppPageParent implements OnDeactivate {

  nowByObservable: number; // Observableイベントハンドラによって値が代入される。
  messageByFalcor: string; // loadJsonGraph()のクエリ結果を格納する。
  
  // ページ遷移で入る度に呼び出される。
  constructor() {
    super(componentSelector);
    this.loadJsonGraph();
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
  getJsonGraph() {
    this.model
      .get(['hoge'])
      .then(jsonGraph => { // subscribe()だと動作がおかしくなる。
        console.log(JSON.stringify(jsonGraph, null, 2));
        this.messageByFalcor = jsonGraph ? jsonGraph.json.hoge : '?????';
      });
  }
  loadJsonGraph() {
    this.getJsonGraph();
  }
  
  // ここからモーダルウインドウのテキスト
  modalTexts = [
    'Page1ではFalcorのクエリを発行して固定メッセージを受け取るだけです。インタラクティブ性は全くありません。',
    'Falcorを理解するにはクライアントサイド(ブラウザ)のコンソールとサーバーサイドのコンソールをよく観察してください。Page3～4では特に重要なことです。',
    '/src-server/minimongo-falcor-router.ts でFalcorがサーバーサイドで "どういうクエリに対してどういう結果を返すか" を定義しています。このルート定義は最初のうちは難解かもしれませんが一度わかると面白いように使いこなせるようになります。',
    '表示されているメッセージ(can you find ～)はどこに記述されているかわかりますか？ 探してみてください。少なくとも app-page1.component.ts の中ではありません。',
    '表示されるメッセージを変更するにはソースコードのどこを変更すれば良いかわかりますか？',
    '色々なところをクリックすると一瞬トーストが表示されますね。どこにこの制御が記述されているかわかりますか？トーストの表示時間をもう少し長くすることはできますか？またトーストを表示するのではなくコンソールにログを残すように変更することはできますか？',
  ];
}