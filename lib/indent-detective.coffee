status = require './status'
selector = require './selector'

module.exports = GuessIndent =

  activate: (state) ->
    @subscription = atom.workspace.observeTextEditors (ed) =>
      @run ed
    status.activate()

    @command = atom.commands.add 'atom-text-editor',
      'smart-indent:choose-indent-settings': =>
        @select()

  deactivate: ->
    @subscription?.dispose()
    @command?.dispose()
    status.deactivate()

  consumeStatusBar: (bar) -> status.consumeStatusBar(bar)

  indent: (s) -> s.match(/^[ \t]*/)[0]

  isblank: (s) -> s.match /^\s*$/

  after: (x, y) -> x.slice(y.length, x.length)

  count: (d, k) ->
    d[k] ?= 0
    d[k] += 1

  bestof: (d) ->
    best = ""
    score = 0
    for k, v of d
      if v > score
        best = k
        score = v
    best

  getIndent: (ed) ->
    window.ed = ed
    votes = {}
    last = ""
    for l in ed.getBuffer().getLines().slice(0,100)
      if @isblank l then continue
      next = @indent l
      if next == last then continue
      if next.startsWith last
        @count votes, @after next, last
      else if last.startsWith next
        @count votes, @after last, next
      last = next
    @bestof votes

  parseIndent: (i) ->
    if i == "" then return
    if i == "\t" then return [null, false]
    count = 0
    for c in i
      return unless c == " "
      count += 1
    [count, true]

  getSettings: (ed) -> @parseIndent @getIndent ed

  setSettings: (ed, [length, soft]=[]) ->
    if soft == true
      ed.setSoftTabs true
      ed.setTabLength length
    else if soft == false
      ed.setSoftTabs false

  run: (ed) ->
    @setSettings ed, @getSettings ed

  select: ->
    items = [{text: "1 Space", length: 1}]
    items.push(({text: "#{n} Spaces", length: n} for n in [2, 3, 4, 6, 8])...)
    items.push {text: "Tabs"}
    s = selector.show items, ({length}) =>
      @setSettings atom.workspace.getActiveTextEditor(), [length, length?]
      status.update()
