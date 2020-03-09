'use babel'

// TODO: Converting to wasm using https://docs.assemblyscript.org/
import { CompositeDisposable, TextEditor } from 'atom'
import {StatusBar} from "atom/status-bar";

import status from './status'
import {selector_show} from './selector'

// type for length settings
export type lengthSetting = number | "tab" ;
// object to hold indent setting for one item
export type IndentSetting = { text: string, length: lengthSetting};

let possibleIndentations :Array<number> = [];

let enableDebug = false
let manual = new Set<TextEditor>()
let subs :CompositeDisposable

export const config = {
  possibleIndentations: {
    type: "array",
    default: [2, 3, 4, 6, 8],
    items: {type: "number"},
    title: "possible indentations",
    description: 'Write possible indentations that package should consider',
    order: 1
  }
}

export function activate() {
  subs = new CompositeDisposable()  // subscriptions
  status.activate()

  subs.add(
      atom.workspace.observeTextEditors((ed) => {
        run(ed)
        const sub = ed.onDidStopChanging(() => {
          run(ed)
        })
        subs.add(ed.onDidDestroy(() => {
          sub.dispose()
          manual.delete(ed)
        }))
      }),
      atom.workspace.onDidStopChangingActivePaneItem((item) => {
        if (item instanceof TextEditor) {
          run(item)
        } else {
          status.update()
        }
      }),

      atom.commands.add('atom-text-editor', {
        'indent-detective:choose-indent': function() {selector_show(subs)}
      })
  )
}

export function deactivate() {
  subs.dispose()
  manual.clear()
  status.deactivate()
}

export function consumeStatusBar(bar :StatusBar) {
  status.consumeStatusBar(bar)
}

function run (editor :TextEditor) {
  if (editor.isDestroyed()) return
  if (!manual.has(editor)) {
    setSettings(editor, getIndent(editor))
  }

  status.update(editor)
}

function setSettings(editor :TextEditor, length :lengthSetting) {
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

function bestOf(counts:Array<number>) {
  let best :number = 0
  let score :number = 0
  for (let vote = 0; vote < counts.length; vote++) {
    if (possibleIndentations.indexOf(vote) > -1 &&
        counts[vote] > score) {
      best = vote
      score = counts[vote]
    }
  }
  return best
}

function getIndent(editor :TextEditor) {
  let row = -1
  let counts: Array<number> = [];
  let previousIndent = 0
  let previousDiff = 0
  let numberOfCounts = 0
  for (const line of editor.getBuffer().getLines()) {
    if (numberOfCounts > 150) break
    row += 1
    if (!isValidLine(row, line, editor)) continue
    const indent = lineIndent(line)

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

function isValidLine(row :number, line :string, editor :TextEditor) {
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

function lineIndent(line :string) {
  if (line.match(/^\t+/)) {
    return "tab"
  } else {
    return line.match(/^([ ]*)/)[0].length
  }
}

export function setIndent(editor: TextEditor, indent :IndentSetting) {
    if (indent.text == "Automatic") {
      manual.delete(editor)
      run(editor)
    } else {
      setSettings(editor, indent.length)
      manual.add(editor)
      status.update(editor)
    }
}

export function getItemsList() {

  possibleIndentations = atom.config.get('indent-detective.possibleIndentations')

  const possibleIndentations_length = possibleIndentations.length

  // items declaration (Array<object> template)
  let items = new Array<IndentSetting>( possibleIndentations_length + 2)

  // items filling
  items[0] = {text: "Automatic", length: 0};
  for (let ind = 0; ind < possibleIndentations_length; ind++) {
    items[ind+1] = {text: `${possibleIndentations[ind]} Spaces`, length: possibleIndentations[ind]};
  }
  items[possibleIndentations_length+1] = {text: "Tabs", length: "tab"}

  return items
}
