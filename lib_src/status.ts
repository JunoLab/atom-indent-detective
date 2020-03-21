import { TextEditor } from "atom"
import { StatusBar, Tile } from "atom/status-bar"

export class IndentStatusItem {
    bar: StatusBar
    tile: Tile | null
    text: HTMLElement | null
    view: HTMLElement

    // Construct a statusbar item - Called only once for one session
    constructor() {
        return this.createView()
    }

    // Called only once for one session
    consumeStatusBar(bar: StatusBar) {
        this.bar = bar
        return (this.tile = this.bar.addRightTile({
            item: this.view,
            priority: 10.5
        }))
    }

    // Called only once for one session
    createView() {
        this.view = document.createElement("span")
        this.view.classList.add("indent-status", "inline-block")
        this.text = document.createElement("a")
        this.text.innerText = "Spaces (2)"
        this.view.appendChild(this.text)

        this.view.onclick = function() {
            const editor = atom.workspace.getActiveTextEditor()
            if (editor) {
                atom.commands.dispatch(atom.views.getView(editor), "indent-detective:choose-indent")
            } // else do nothing
        }

        // Initial Visibility
        this.updateDisplay(atom.workspace.getActiveTextEditor())

        return this
    }

    // Toggles the visibility of statusbar item
    updateDisplay(editor?: TextEditor | undefined) {
        if (editor) {
            this.view.style.display = ""
            return this.updateText(editor)
        } else {
            this.view.style.display = "none"
            return this.clearText()
        }
    }

    // Called from updateDisplay
    updateText(editor: TextEditor) {
        let text
        if (editor.getSoftTabs()) {
            text = `Spaces (${editor.getTabLength()})`
        } else {
            text = "Tabs"
        }
        return this.text != null ? (this.text.innerText = text) : undefined
    }

    // Called from updateDisplay
    clearText() {
        return this.text != null ? (this.text.innerText = "") : undefined
    }

    // Destroy when package is deactivated
    destroy() {
        return this.tile != null ? this.tile.destroy() : undefined
    }
}
