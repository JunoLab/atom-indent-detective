import { TextEditor } from "atom"
import { StatusBar, Tile } from "atom/status-bar"

export class IndentStatusItem {
    tile: Tile | null
    text: HTMLElement | null
    view: HTMLElement

    // Construct a statusbar item - Called only once for one session inside `consumeStatusBar(bar: StatusBar)`
    constructor(bar: StatusBar) {
        this.view = document.createElement("span")
        this.view.classList.add("indent-status", "inline-block")
        this.text = document.createElement("a")
        this.text.innerText = "Spaces (2)"
        this.view.appendChild(this.text)

        this.view.onclick = function () {
            const editor = atom.workspace.getActiveTextEditor()
            if (editor) {
                atom.commands.dispatch(atom.views.getView(editor), "indent-detective:choose-indent")
            } // else do nothing
        }

        // Initial Visibility
        this.updateDisplay(atom.workspace.getActiveTextEditor())

        // consumeStatusBar
        this.tile = bar.addRightTile({
            item: this.view,
            priority: 10.5,
        })
    }

    // Toggles the visibility of statusbar item
    updateDisplay(editor?: TextEditor | undefined) {
        if (editor) {
            this.view.style.display = ""
            this.updateText(editor)
        } else {
            this.view.style.display = "none"
            this.clearText()
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
        if (this.text != null) {
            this.text.innerText = text
        }
    }

    // Called from updateDisplay
    clearText() {
        if (this.text != null) {
            this.text.innerText = ""
        }
    }

    // Destroy when package is deactivated
    destroy() {
        if (this.tile != null) {
            this.tile.destroy()
        }
    }
}
