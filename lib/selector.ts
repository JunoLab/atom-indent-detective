/// <reference path="../types/atom-select-list.d.ts"/>
import {SelectListView} from 'atom-select-list';

import {TextEditor, CompositeDisposable, Panel, Disposable} from 'atom';
import {IndentSetting, setIndent, getItemsList} from './indent-detective';
export function selector_show(subs: CompositeDisposable) {

    
    let makeModalPanel :boolean = true
    let modalPanel: Panel
    let indentListView :SelectListView

    if (makeModalPanel) {

        // Defining a SelectListView with methods - https://github.com/atom/atom-select-list
        indentListView = new SelectListView({

