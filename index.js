const serverPort = 9100;
const webSocketPort = 9101;
//const initWatchFiles = require('./libs/watch-files')('./root/');
const initWebsocket = require('./libs/websocket')(webSocketPort, './root/');
const initServer = require('./libs/server')(serverPort);
// const fileState = require('./libs/files-state');
// setInterval(() => {
//   console.log('INDEX fileState', fileState.getAllFiles())
// }, 1000);