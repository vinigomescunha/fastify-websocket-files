let actionClickListeners = {
  'open-preview': (target) => {
    if (FilesFolderList.getSelected().type === 'file') {
      let win = window.open(`/root/${FilesFolderList.getSelected().selected}`, '_blank');
      win.focus();
    }
    if (FilesFolderList.getSelected().type === 'folder') {
      if (Path.get()) {
        Path.add(`${FilesFolderList.getSelected().selected}`);
      } else {
        Path.set(`${FilesFolderList.getSelected().selected}`);
      }
    }
    return;
  },
  'display-save': (target) => {
    document.querySelector('.display-save-chk').checked = true;
    Editor.create();
    return;
  },
  'hide-save': (target) => {
    document.querySelector('.display-save-chk').checked = false;
    Editor.destroy();
    return;
  },
  'display-options': (target) => {
    FilesFolderList.setSelected(target.dataset.basename, target.dataset.type);
    document.querySelector('#input-rename').value = target.dataset.basename;
    document.querySelector('.display-options-chk').checked = true;
    return;
  },
  'hide-options': (target) => {
    document.querySelector('.display-options-chk').checked = false;
    return;
  },
  'rename': (target) => {
    ws.send(JSON.stringify({
      action: target.dataset.action,
      basename: FilesFolderList.getSelected().selected,
      type: FilesFolderList.getSelected().type,
      renameFile: document.querySelector('#input-rename').value
    }));
    document.querySelector('.display-options-chk').checked = false;
  },
  'delete': (target) => {
    ws.send(JSON.stringify({
      action: target.dataset.action,
      basename: FilesFolderList.getSelected().selected,
      type: FilesFolderList.getSelected().type
    }));
    document.querySelector('.display-options-chk').checked = false;

  },
  'newfile': (target) => {
    ws.send(JSON.stringify({
      action: target.dataset.action,
      basename: document.querySelector('#input-newfile').value,
      type: (document.querySelector('#input-newfile-is-dir').checked ? 'folder' : 'file'),
      source: document.querySelector('.editor').innerHTML
    }));
    document.querySelector('.display-save-chk').checked = false;
    Editor.destroy();
  }
};

let actionChangeListeners = {
  'change-toggle-editor': (target) => {
    if (target.checked) {
      Editor.destroy()
    } else {
      Editor.create();
    }
  },
  'set-status-bar-position': (target) => {
    let statusBarPosition = target.options[target.selectedIndex].value;
    if (statusBarPosition) {
      let sb = document.querySelector('.status-bar');
      let sbSample = document.querySelector('.status-bar-preview');
      sbSample.classList.remove('status-bar-top', 'status-bar-bottom', 'hide');
      sb.classList.remove('status-bar-top', 'status-bar-bottom');
      sbSample.classList.add(statusBarPosition);
      sb.classList.add(statusBarPosition);
      setTimeout(() => sbSample.classList.add('hide'), 2000);
    }
  }
};
document.addEventListener('click', (e) => {
  if (e.target) {
    let isActionToLisneter = Object.values(e.target.classList).indexOf('is-action') !== -1;
    let action = e.target.dataset.action;
    let isActionToLisneterAvailable = Object.keys(actionClickListeners).indexOf(action) != -1;
    if (isActionToLisneter && isActionToLisneterAvailable) {
      actionClickListeners[action](e.target);
    }
  }
});
document.addEventListener('change', (e) => {
  if (e.target) {
    let isActionToLisneter = Object.values(e.target.classList).indexOf('is-action') !== -1;
    let action = e.target.dataset.action;
    let isActionToLisneterAvailable = Object.keys(actionChangeListeners).indexOf(action) != -1;
    if (isActionToLisneter && isActionToLisneterAvailable) {
      actionChangeListeners[action](e.target);
    }
  }
});
let displayLoading = () => {
  document.querySelector('.load-text').parentElement.classList.remove('hide')
  setTimeout(() => document.querySelector('.load-text').parentElement.classList.add('hide'), 2000)
};
let addFileFolder = (isFile, basename, data) => {
  displayLoading();
  FilesFolderList.add({
    class: (isFile ? 'is-file' : 'is-folder'),
    type: (isFile ? 'file' : 'folder'),
    basename: basename
  })
  render(FilesFolderList.get());
};
let removeFileFolder = (isFile, basename, data) => {
  displayLoading();
  FilesFolderList.remove(basename);
  render(FilesFolderList.get());
};
let startWebSocket = () => {
  var ws = new WebSocket("ws://localhost:9101");
  ws.onmessage = (evt) => {
    console.log('message', evt.data);
    var data = JSON.parse(evt.data);
    switch (data.action) {
      case 'addFile':
      case 'addDir':
        addFileFolder(data.isFile, data.basename, data);
        break;
      case 'removeFile':
      case 'removeDir':
        removeFileFolder(data.isFile, data.basename, data);
        break;
    }
  };
  ws.onclose = (evt) => {
    console.log('close', evt); // startWebSocket();
  };
  ws.onerror = (evt) => {
    console.log('error', evt); // startWebSocket();
  };
  return ws;
};
let ws = startWebSocket();
Editor.setContainer(document.querySelector('.editor'));
Template7.registerPartial(
  'files',
  `{{#each files}}
      <div data-basename="{{escape basename}}" data-type="{{type}}" class="is-file-folder {{class}} is-action" data-action="display-options">
        <span>{{escape basename}}</span>
      </div>
    {{/each}}`
);
let render = (list) => {
  document.querySelector('.main-container').innerHTML = Template7.compile('{{> "files"}}')({
    files: (list || FilesFolderList.get())
  });
};
render(FilesFolderList.get());