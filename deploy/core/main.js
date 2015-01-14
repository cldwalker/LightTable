"use strict";

var app = require('app'),  // Module to control application life.
    BrowserWindow = require('browser-window'),  // Module to create native browser window.
    dialog = require("dialog"),
    ipc = require("ipc"),
    fs = require('fs'),
    optimist = require('optimist');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var windows = {};
var openFiles = []; // Track files for open-file event

var packageJSON = require(__dirname + '/../package.json');
var parsedArgs, windowClosing; // vars used by multiple functions

// Returns Window object
function createWindow() {
  var browserWindowOptions = packageJSON.browserWindowOptions;
  browserWindowOptions.icon = __dirname + '/' + browserWindowOptions.icon;
  var window = new BrowserWindow(browserWindowOptions);
  windows[window.id] = window;
  window.focus();

  window.on("blur", function() {
    window.webContents.send("app", "blur");
  });
  window.on("devtools-opened", function() {
    window.webContents.send("devtools", "disconnect");
  });
  window.on("devtools-closed", function() {
    window.webContents.send("devtools", "reconnect!");
  });

  windowClosing = false;
  window.on("close", function(e) {
    if (!windowClosing) {
      e.preventDefault();
      window.webContents.send("app", "close!");
    }
  });

  // and load the index.html of the app.
  window.loadUrl('file://' + __dirname + '/LightTable.html?id=' + window.id);

  // Emitted when the window is closed.
  window.on('closed', function() {
    windows[window.id] = null;
  });

  return window;
};

function onReady() {
  ipc.on("createWindow", function(event, info) {
    createWindow();
  });

  ipc.on("initWindow", function(event, id) {
    windows[id].webContents.send('cli', parsedArgs);
    windows[id].webContents.send('openFile', openFiles);
    windows[id].on("focus", function() {
      windows[id].webContents.send("app", "focus");
    });
  });

  ipc.on("closeWindow", function(event, id) {
    // This feels like a bad hack
    windowClosing = true;
    if(id && windows[id]) {
      windows[id].close();
    }
    windowClosing = false;
  });

  ipc.on("toggleDevTools", function(event, windowId) {
    if(windowId && windows[windowId]) {
      windows[windowId].toggleDevTools();
    }
  });

  createWindow();
};

function parseArgs() {
  optimist.usage("\nLight Table " + app.getVersion() + "\n" +
                 // TODO: Use a consistent name for executables or vary executable
                 // name per platform. $0 currently gives an unwieldy name
                 "Usage: light [options] [path ...]\n\n"+
                 "Paths are either a file or a directory.\n"+
                 "Files can take a line number e.g. file:line.");
  optimist.alias('h', 'help').boolean('h').describe('h', 'Print help');
  optimist.alias('a', 'add').boolean('a').describe('a', 'Add path(s) to workspace');
  parsedArgs = optimist.parse(process.argv);

  if (parsedArgs.help) {
    optimist.showHelp();
    process.exit(0);
  }
}

function start() {
  app.commandLine.appendSwitch('remote-debugging-port', '8315');
  app.commandLine.appendSwitch('js-flags', '--harmony');

  // This method will be called when atom-shell has done everything
  // initialization and ready for creating browser windows.
  app.on('ready', onReady);

  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    app.quit();
  });

  // open-file operates in two modes - before and after startup.
  // On startup and before a window has opened, event paths are
  // saved and then opened once windows are available.
  // After startup, event paths are sent to available windows.
  app.on('open-file', function(event, path) {
    if (Object.keys(windows).length > 0) {
      Object.keys(windows).forEach(function(id) {
        windows[id].webContents.send('openFileAfterStartup', path);
      });
    }
    else {
      openFiles.push(path);
    }
  });
  parseArgs();
};

if (process.env["IPC_DEBUG"]) {
  var oldOn = ipc.on;
  ipc.on = function (channel, cb) {
    oldOn.call(ipc, channel, function() {
      console.log("\t\t\t\t\t->SERVER", channel, Array.prototype.slice.call(arguments).join(', '));
      cb.apply(null, arguments);
    });
  };
  var logSend = function (window) {
    var oldSend = window.webContents.send;
    window.webContents.send = function () {
      console.log("\t\t\t\t\tSERVER->", Array.prototype.slice.call(arguments).join(', '));
      oldSend.apply(window.webContents, arguments);
    };
  };
  var oldCreateWindow = createWindow;
  var createWindow = function() { logSend(oldCreateWindow()); };
}

start();
