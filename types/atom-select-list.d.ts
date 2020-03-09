declare module 'atom-select-list'{
    class SelectListView {
        static setScheduler(scheduler: any): void;
        static getScheduler(scheduler: any): any;
        constructor(props: any);
        initializeVisibilityObserver(): void;
        focus(): void;
        didLoseFocus(event: any): void;
        reset(): void;
        destroy(): any;
        registerAtomCommands(): import("atom").CompositeDisposable;
        update(props?: {}): any;
        render(): any;
        renderItems(): any;
        renderErrorMessage(): any;
        renderInfoMessage(): any;
        renderLoadingMessage(): any;
        getQuery(): any;
        getFilterQuery(): any;
        didChangeQuery(): void;
        didClickItem(itemIndex: any): void;
        computeItems(updateComponent?: any): void;
        fuzzyFilter(items: any, query?: any): any;
        getSelectedItem(): any;
        renderItemAtIndex(index: any): void;
        selectPrevious(): any;
        selectNext(): any;
        selectFirst(): any;
        selectLast(): any;
        selectNone(): any;
        selectIndex(index: any, updateComponent?: boolean): any;
        selectItem(item: any): any;
        confirmSelection(): void;
        cancelSelection(): void;
    }
    class ListItemView {
        selected: any;
        onclick: any;
        element: any;
        domEventsDisposable: any;
        constructor(props: any);
        mouseDown(event: any): void;
        mouseUp(event: any): void;
        didClick(event: any): void;
        destroy(): void;
        update(props: any): void;
        scrollIntoViewIfNeeded(): void;
    }

    export {SelectListView}
}
