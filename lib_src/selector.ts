const SelectListView = require("atom-select-list")

// TODO: observe https://github.com/atom/atom-select-list/pull/28/files
// import {SelectListView} from 'atom-select-list'

import { TextEditor, CompositeDisposable, Panel, Disposable } from "atom"
import { IndentSetting, setIndent, SelectorItems } from "./indent-detective"

export function selector_show(subs: CompositeDisposable) {
    let makeModalPanel = true
    let modalPanel: Panel
    let indentListView

    if (makeModalPanel) {
        // Defining a SelectListView with methods - https://github.com/atom/atom-select-list
        indentListView = new SelectListView({
            // an array containing the objects you want to show in the select list
            items: SelectorItems,

            // called whenever an item needs to be displayed.
            elementForItem(indent: IndentSetting) {
                const element = document.createElement("li")
                element.textContent = indent.text
                return element
            },

            // called to retrieve a string property on each item and that will be used to filter them.
            filterKeyForItem(indent: IndentSetting) {
                return indent.text
            },

            // called when the user clicks or presses Enter on an item.
            didConfirmSelection(indent: IndentSetting) {
                const editor = atom.workspace.getActiveTextEditor()
                if (editor instanceof TextEditor) {
                    setIndent(editor, indent)
                }
                modalPanel.hide()
            },

            // called when the user presses Esc or the list loses focus.
            didCancelSelection() {
                modalPanel.hide()
                return {} // f()!
            }
        })

        // Adding SelectListView to panel
        modalPanel = atom.workspace.addModalPanel({
            item: indentListView
        })

        // Add disposable
        subs.add(
            new Disposable(function() {
                indentListView.destroy()
                modalPanel.destroy()
                makeModalPanel = true
            })
        )

        // Show selector
        indentListView.reset()
        modalPanel.show()
        indentListView.focus()
    }
}
