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
