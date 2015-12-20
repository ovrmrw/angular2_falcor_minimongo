title: 新鮮なFalcorとAngular2のサンプル、季節のRxJSとminimongoを添えて(TypeScriptのAbstract Class風味)

## Angular2, Falcor, RxJS, minimongo, TypeScript, Abstract Classデザインパターン

[Angular2 Advent Calendar 2015](http://qiita.com/advent-calendar/2015/angular2) 13日目です。  

今回の目玉は**Falcor**です。が、  
モダンWebアプリにおけるDBアクセスに主眼を置いた総合講座のようになってしまったかもしれません。  

もう先にお伝えしますが、この記事は企画だけ先行して途中からまとまる気がしなくなったためにかなりちんぷんかんぷんです。  
いちいち記事読むのめんどくさいよサンプル出してよサンプル！という方のためにGitHubにアップロードしてあるのでcloneしてnpm iして早速動かしてみてください。  

[ovrmrw/angular2_falcor_minimongo](https://github.com/ovrmrw/angular2_falcor_minimongo)  
(ChromeとFirefoxで動作確認済み)

自分で動かして後はソース読んでと言って終わりたいところですが、それではさすがにアレなので解説を始めたいと思います。

---

[:contents]

### Falcorとは
[Falcor: One Model Everywhere](https://netflix.github.io/falcor/)  
まずは公式から入りましょう。英語ですね。がんばって読みましょう。得ることは多いです。ちなみに発音はファルコーです。(英語っぽく言うとファゥコォ)

あなたは今までに**Express**とか**ASP.NET WebAPI**とか、他にどういうのあるかわからないのですが、**エンドポイント(API?)**をたくさん書いたことがありますか？  
エンドポイントというのは、そのURLにリクエストを投げると何かしらのレスポンスが返ってくるというものです。イマドキは大抵JSONが返ってきますね。
そういうの今までに書いたことがない人には残念ながら**Falcorの衝撃**は伝わらないかもしれません。

逆に**リクエストの種類に応じて延々増え続けるエンドポイントでExpressが肥大化するのを目の当たりにしたような方**、そう、あなたのためにこの**まとまる予感がしない記事**を書いているのです。  
僕はうまく説明できないのでこの記事↓をざーっと読んでみてください。  
[米Netflix、データフェッチのためのJavaScriptライブラリ「Falcor」を公開](https://osdn.jp/magazine/15/08/25/164200)

これ読んでわかる人、すごいですね！僕は何がなんだかさっぱりわかりませんでしたよ。おそらくほとんどの人にはピンとこないと思うので、  
(僕なりに解釈した)Falcorの特徴を簡単にまとめると

* エンドポイントを増やさずに出来ることを増やせる。柔軟性が高い。
* フロントエンドのコードからもサーバーサイドのコードからもDBアクセスに関するコードを大幅に減らせる。
* キャッシュしたものは2度目からDBにアクセスしない。だから速い。
* エンドポイントは入りと出の帳尻が合っていれば中身をどのように書いても良い。
* DBがなんなのか、どこにあるのか、どういう構造でデータを持っているのか、フロントエンドはほとんど考慮しなくて良い。
* まるでそこにそういう構造をしたJSONがあって、それを取ってくるだけみたいな感覚。

わかりますよ。あまり伝わらないですね？  
Google検索してみましょう。残念ながら日本語の記事はほとんどヒットしません。英語でも実践的なサンプルコードを伴った記事はなかなかありません。  
(まだFalcor自体がアルファ版ということもありますし、最近出てきたばかりなので)  

でも大丈夫。このサンプルアプリのソースを読めばきっと大体わかります。(投げやり)

これだけは言っておきましょう。**Falcorまじですごいやつ。**


### サーバーサイドの express.ts の中はどうなっている？
DBアクセスと言えば真っ先に思い浮かぶのは**肥大化するExpress**ですね。  
ではルートフォルダにある`express.ts`の中を見てみましょう。エンドポイントに関するコードはどうなっているでしょう。
```javascript
// ./express.ts

app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
  return new MinimongoFalcorRouter();
}));
```
たったの3行。ほぼ公式サイトの書き方に準拠しています。  
他に怪しいコードと言えば
```javascript
const falcorExpress = require('falcor-express');
import {MinimongoFalcorRouter} from './src-server/minimongo-falcor-router';
```
これくらいでしょうか。
import文が怪しい！正解です。`minimongo-falcor-router.ts`にDBアクセスに関するコード(エンドポイント群)を追放しています。

### じゃあ minimongo-falcor-router.ts の中はどうなっている？
```javascript
// ./src-server/minimongo-falcor-router.ts

import {MinimongoFactory} from './minimongo-factory';
const db = new MinimongoFactory().getDatabase();
```
またimport文が怪しい！この2行でminimongoにサンプルデータを読み込んでメモリ上にDBを生成するという作業を行なっています。  
(minimongoで生成できるDBにはいくつか種類がありますが、今回はMemoryDBという揮発性のDBを使います)  
これはExpressが起動する度に生成され、終了する度に消滅します。

さてこのファイルの中にはエンドポイントが書かれているはずでしたね。探してみましょう。
```javascript
let routes = [];
routes.push({
  route: "hoge.foo.bar[{keys:keyword}]",
  get: (pathSet: any): any[] => {
    const keyword = pathSet.keyword[0] as string;
    let results = [];
    results.push({
      path: pathSet, 
      value: `Hello, ${keyword}.`
    });
    return results; 
  }
});
```
よくわからないかもしれませんが、これは簡単過ぎて実用的ではない例です。  
(公式サイトを一通り眺めてみると上記がどういう意味なのかわかります。特に[The Falcor Router](https://netflix.github.io/falcor/documentation/router.html#the-falcor-router)は読んだ方がいいかもしれません)  
今回のサンプルでは上記のような`routes.push()`が4回出てきます。つまりここでエンドポイントを4つ定義しています。  
サンプルアプリにはPage1～4まであり、各々のページ用に1つずつエンドポイントを用意してあります。
最初は簡単でだんだん難しくなるように書きましたので、自分がどこまで理解できるか挑戦してみてください。

### フロントエンドからどうやってエンドポイントを叩いている？
ざっくり過ぎるほどざっくりとサーバーサイドの解説をしましたが、早速フロントエンドの話に移ります。  
サーバーサイドで定義したエンドポイントは当然フロントエンドから叩くことになりますね。リクエストを投げてJSONを受け取る、いわゆるWebAPIというやつです。
```javascript
// ./src-front/page1/app-page1.component.ts

model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
getJsonGraph() {
  this.model
    .get(['hoge'])
    .then(jsonGraph => {
      this.messageByFalcor = jsonGraph ? jsonGraph.json.hoge : '?????';
    });
}
```
一言で説明すると、**Falcorの仮想JSONモデルとも言えるJSON Graphに対して`'hoge'`という構造のJSONを要求したら`{"hoge":"何かしらの値"}`みたいなJSONが返ってくる**ということです。

実際にサンプルを動かしてみて、サーバーサイドのコンソール、ブラウザのコンソール、ブラウザに表示される内容、HTMLテンプレート、色々観察してみてください。そうじゃないと伝わらない。たぶん。

ちなみにサンプルアプリでは、

* サーバーサイドのTypeScriptファイルは ./src-server フォルダに
* フロントエンドのTypeScriptファイルは ./src-front フォルダに

分けて保存してあります。  
上記のコードはフロントエンドの中でもPage1のコードの抜粋です。Page4のこの部分はかなり難しくなっていますよ。抜粋してみましょう。
```javascript
// ./src-front/page4/app-page4.component.ts

model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
getJsonGraph(condition: string, keyword: string, from: number = 0, length: number = 10) {
  this.model
    .get([this.collection, condition, keyword, { from: from, length: length }, this.fields.concat('totalItems')])
    .then(jsonGraph => {
      this.documentsByFalcor = jsonGraph ? _.toArray(jsonGraph.json[this.collection][condition][keyword]) : [];
      this.totalItemsByFalcor = jsonGraph ? jsonGraph.json[this.collection][condition][keyword][from]['totalItems'] : 0;
    });
}
```
`this.model.get()`の中が難解ですが、これは**こういう構造のJSONを要求する**という意味になります。  

何を言っているかわからないかもしれませんね。これはもう、実際の動きを見てもらいながらソースを追っていただくしかないかなと思います。  
なるべくヒントになるような情報をコンソールに出力するようにコードを書いたつもりですので、動かしながらコンソールをよく観察してみてください。

### 起動から画面表示までの大まかな流れ
Angular2に不慣れな方は、そもそも起動して画面が表示されるまでにどういう順番でファイルを読み込んでいるのかわからないかもしれないので、簡単に説明します。

* Expressを起動。 `express.ts`
* src-serverフォルダの `minimongo-falcor-router.ts` → `minimongo-factory.ts` ここまでがサーバーサイドの準備。
* viewsフォルダの `index.jade` と `_layout.jade` ここからがフロントエンドの準備。
* viewsフォルダの `system.config.ts`
* src-frontフォルダの `app/boot.ts` → `app/app.ts` 主に上部のナビゲーションと下部のフッターの生成
* src-frontフォルダの `page1/app-page1.component.ts` → `app/app-page-parent.ts` 各ページのメインコンテンツ

上記が**Expressを起動してからPage1を表示するまで**の大体のファイル読み込みの流れです。  
よくわからなくなったときはこの流れに沿ってソースを読んでみてください。


### サンプルアプリの遊び方
GitHubのリポジトリを`clone`して、`npm install`して、`gulp compile`して、`gulp ex`でブラウザが自動的に立ち上がります。

* Page1 ここで**Falcorがどうやってメッセージを取得しているか**の流れを追ってください。ここが理解できないと以降もわかりません。
  * 読むべきソース `./src-front/page1/app-page1.component.ts`,`./src-server/minimongo-falcor-router.ts`
* Page2 こちらの入力に応じてFalcorが返すメッセージが変わります。**Falcorがどうやって受け取ってどうやって返しているのか**を追ってください。
  * 読むべきソース `./src-front/page2/app-page2.component.ts`,`./src-server/minimongo-falcor-router.ts`
* Page3 Falcorが**minimongoのDBから取得したデータを画面に表示します**。Page4の簡易版ですがPage2よりかなり難しくなります。
  * 読むべきソース `./src-front/page3/app-page3.component.ts`,`./src-server/minimongo-falcor-router.ts`
* Page4 Page3をさらに発展させてさらに子コンポーネントも登場します。**親コンポーネントと子コンポーネントがどうやって関連し合っているか**を追えるかどうかがポイントです。ただし難解。
  * 読むべきソース `./src-front/page4/app-page4.component.ts`,`./src-server/minimongo-falcor-router.ts`
  * 難解なソース `./src-front/page4/app-page4-table.component.ts`(テーブルとページネーションの定義)
  * DBの元データ `./json/names_part_1000.json`

ソースコードは可能な限り無駄をなくして読みやすくなるようにしたつもりですが、**RxJSのAngular2への応用**や**Abstract Classを使用したデザインパターン**が盛り込まれていたりして多少複雑になっているのは否めません。  
各ページには EXPLANATION ボタンがあり、クリックすると簡単な説明やお題が書いてあったりします。**特にPage4のお題はFalcorの威力がわかるので全て解いていただきたい**ところです。

---

(ここで今回の記事は終わりたいところですがもう少し)

---

### イベントハンドラについて
全てのページでRxJSのObservableが活躍します。Observableによるイベントハンドラで何ができるのかを感じ取っていただければと思います。

一言で説明すると、Observableから生成されたSubscription(イベントハンドラ)は**一度生成されるとまるで浮遊して漂っているかのように常に存在し、イベントの発生を捕捉すると直ちに活動を開始する**ものです。

HTMLテンプレートに`(click)='onClick()'`とか書かなくてもイベントを捕捉できます。その様子は例えるなら**鷹が上空から餌が出てくるのを監視しているかのよう**です。  
全てのページに書いたわかりやすいRxJSのコードがこちら↓
```javascript
Observable.fromEvent<MouseEvent>(document.getElementsByTagName(componentSelector), 'click')
  .map(event => event.target.textContent)
  .filter(text => _.trim(text).length > 0)
  .subscribe(text => {
    Materialize.toast(`You clicked "${text}"`, 300);
  });
```
何らかのHTMLエレメントをクリックすると発火し、条件を満たしたらメッセージを表示する、というような流れです。  
これも実際にサンプルアプリを動かして確認してもらうのが一番早いですね。

Page4では子コンポーネントで発生するCustomEventを親コンポーネントのObservableで捕捉しています。この流れは是非とも追っていただきたい部分です。

### minimongoについて
今回のサンプルアプリではデータベースにminimongoを用いています。  
これについては過去記事 [minimongoでバルクインサート用のjsonファイルをインポートしてLIKE検索までやってみた。](http://overmorrow.hatenablog.com/entry/2015/12/15/130809) も参照してください。

**サンプルアプリでとりあえずDBっぽいものを動かしたい**というときには最適なソリューションかと思います。

### Abstract Classデザインパターンについて
勝手にデザインパターン名を付けていますが、他になんと言えばいいのかわかりません。  
これについては過去記事 [Angular2の実践的なビューの作り方(Abstract Classを使う)](http://overmorrow.hatenablog.com/entry/2015/12/10/000000) も参照してください。  
(今回のサンプルでは上記記事より少しアレンジしています)

ページ遷移で入る度に適切な初期化処理をして、ページ遷移で出る度に適切なdispose処理をしています。  
これには各ページに記述している`initializable`関数が関与しています。この親クラスと子クラスの流れを追っていただくと、どういうメリットがあるのかわかるかと思います。

### System.jsについて
Angular2を代表とするモダンWebアプリ開発をするにあたって、Angular公式が推奨するSystem.jsを使う際の肝はずばり

**`System.config()`の書き方一つ**、です。

サンプルアプリではViewsフォルダの`system.config.ts`にまとめて書いてありますので、src-frontフォルダの各tsファイルの`import`や`require`とどう関連しているか追ってみてください。

---

### 最後に
「ソース読んで」「コード見て」「流れ追って」「動かしてみて」の連発で申し訳ありません。  
これを書いている僕もWebアプリ開発の現場にいるわけではない初心者なのでうまくまとめて伝えるのが難しいです。  
でもプログラミングって「他人のソース読んでとりあえず動かしてどこがどう関連しているのか自分なりに追っていく」作業の連続だと思います。  

上の方にも書きましたが、Page1～4のEXPLANATIONにあるお題(特にPage4)は是非とも取り組んでみてください。初心者の方には特に色々な発見があると思います。

---

以上です、ありがとうございました。