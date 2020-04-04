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

        // Enable Debug Messages
        await atom.config.set("indent-detective.enableDebugMessages", true)

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

    describe("Automatic Indent Calculation", () =>
        it("Tab length is equal to AcuteML.jl's tab length and the name of the calculated indent is displayed in status bar ", () => {

            // AcuteML.jl tab length is 4

            // Tab length
            expect(editor.getSoftTabs()).toBe(true)
            // expect(editor.getTabLength()).toBe(4) // TODO Failing

            // StatusBar
            expect(indentStatus.style.display).toBe("")
            expect(indentStatus.querySelector("a").textContent).toBe("Spaces (4)")
        })
    )

    describe("when indent-selector:choose-indent is triggered", () =>
        it("displays a list of all the available indent options", async () => {
            const indentView = await getIndentView(editor)

            // default settings
            expect(indentView.items).toEqual([
                { text: "Automatic", length: 0 },
                { text: "2 Spaces", length: 2 },
                { text: "3 Spaces", length: 3 },
                { text: "4 Spaces", length: 4 },
                { text: "6 Spaces", length: 6 },
                { text: "8 Spaces", length: 8 },
                { text: "Tabs", length: "tab" }
            ])

            const indentViewElement = indentView.element

            // default settings
            expect(indentViewElement.querySelectorAll("li").length).toBe(5 + 2)
            expect(indentViewElement.querySelectorAll("li")[0].textContent).toBe("Automatic")
            expect(indentViewElement.querySelectorAll("li")[1].textContent).toBe("2 Spaces")
            expect(indentViewElement.querySelectorAll("li")[2].textContent).toBe("3 Spaces")
            expect(indentViewElement.querySelectorAll("li")[3].textContent).toBe("4 Spaces")
            expect(indentViewElement.querySelectorAll("li")[4].textContent).toBe("6 Spaces")
            expect(indentViewElement.querySelectorAll("li")[5].textContent).toBe("8 Spaces")
            expect(indentViewElement.querySelectorAll("li")[6].textContent).toBe("Tabs")
        })
    )


    describe("when an indent option is selected", () =>
        it("the tab length is set and displayed in status bar", async () => {
            const indentView = await getIndentView(editor)
            const indentSetting = { text: "2 Spaces", length: 2 } // Selected option
            indentView.props.didConfirmSelection(indentSetting)

            // Tab length
            expect(editor.getSoftTabs()).toBe(true)
            expect(editor.getTabLength()).toBe(indentSetting.length)

            // StatusBar
            expect(indentStatus.style.display).toBe("")
            expect(indentStatus.querySelector("a").textContent).toBe("Spaces (2)")
        })
    )

    describe("when Automatic is selected", () =>
        it("AcuteML.jl tab length should be given (already calculated) and displayed in statusbar", async () => {
            const indentView = await getIndentView(editor)
            const indentSetting = { text: "Automatic", length: 0 }
            indentView.props.didConfirmSelection(indentSetting)

            // Tab length
            expect(editor.getSoftTabs()).toBe(true)
            expect(editor.getTabLength()).toBe(4) // AcuteML.jl tab length

            // StatusBar
            expect(indentStatus.style.display).toBe("")
            expect(indentStatus.querySelector("a").textContent).toBe("Spaces (4)")
        })
    )

    describe("when Tabs is selected", () =>
        it("Soft tabs is disabled and Tabs is displated in status bar", async () => {
            const indentView = await getIndentView(editor)
            const indentSetting = { text: "Tabs", length: "tab" }
            // @ts-ignore
            indentView.props.didConfirmSelection(indentSetting)

            // Tab length
            expect(editor.getSoftTabs()).toBe(false)

            // StatusBar
            expect(indentStatus.style.display).toBe("")
            expect(indentStatus.querySelector("a").textContent).toBe("Tabs")
        })
    )

    describe("When Clicking on StatusBar item", () =>
        it("shows the selector menu", () => {
            const eventHandler = jasmine.createSpy("eventHandler")
            atom.commands.add(editor.getElement(), "indent-detective:choose-indent", eventHandler)
            indentStatus.click()
            expect(eventHandler).toHaveBeenCalled()
        })
    )

    // TODO doesn't work
    // it("When editor is not a text editor", async () => {
    //     await atom.workspace.getActivePane().destroy()
    //     let pane = await atom.workspace.open("atom://config/packages/indent-detective")
    //
    //     expect(indentStatus.style.display).toBe("none")
    //     expect(indentStatus.querySelector("a").textContent).toBe("")
    // })
})
