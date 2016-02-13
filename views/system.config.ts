const srcPath = '../src-front';
const nodeModulesPath = '../node_modules';

System.config({
  baseURL: '.',
  transpiler: false,
  paths: {
    'src:*': `${srcPath}/*`,
    'node:*': `${nodeModulesPath}/*`,
  },
  map: {
    'src': srcPath,
    'app': `src:app`,
    'babel-polyfill': 'node:babel-polyfill/dist/polyfill.min.js', // async/awaitに必要。
    //'numeral': 'node:numeral/min/numeral.min.js',
    //'moment': 'node:moment/min/moment.min.js',
    'lodash': 'node:lodash/lodash.js',
    'flat': 'node:flat/index.js',
    'falcor': 'node:falcor/dist/falcor.browser.min.js',
  },
  packages: {
    'src': { defaultExtension: 'js'},
  },
  meta: {
    'app/boot.js': { deps: ['babel-polyfill'] }
  }
});