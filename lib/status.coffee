module.exports =
  activate: ->
    @createView()
    @subscription = atom.workspace.observeActivePaneItem =>
      @update()

  deactivate: ->
    @tile?.destroy()

  consumeStatusBar: (bar) ->
    @bar = bar
    @update()

  createView: ->
    @view = document.createElement 'span'
    @view.classList.add 'indent-status', 'inline-block'
    @text = document.createElement 'a'
    @text.innerText = "Spaces (2)"
    @view.appendChild @text
    @view.onclick = =>
      atom.commands.dispatch atom.views.getView(atom.workspace.getActiveTextEditor()),
       'smart-indent:choose-indent-settings'

  updateView: ->
    return unless @bar?
    if !atom.workspace.getActiveTextEditor()
      @tile?.destroy()
    else
      @tile = @bar.addRightTile
        item: @view
        priority: 10.5

  updateText: ->
    ed = atom.workspace.getActiveTextEditor()
    if ed
      if ed.getSoftTabs()
        text = "Spaces (#{ed.getTabLength()})"
      else
        text = "Tabs"
      @text?.innerText = text

  update: () ->
    @updateView()
    @updateText()
