'use babel'

// TODO: Converting to wasm using https://docs.assemblyscript.org/

import {CompositeDisposable, TextEditor} from 'atom'
import {StatusBar} from "atom/status-bar"

import {IndentStatusItem} from './status'
import {selector_show} from './selector'

// type for length settings
export type lengthSetting = number | "tab"
// object to hold indent setting for one item
export type IndentSetting = { text: string, length: lengthSetting }

// TODO: make these two const
let possibleIndentations: Array<number>
export let SelectorItems :Array<IndentSetting>

const enableDebug = false
const manual = new Set<TextEditor>()
let subs: CompositeDisposable
let statusItem: IndentStatusItem | undefined // undefined when statusbar isn't consumed

export const config = {
    // HACK: Array of strings because of Atom's setting issue (settings-view)
    possibleIndentations_str: {
        type: "array",
        default: ["2", "3", "4", "6", "8"],
        items: {type: "string"},
        title: "possible indentations",
        description: 'Write possible indentations that package should consider (changing requires Atom\'s restart/reload)',
        order: 1
    }
}

export function activate() {
    subs = new CompositeDisposable()  // subscriptions

    // Getting possibleIndentations from config
    possibleIndentations = atom.config.get('indent-detective.possibleIndentations_str')
        .map(function (el: string) {
            return parseInt(el)
        }) // because of the HACK

    // Calculating SelectorItems
    SelectorItems = getItemsList()

    subs.add(
        // Called for every TextEditor opening/closing
        atom.workspace.observeTextEditors(function (editor: TextEditor) {
            run(editor)
            const sub = editor.onDidStopChanging(() => {
                run(editor)
            })
            subs.add(editor.onDidDestroy(() => {
                sub.dispose()
                manual.delete(editor)
            }))
        }),

        atom.workspace.onDidStopChangingActivePaneItem((item) => {
            if (item instanceof TextEditor) {
                run(item)
            } else {
                if (statusItem != undefined) {
                    statusItem.updateDisplay()
                }
            }
        }),

        atom.commands.add('atom-text-editor', {
            'indent-detective:choose-indent': function () {
                selector_show(subs)
            }
        })
    )
}

export function deactivate() {
    subs.dispose()
    manual.clear()
    if (statusItem != undefined) { // if doesn't exist yet
        statusItem.destroy()
    }
}

// Called only once for each Atom session
export function consumeStatusBar(bar: StatusBar) {
    statusItem = new IndentStatusItem()
    statusItem.consumeStatusBar(bar)
}

// Runs for every TextEditor opening/closing
function run(editor: TextEditor) {
    if (editor.isDestroyed()) {
        return
    }
    if (!manual.has(editor)) {
        setSettings(editor, getIndent(editor))
    }
    if (statusItem != undefined) { // Initially may be undefined (activate() called before consumeStatusBar())
        statusItem.updateDisplay(editor)
    }
}

function setSettings(editor: TextEditor, length: lengthSetting) {
    if (enableDebug) {
        console.log(`-> decided for ${length}`)
    }
    if (length == 0) return // default settings

    if (length == "tab") {
        editor.setSoftTabs(false)
    } else if (length >= Math.min(...possibleIndentations) && length <= Math.max(...possibleIndentations)) {
        editor.setSoftTabs(true)
        editor.setTabLength(length)
    }
}

function bestOf(counts: Array<number>) {
    let best: number = 0
    let score: number = 0
    for (let vote = 0; vote < counts.length; vote++) {
        if (possibleIndentations.indexOf(vote) > -1 &&
            counts[vote] > score) {
            best = vote
            score = counts[vote]
        }
    }
    return best
}

function getIndent(editor: TextEditor) {
    let row = -1
    const counts: Array<number> = []
    let previousIndent = 0
    let previousDiff = 0
    let numberOfCounts = 0
    const editorLines = editor.getBuffer().getLines()
    for (const line of editorLines) {
        if (numberOfCounts > 150) break
        row += 1
        if (!isValidLine(row, line, editor)) continue
        const indent = lineIndent(line)

        if (indent == null) { // TODO do we need this?
            continue
        }

        if (indent == 'tab') return 'tab'
        const diff = Math.abs(indent - previousIndent)

        if (diff == 0) {
            if (previousDiff != 0 && indent != 0) {
                counts[previousDiff] += 1
            }
        } else {
            if (!counts[diff]) counts[diff] = 0
            counts[diff] += 1
            previousDiff = diff
        }

        previousIndent = indent
        numberOfCounts += 1
    }
    if (enableDebug) {
        console.log(`Indent Detective report for ${editor.getPath()}`)
        console.log(counts)
    }
    return bestOf(counts)
}

function isValidLine(row: number, line: string, editor: TextEditor) {
    // empty line
    if (line.match(/^\s*$/)) return false

    // line is part of a comment or string
    for (const scope of editor.scopeDescriptorForBufferPosition([row, 0]).getScopesArray()) {
        if (scope.indexOf('comment') > -1 ||
            scope.indexOf('docstring') > -1 ||
            scope.indexOf('string') > -1) {
            return false
        }
    }

    return true
}

function lineIndent(line: string) {
    if (line.match(/^\t+/)) {
        return "tab"
    } else {
        const match = line.match(/^([ ]*)/)
        // TODO: do we need checking?
        if (match) {
            return match[0].length
        } else {
            return null
        }
    }
}

export function setIndent(editor: TextEditor, indent: IndentSetting) {
    if (indent.text == "Automatic") {
        manual.delete(editor)
        run(editor)
    } else {
        setSettings(editor, indent.length)
        manual.add(editor)
        if (statusItem != undefined) {
            statusItem.updateDisplay(editor)
        }
    }
}

// Called only once in activate to calculate SelectorItems
function getItemsList() {

    const possibleIndentations_length = possibleIndentations.length

    // items declaration (Array<object> template)
    const items = new Array<IndentSetting>(possibleIndentations_length + 2)

    // items filling
    items[0] = {text: "Automatic", length: 0}
    for (let ind = 0; ind < possibleIndentations_length; ind++) {
        items[ind + 1] = {text: `${possibleIndentations[ind]} Spaces`, length: possibleIndentations[ind]}
    }
    items[possibleIndentations_length + 1] = {text: "Tabs", length: "tab"}

    return items // SelectorItems
}
