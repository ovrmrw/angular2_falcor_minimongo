const PLUS = '@PLUS@';
const AMPERSAND = '@AMPERSAND@';
const SHARP = '@SHARP@';
const PERCENT = '@PERCENT@';

// フロントエンドからサーバーサイドにJSONを渡すときにFalcor用にシリアライズする。
function serializeQueryObjectForFalcor<T>(object: T): string {
  const json = JSON.stringify(object);
  let quotesReplacer = "`";
  while (json.indexOf(quotesReplacer) > -1) {
    quotesReplacer = quotesReplacer + "'";
  }
  const json2 = quotesReplacer + [['"', quotesReplacer], ['[+]', PLUS], ['&', AMPERSAND], ['#', SHARP], ['%', PERCENT]].reduce((p, replacer) => {
    return p.replace(new RegExp(replacer[0], 'g'), replacer[1]);
  }, json); // JSONの先頭にquotesReplacerを付け加える。
  console.log('serialized query json: ' + json2);
  return json2;
}

// サーバーサイドがフロントエンドからJSONを受け取ったときにJavaScriptオブジェクトにデシリアライズする。
function deserializeQueryJsonForFalcor<T>(json: string): T {
  const quotesReplacer = json.match(/^.*?{/)[0].slice(0, -1);
  const json2 = [[quotesReplacer, '"'], [PLUS, '+'], [AMPERSAND, '&'], [SHARP, '#'], [PERCENT, '%']].reduce((p, replacer) => {
    return p.replace(new RegExp(replacer[0], 'g'), replacer[1]);
  }, json).slice(1); // 先頭に余分な " が残るのでsliceで取り除く。
  console.log('deserialized query json: ' + json2);
  return JSON.parse(json2);
}

export {serializeQueryObjectForFalcor, deserializeQueryJsonForFalcor}