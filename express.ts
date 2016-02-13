import 'babel-polyfill';
import * as lodash from 'lodash';
import express from 'express'; // import * as express と書くと実行時にエラーになる。
const falcorExpress = require('falcor-express');
import {MinimongoFalcorRouter} from './src-server/minimongo-falcor-router';

require('dotenv').load();
const EXPRESS_ENV = String(process.env.EXPRESS_ENV).trim(); // development or production
const EXPRESS_HOST = String(process.env.EXPRESS_HOST).trim();
const EXPRESS_PORT = Number(process.env.EXPRESS_PORT);

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname)); // ExpressとElectronが両立する書き方。
  
app.get('/', (req, res) => {
  res.redirect('/views');
});

app.get('/views', (req, res) => {
  res.render('index', { title: 'ExpressApp', mode: EXPRESS_ENV });
});

app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
  return new MinimongoFalcorRouter(); // 引数のreq, resで何が出来るのかわからないので無視。
}));

const port = Number(EXPRESS_PORT) || 3000;
const host = EXPRESS_HOST || getIPAddress();
app.listen(port, host);
console.log('Express server listening at http://%s:%s as "%s" mode.', host, port, EXPRESS_ENV);
export {host, port}

function getIPAddress() {
  const interfaces = require('os').networkInterfaces();
  for (let devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 90; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}