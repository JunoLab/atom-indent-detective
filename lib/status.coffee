module.exports =
  activate: ->
    @createView()

  deactivate: ->
    @tile?.destroy()

  consumeStatusBar: (bar) ->
    @bar = bar
    @tile = @bar.addRightTile
      item: @view
      priority: 10.5

  createView: ->
    @view = document.createElement 'span'
    @view.classList.add 'indent-status', 'inline-block'
    @text = document.createElement 'a'
    @text.innerText = "Spaces (2)"
    @view.appendChild @text
    @view.onclick = =>
      atom.commands.dispatch atom.views.getView(atom.workspace.getActiveTextEditor()),
       'indent-detective:choose-indent'

  updateText: ->
    ed = atom.workspace.getActiveTextEditor()
    if ed
      if ed.getSoftTabs()
        text = "Spaces (#{ed.getTabLength()})"
      else
        text = "Tabs"
      @text?.innerText = text

  clear: ->
    @text?.innerText = ""
