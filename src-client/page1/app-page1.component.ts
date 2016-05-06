import {Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppPageParent} from '../app/app-page-parent';
import {AppModal} from '../app/app-modal.component';
import {getValueFromJsonGraph} from '../app/falcor-utils';
import lodash from 'lodash';
declare var jQuery: JQueryStatic; // HTMLファイルでロード済み
declare var Materialize: any; // HTMLファイルでロード済み

import {Action, NextNow, NextMessageFromFalcorPage1} from '../flux/flux-action';
import {Container} from '../flux/flux-container';
import {Dispatcher} from '../flux/flux-di';

import 'rxjs/add/observable/fromPromise'
// import 'rxjs/add/operator/fromObservable'


const COMPONENT_SELECTOR = 'my-page1'
@Component({
  selector: COMPONENT_SELECTOR,
  template: `
    <div class="row">
      <div class="col s12">
        <h4>Falcor sample Page1</h4>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <h3>{{messageByPush}}</h3>
      </div>
    </div>
    <my-modal [texts]="modalTexts" [now]="nowByPush | async"></my-modal>
  `,
  directives: [AppModal],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPage1 extends AppPageParent implements OnInit {
  // nowByPush: number; // Observableイベントハンドラによって値が代入される。
  get nowByPush() {
    // 戻り値がObservable<any>なのでtemplateでasyncパイプを1回通すこと。
    return this.container.state$.map(appState => {
      return appState.now;
    });
  }
  // get stateByPush() {
  //   // 戻り値がObservable<Promise<any>>なのでtemplateでasyncパイプを2回通すこと。
  //   return this.container.state$.map(appState => {
  //     return appState.page1;
  //   });
  // }
  private messageByPush: string;
  subscribeState() {
    // mapの戻り値がObservable<Promise<any>>の場合はsubscribeでPromiseを展開してdetectChangesを書かないとViewが更新されない。
    this.container.state$
      .map(appState => appState.page1)
      .filter(page => page instanceof Promise)
      .subscribe(page => {
        page.then(state => {
          this.messageByPush = state.message;
          this.cd.detectChanges(); // これを書かないとViewが更新されない。理由はよくわからない。
        });
      });
  }

  // ページ遷移で入る度に呼び出される。
  constructor(
    private dispatcher$: Dispatcher<Action>,
    private container: Container,
    private cd: ChangeDetectorRef
  ) {
    super(COMPONENT_SELECTOR);
  }
  ngOnInit() {
    super.ngOnInit();
    this.subscribeState();
    this.loadJsonGraph();
  }

  // 以下2つのinitializable関数は親クラスから呼び出される初期化専用の関数。
  initializableJQueryPlugins(): void {
    jQuery(`${COMPONENT_SELECTOR} .modal-trigger`).leanModal();
  }
  initializableEventObservables(): void {
    this.disposableSubscription = Observable.fromEvent<MouseEvent>(document.getElementsByTagName(COMPONENT_SELECTOR), 'click')
      .map(event => event.target.textContent)
      .filter(text => text.trim().length > 0)
      .subscribe(text => {
        Materialize.toast(`You clicked "${text}"`, 300);
      });

    this.disposableSubscription = Observable.timer(1, 1000 * 60) // 開始1ms後にスタートして、その後1000ms毎にストリームを発行する。
      .subscribe(() => {
        // this.nowByPush = lodash.now();
        this.dispatcher$.next(new NextNow(lodash.now()));
      });
  }

  // ここからFalcorのコード。
  //model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
  loadJsonGraph() {
    this.getJsonGraph();
  }
  getJsonGraph() {
    const queryName = 'query1';

    // this.model // this.modelは親クラスで定義されている。
    //   .get([queryName])
    //   .then(jsonGraph => {
    //     console.log(JSON.stringify(jsonGraph, null, 2)); // Falcorから返却されるJSON Graphを確認。
    //     this.messageByFalcor = getValueFromJsonGraph(jsonGraph, ['json', queryName], '?????');
    //   });
    this.dispatcher$.next(new NextMessageFromFalcorPage1([queryName]));
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