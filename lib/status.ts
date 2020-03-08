import {TextEditor} from "atom";
import {StatusBar} from "atom/status-bar";

export default {
  activate() {
    return this.createView();
  },

  deactivate() {
    return (this.tile != null ? this.tile.destroy() : undefined);
  },

  consumeStatusBar(bar :StatusBar) {
    this.bar = bar;
    return this.tile = this.bar.addRightTile({
      item: this.view,
      priority: 10.5
    });
  },

  createView() {
    this.view = document.createElement('span');
    this.view.classList.add('indent-status', 'inline-block');
    this.text = document.createElement('a');
    this.text.innerText = "Spaces (2)";
    this.view.appendChild(this.text);
    return this.view.onclick = () => {
      return atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()),
       'indent-detective:choose-indent');
    };
  },

  update(editor? :TextEditor) {
    if (editor) {
      this.view.style.display = "";
      return this.updateText(editor);
    } else {
      this.view.style.display = "none";
      return this.clearText();
    }
  },

  updateText(editor :TextEditor) {
    let text;
    if (editor.getSoftTabs()) {
      text = `Spaces (${editor.getTabLength()})`;
    } else {
      text = "Tabs";
    }
    return (this.text != null ? this.text.innerText = text : undefined);
  },

  clearText() {
    return (this.text != null ? this.text.innerText = "" : undefined);
  }
};
