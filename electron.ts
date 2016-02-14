import 'babel-polyfill';
import lodash from 'lodash';
import fs from 'fs';
import path from 'path';

require('dotenv').load();
const EXPRESS_ENV = String(process.env.EXPRESS_ENV).trim();
const ELECTRON_ENV = String(process.env.ELECTRON_ENV).trim();
const JADE = "jade";

console.log('Electron is running as "%s" mode.', ELECTRON_ENV);

///////////////////////////////////////////////////////////////////////////////////////////

const app = require('app');  // Module to control application life.
const BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }  
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1000, height: 1000 });

  // and load the index.html of the app.
  //mainWindow.loadUrl('file://' + __dirname + '/src/index.html');
  if (ELECTRON_ENV === JADE) {
    const jade = require('jade');
    const html = jade.renderFile('./views/index.jade', { title: "ElectronApp", mode: EXPRESS_ENV });
    const output = './views/index.jade.html';
    fs.writeFileSync(output, html);  
    const filePath = path.resolve('file://', __dirname, output);
    console.log(filePath);
    mainWindow.loadURL(filePath);
  } else {
    const express = require('./express');
    const url = 'http://' + express.host + ':' + express.port + '/views/';
    console.log(url);
    mainWindow.loadURL(url);
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});