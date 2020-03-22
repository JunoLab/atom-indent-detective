'use babel'

import { CompositeDisposable, TextEditor } from 'atom'
import {StatusBar} from "atom/status-bar";

import status from './status'
import selector from './selector'

// TODO: Array of numbers
let possibleIndentations :Array<number> = [];

let enableDebug = false
const manual = new Set()
let subs :CompositeDisposable

export const config = {
  possibleIndentations: {
    type: 'array',
    default: [2, 3, 4, 6, 8],
    items: {
      type: 'number'
    },
    order: 1
  },
  enableDebugMessages: {
    type: 'boolean',
    default: false,
    order: 2
  }
};

export function activate () {
  subs = new CompositeDisposable()
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
      'indent-detective:choose-indent': () => select()
    }),
    atom.config.observe('indent-detective.possibleIndentations', (opts) => {
      possibleIndentations = opts
    }),
    atom.config.observe('indent-detective.enableDebugMessages', (val) => {
      enableDebug = val
    })
  )
}

export function deactivate () {
  subs.dispose()
  manual.clear()
  status.deactivate()
}

export function consumeStatusBar (bar :StatusBar) {
  status.consumeStatusBar(bar)
}

function run (editor :TextEditor) {
  if (editor.isDestroyed()) return
  if (!manual.has(editor)) {
    setSettings(editor, getIndent(editor))
  }

  status.update(editor)
}

function setSettings (editor :TextEditor, indent) {
  if (enableDebug) {
    console.log(`-> decided for ${indent}`)
  }
  if (indent == 0) return // default settings

  if (indent == 'tab') {
    editor.setSoftTabs(false)
  } else if (indent >= Math.min(...possibleIndentations) && indent <= Math.max(...possibleIndentations)) {
    editor.setSoftTabs(true)
    editor.setTabLength(indent)
  }
}

function bestOf (counts:Array<number>) {
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

function getIndent (editor :TextEditor) {
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

function isValidLine (row :number, line :string, editor :TextEditor) {
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

function lineIndent (line :string) {
  if (line.match(/^\t+/)) {
    return 'tab'
  } else {
    return line.match(/^([ ]*)/)[0].length
  }
}

function select () {
  // Array<object> template + Initial value
  let items: Array<{ text: string, length: number | string }> = [{text: 'Automatic', length: 'auto'}];
  // Rest of the elements
  // TODO: array comprehension:
  for (const n of possibleIndentations) {
    items.push({text: `${n} Spaces`, length: n})
  }
  items.push({text: 'Tabs', length: 'tab'})

  selector.show(items, ({text, length}={}) =>{
    const editor = atom.workspace.getActiveTextEditor()
    if (editor instanceof TextEditor){ // to make sure is defined
      if (text == 'Automatic') {
        manual.delete(editor)
        run(editor)
      } else {
        setSettings(editor, length)
        manual.add(editor)
        status.update(editor)
      }
    }
  })
}
