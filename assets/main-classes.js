    class Editor {
      static setContainer(container) {
        this.container = container
      }
      static create() {
        if (!this.editor) {
          this.editor = new Jodit(this.container, this.options || {
            width: '80vw',
            height: '60vh'
          });
        } else {
          console.log('Editor already exist!', this.editor);
        }
      }
      static destroy() {
        if (!this.editor) {
          console.log('Editor dont exist!');
        } else {
          this.editor.destruct();
          this.editor = null;
        }
      }
    }
    class FilesFolderList {
      static setSelected(selected, type) {
        this.selected = {
          selected,
          type
        };
      }
      static getSelected() {
        return this.selected;
      }
      static add(obj) {
        if (this.list) {
          if (this.list.map((e) => e.basename).indexOf(obj.basename) === -1) {
            this.list.push(obj);
          } else {
            console.log('duplicated object');
          }
        } else {
          this.list = [obj];
        }
      }
      static remove(filename) {
        this.list = this.list.filter((e) => e.basename != filename);
      }
      static get() {
        return this.list ? this.list.sort((a, b) => {
          if (a.type !== 'folder' || a.basename.charAt(0) > b.basename.charAt(0)) return 1;
          if (b.type !== 'folder' || b.basename.charAt(0) > a.basename.charAt(0)) return -1;
          return 0;
        }) : [];
      }
    }

    class Path {
      static set(path) {
        this.path = path;
      }
      static add(path) {
        let tmPath = this.path;
        if (!tmPath) {
          tmPath = '';
        }
        tmPath = tmPath.split('/').filter((p) => p !== '');
        tmPath.push(path);
        this.path = tmPath.join('/');
      }
      static get() {
        return this.path;
      }
    }