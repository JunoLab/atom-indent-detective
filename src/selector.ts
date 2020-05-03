// TODO: observe https://github.com/atom/atom-select-list/pull/28/files
import SelectListView from 'atom-select-list'

import { TextEditor, Panel, Pane } from "atom"
import { IndentSetting, setIndent } from "./indent-detective"

export class Selector {
    indentListView
    modalPanel: Panel
    previousActivePane!: Pane

    // Make a selector object (should be called once)
    constructor(SelectorItems: IndentSetting[]) {
            // Defining a SelectListView with methods - https://github.com/atom/atom-select-list
            this.indentListView = new SelectListView({
                // an array containing the objects you want to show in the select list
                items: SelectorItems,

                // called whenever an item needs to be displayed.
                elementForItem: (indent: IndentSetting) => {
                    const element = document.createElement("li")
                    element.textContent = indent.text
                    return element
                },

                // called to retrieve a string property on each item and that will be used to filter them.
                filterKeyForItem: (indent: IndentSetting) => {
                    return indent.text
                },

                // called when the user clicks or presses Enter on an item. // use `=>` for `this`
                didConfirmSelection: (indent: IndentSetting) => {
                    const editor = atom.workspace.getActiveTextEditor()
                    if (editor instanceof TextEditor) {
                        setIndent(editor, indent)
                    }
                    this.hide()
                },

                // called when the user presses Esc or the list loses focus. // use `=>` for `this`
                didCancelSelection: () => {
                    this.hide()
                },
            })

            // Adding SelectListView to panel
            this.modalPanel = atom.workspace.addModalPanel({
                item: this.indentListView,
            })
    }

    // Show a selector object
    show() {
        this.previousActivePane = atom.workspace.getActivePane()

        // Show selector
        this.indentListView.reset()
        this.modalPanel.show()
        this.indentListView.focus()
    }

    // Hide a selector
    hide() {
        // hide modal panel
        this.modalPanel.hide()
        // focus on the previous active pane
        this.previousActivePane.activate()
    }

    // Dispose selector
    dispose() {
        this.indentListView.destroy()
        this.modalPanel.destroy()
    }
}
