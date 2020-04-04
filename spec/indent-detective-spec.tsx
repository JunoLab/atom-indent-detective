import path from "path"
import { TextEditor } from "atom"

import { IndentSetting } from "../src/indent-detective"
import { StatusBar, Tile } from "atom/status-bar"

// IndentView (it only has the fields that are needed)
interface IndentView {
    items: IndentSetting[]
    element: HTMLElement
    props: {
        didConfirmSelection: (indent: IndentSetting) => void
    }
}

async function getIndentView(editor: TextEditor): Promise<IndentView> {
    await atom.commands.dispatch(editor.getElement(), "indent-detective:choose-indent")
    return atom.workspace.getModalPanels()[0].getItem()
}

describe("IndentDetective", () => {
    let editor: TextEditor
    let statusBar: StatusBar
    let indentTile: Tile
    let indentStatus: HTMLElement

    beforeEach(async () => {
        jasmine.attachToDOM(atom.views.getView(atom.workspace))
        // Activate Packages
        await atom.packages.activatePackage("status-bar")
        await atom.packages.activatePackage("indent-detective")

        // Open AcuteML.jl
        editor = await atom.workspace.open(path.join(__dirname, "files", "AcuteML.jl")) as TextEditor
        expect(editor.element).toHaveFocus()

        // StatusBar
        statusBar = (document.querySelector("status-bar") as unknown) as StatusBar

        indentTile = statusBar.getRightTiles().slice(-1)[0] // last
        // @ts-ignore
        indentStatus = indentTile.getItem()
        // Wait for status bar service hook
        while (!indentStatus || !indentStatus.textContent) {
            indentStatus = document.querySelector(".indent-status")
        }
        expect(indentStatus).toBeInstanceOf(HTMLElement)
    })
})
