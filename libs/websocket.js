const ws = require('ws');
const WebSocket = ws.Server;
const chokidar = require('chokidar');
const path = require("path");
const exec = require('child_process').exec;
module.exports = (webSocketPort, folder) => {
  let webSocket = new WebSocket({
    port: webSocketPort
  });
  let clientSendMsg = (obj) => {
    webSocket.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(obj));
      }
    });
  };
  let execute = (qry, callback) => {
    exec(qry, (e, stdout, stderr) => {
      if (!e instanceof Error) {
        callback();
      }
    });
  }
  webSocket.on('connection', function (socket) {
    chokidar
      .watch(folder, {
        persistent: true,
        depth: 0,
        alwaysStat: true,
        disableGlobbing: true
      })
      .on('all', (event, path, stats) => {
        // console.log(event, path, stats);
      })
      .on('add', function (file) {
        clientSendMsg({
          action: 'addFile',
          isFile: true,
          path: file,
          basename: path.basename(file)
        });
      })
      .on('unlink', function (file) {
        clientSendMsg({
          action: 'removeFile',
          isFile: true,
          path: file,
          basename: path.basename(file)
        });
      })
      .on('error', function (error) {
        socket.send(JSON.stringify({
          action: 'error'
        }));
      })
      .on('addDir', (folder) => {
        if (path.basename(folder).split(path.sep).pop() !== 'root')
          clientSendMsg({
            action: 'addDir',
            isFile: false,
            path: folder,
            basename: path.basename(folder).split(path.sep).pop()
          });
      })
      .on('unlinkDir', (folder) => {
        clientSendMsg({
          action: 'removeDir',
          isFile: false,
          path: folder,
          basename: path.basename(folder).split(path.sep).pop()
        });
      });

    socket.on('message', function (message) {
      console.log('Message Received from \n from IP ' + socket.upgradeReq.connection.remoteAddress, message.toString());
      try {
        let obj = JSON.parse(message);
        let qry;
        if (obj.action) {
          switch (obj.action) {
            case 'delete':
              let params = obj.type === 'folder' ? ' -rf' : ''
              qry = `cd ${folder} && rm "${obj.basename}" ${params}`;
              execute(qry, () => {
                socket.send(JSON.stringify({
                  "received": message
                }));
              })
              break;
            case 'rename':
              qry = `cd ${folder} && mv "${obj.basename}" "${obj.renameFile}"`;
              execute(qry, () => {
                socket.send(JSON.stringify({
                  "received": message
                }));
              })
              break;
            case 'newfile':
              let qryFolder = `cd ${folder} && mkdir "${obj.basename}"`;
              let qryFile = `cd ${folder} && echo "${obj.source}" >> "${obj.basename}"`;
              qry = obj.type === 'folder' ? qryFolder : qryFile;
              execute(qry, () => {
                socket.send(JSON.stringify({
                  "received": message
                }));
              })
              break;
            default:
              console.log('acao inexistente!');
          }
        }
      } catch (e) {
        socket.send(JSON.stringify({
          "error": true
        }));
      }
    });
    socket.on('error', function () {
      console.log('Server Error...');
    });
    socket.on('close', function () {
      console.log('Server Closed...');
    });
  });
};