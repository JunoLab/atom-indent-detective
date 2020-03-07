'use babel'

import { CompositeDisposable, TextEditor } from 'atom'
import status from './status'
import selector from './selector'

let possibleIndentations = []
let enableDebug = false
const manual = new Set()
let subs

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
      possibleIndentations = opts.map(el => parseInt(el))
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

export function consumeStatusBar (bar) {
  status.consumeStatusBar(bar)
}

function run (editor) {
  if (editor.isDestroyed()) return
  if (!manual.has(editor)) {
    setSettings(editor, getIndent(editor))
  }

  status.update(editor)
}

function setSettings (editor, indent) {
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

  for (let vote in counts) {
    vote = parseInt(vote)
function bestOf (counts:Array<number>) {
  let best :number = 0
  let score :number = 0
    if (possibleIndentations.indexOf(vote) > -1 &&
        counts[vote] > score) {
      best = vote
      score = counts[vote]
    }
  }
  return best
}

function getIndent (editor) {
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
    console.log(`Indent Detective report for ${editor.buffer.getBaseName()}`)
    console.log(counts)
  }
  return bestOf(counts)
}

function isValidLine (row, line, editor) {
  // empty line
  if (line.match(/^\s*$/)) return false

  // line is part of a comment or string
  for (const scope of editor.scopeDescriptorForBufferPosition([row, 0]).scopes) {
    if (scope.indexOf('comment') > -1 ||
        scope.indexOf('docstring') > -1 ||
        scope.indexOf('string') > -1) {
          return false
    }
  }

  return true
}

function lineIndent (line) {
  if (line.match(/^\t+/)) {
    return 'tab'
  } else {
    return line.match(/^([ ]*)/)[0].length
  }
}

function select () {
  const items = [{text: 'Automatic'}]
  for (const n of possibleIndentations) {
    items.push({text: `${n} Spaces`, length: n})
  }
  items.push({text: 'Tabs', length: 'tab'})
  selector.show(items, ({text, length}={}) =>{
    const editor = atom.workspace.getActiveTextEditor()
    if (text == 'Automatic') {
      manual.delete(editor)
      run(editor)
    } else {
      setSettings(editor, length)
      manual.add(editor)
      status.update(editor)
    }
  })
}

export var config = {
  possibleIndentations: {
    type: 'array',
    // HACK: array of strings because settings-view is broken
    default: ['2','3', '4', '6', '8'],
    items: {
      type: 'string'
    },
    order: 1
  },
  enableDebugMessages: {
    type: 'boolean',
    default: false,
    order: 2
  }
}
