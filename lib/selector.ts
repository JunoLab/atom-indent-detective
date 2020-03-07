import { SelectListView } from 'atom-space-pen-views';

export default {
  show(xs, f) {
    if (this.selector == null) { this.selector = new SelectListView; }
    this.selector.setItems([]);
    this.selector.storeFocusedElement();
    this.selector.getFilterKey = () => 'text';
    this.selector.viewForItem = item => {
      return `<li>${item.text}</li>`;
    };

    if (xs.constructor === Promise) {
      this.selector.setLoading("Loading...");
      xs.then(xs => {
        return this.selector.setItems(xs);
      });
    } else {
      this.selector.setItems(xs);
    }

    const panel = atom.workspace.addModalPanel({item: this.selector});
    this.selector.focusFilterEditor();

    let confirmed = false;
    this.selector.confirmed = item => {
      f(item);
      confirmed = true;
      return this.selector.cancel();
    };
    return this.selector.cancelled = () => {
      panel.destroy();
      if (!confirmed) { return f(); }
    };
  }
};
