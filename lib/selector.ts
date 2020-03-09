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

            // an array containing the objects you want to show in the select list
            items: getItemsList(),

            // called whenever an item needs to be displayed.
            elementForItem: function (indent: IndentSetting) {
                const element = document.createElement('li');
                element.textContent = indent.text;
                return element;
            },

            // called to retrieve a string property on each item and that will be used to filter them.
            filterKeyForItem: function (indent: IndentSetting) {
                return indent.text
            },

