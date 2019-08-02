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

  update: (editor) ->
    if editor
      @view.style.display = ""
      @updateText editor
    else
      @view.style.display = "none"
      @clearText()

  updateText: (editor) ->
    if editor.getSoftTabs()
      text = "Spaces (#{editor.getTabLength()})"
    else
      text = "Tabs"
    @text?.innerText = text

  clearText: ->
    @text?.innerText = ""
