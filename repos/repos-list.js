
import { state } from "../initialState.js";
import { SearchComponent } from "../search/search.component.js";
import { UtilService } from "../util.service.js";
import { PaginationComponent } from "../pagination/pagination.component.js";


/**
 * Represents a Repositories.
 * @constructor
 */
export function ReposList() {
    this.mainContentClass = state.mainContentClass;
    this.searchComponentInitData = {};
    this.searchComponent = null;
    this.searchString = '';
    this.utilService = new UtilService();
    this.totalCount = null;
    this.pagination = new PaginationComponent({name: 'repos-list'});

    this.searchString = '';
    this.totalCount = null;
    this.page = 0;
    this.per_page = state.itemsPerPage;

    this.listenCustomEvents();
}

/**
 * Listens events for search of Repositories list
 * */
ReposList.prototype.listenCustomEvents = function(){
    //Listen to your custom event search
    window.addEventListener('onSearchEnter', (e) => {
        const target = e.detail.target;
        const tabType = Object.assign({}, e.detail.target.dataset).tab;
        if(tabType === state.tabTypes.repos) {
            this.searchString = target.value;
            this.getReposByFilter(this.searchString)
                .then(result => {
                    if(!result.incomplete_results) {
                        this.totalCount = result.total_count;
                        const items = result.items;
                        const html = this.initFilterdReposList(items);

                        var parent = document.getElementsByClassName('repos-list')[0];
                        parent.innerHTML = html;

                        this.pagination.addPaginationClickEvent();
                    }
                })
        }
    });

    //Listen custom event pagination
    window.addEventListener('prevButtonClicked', (e) => {
        if(this.page <= 0){
            return false;
        }
        const target = e.detail.target;
        const page = Object.assign({}, target.dataset).page;

        this.page -=  this.per_page;

        if(page === 'repos-list') {
            this.updateReposList();
        }
    });

    //Listen custom event pagination
    window.addEventListener('nextButtonClicked', (e) => {
        if(this.page >= this.totalCount){
            return false;
        }
        const target = e.detail.target;
        const pageName = Object.assign({}, target.dataset).page;

        this.page += this.per_page;

        if(pageName === 'repos-list') {
            this.updateReposList();
        }
    });
};

/**
 * Update repositories list according to search result
 */
ReposList.prototype.updateReposList = function() {
    this.getReposByFilter(this.searchString, this.page, this.per_page)
        .then(result => {
            if(!result.incomplete_results) {
                this.totalCount = result.total_count;
                const items = result.items;
                const html = this.initFilterdReposList(items);

                var parent = document.getElementsByClassName('repos-list')[0];
                parent.innerHTML = html;

                this.pagination.addPaginationClickEvent();
            }
        })
};

/**
 * Construct and render the page
 */
ReposList.prototype.render = function () {
    const usersListElement = document.getElementsByClassName(this.mainContentClass)[0];
    usersListElement.innerHTML = this.initReposListContent();
};

/**
 * Initializes repositories list content
 * */
ReposList.prototype.initReposListContent = function () {
    this.searchComponentInitData = {
        element: document.getElementsByClassName(this.mainContentClass)[0],
        name: 'repos',
        placeholder: 'Search Repositories',
        tabType: state.tabTypes.repos
    };
    this.searchComponent = new SearchComponent(this.searchComponentInitData);

    return `
            <div class="search-component-block">
                ${this.searchComponent.render()}       
            </div>
            <div class="repos-list"></div>
            `;
};

/**
 * Gets Repositories by  filter
 *
 * @param query <string> - search string
 * @param page <number> - page start index
 * @param per_page <number> - items count per page
 * */
ReposList.prototype.getReposByFilter = function(query = '', page = 0, per_page = 20) {
    const url = `search/repositories?q=${query}&page=${page}&per_page=${per_page}`;
    return this.utilService.httpCall(url);
};

/**
 * Initializes page Html source
 *
 * @param items <array> - page items array
 * @return {string} Html representation of repositories list
 * */
ReposList.prototype.initFilterdReposList = function (items) {
    if (items.length === 0){
        return `<p>Repositories with your search param not found</p>`
    }

    let htmlItems = '';
    items.forEach(item => {
        htmlItems += `
            <li>${item.full_name} --  <a href="${item.clone_url}" target="_blank"><b>${item.clone_url}</b></a></li>
        `
    });

    let paginationBlock = '';
    if(items.length >= state.itemsPerPage) {
        paginationBlock += `
        <div class="pagination-block">
            ${this.pagination.render()}
        </div>
        `
    }

    return `
        ${paginationBlock}
        <div class="">
            <ul class="repos-list-element">
                ${htmlItems}
            </ul>
        </div>
        ${paginationBlock}
    `;

};
