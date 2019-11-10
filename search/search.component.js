
export function SearchComponent(parent) {
    this.parent = parent;
    this.inputElement = this.init();
}

SearchComponent.prototype.render = function () {
    return this.inputElement;
};

SearchComponent.prototype.init = function () {
    return `<input 
                type="text" 
                class="search"
                data-tab="${this.parent.tabType}"
                id="search-${this.parent.name}"
                placeholder="${this.parent.placeholder}"
                />`;
};
