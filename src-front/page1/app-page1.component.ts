import {Component} from 'angular2/core'
import {OnDeactivate} from 'angular2/router'
import {Observable} from 'rxjs/Observable'
import {AppPageParent} from '../app/app-page-parent'
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
    <div class="row">
      <div class="col s12">
        <!-- Modal Trigger -->
        <a class="waves-effect waves-light btn modal-trigger" href="#modal1">explanation</a>
        <!-- Modal Structure -->
        <div id="modal1" class="modal">
          <div class="modal-content">
            <h4>説明</h4>
            <p>Page1ではFalcorのクエリを発行して固定メッセージを受け取るだけです。インタラクティブ性は全くありません。</p>
            <p>Falcorを理解するにはクライアントサイド(ブラウザ)のコンソールとサーバーサイドのコンソールをよく観察してください。Page3～4では特に重要なことです。</p>
            <p>/src-server/minimongo-falcor-router.ts でFalcorがサーバーサイドで "どういうクエリに対してどういう結果を返すか" を定義しています。
            このルート定義は最初のうちは難解かもしれませんが一度わかると面白いように使いこなせるようになります。</p>
            <p>表示されているメッセージ(can you find ～)はどこに記述されているかわかりますか？ 探してみてください。少なくとも app-page1.component.ts の中ではありません。</p>
            <p>色々なところをクリックすると一瞬トーストが表示されますね。どこにこの制御が記述されているかわかりますか？トーストの表示時間をもう少し長くすることはできますか？</p>
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
}