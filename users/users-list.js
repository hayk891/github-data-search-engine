import { state } from "../initialState.js";
import { SearchComponent } from "../search/search.component.js";
import { UtilService } from "../util.service.js";
import { User } from "./user-detail.js";
import { PaginationComponent } from "../pagination/pagination.component.js";

/**
 * Represents a UsersList.
 * @constructor
 */
export function UsersList() {
    this.mainContentClass = state.mainContentClass;
    this.searchComponentInitData = {};
    this.searchComponent = null;
    this.utilService = new UtilService();
    this.pagination = new PaginationComponent({name: 'users-list'});

    this.searchString = '';
    this.totalCount = null;
    this.page = 0;
    this.per_page = state.itemsPerPage;

    this.listenCustomEvents();
}

/**
 * Listens to custom events(search, previous, next button clicks )
 */
UsersList.prototype.listenCustomEvents = function () {
    window.addEventListener('onSearchEnter', (e) => {
        const target = e.detail.target;
        const tabType = Object.assign({}, e.detail.target.dataset).tab;
        if (tabType === state.tabTypes.users) {
            this.searchString = target.value;
            this.getUsersByFilter(target.value)
                .then(result => {
                    if (!result.incomplete_results) {
                        this.totalCount = result.total_count;
                        const items = result.items;
                        const html = this.initFilterdUsersList(items);

                        var parent = document.getElementById('users-list');
                        parent.innerHTML = html;

                        this.addListenerOnUserClick();
                        this.pagination.addPaginationClickEvent();
                    }

                });
        }
    });

    window.addEventListener('prevButtonClicked', (e) => {
        if (this.page <= 0) {
            return false;
        }
        const target = e.detail.target;
        const page = Object.assign({}, target.dataset).page;

        this.page -= this.per_page;

        if (page === 'users-list') {
            this.updateUserList();
        }
    });

    window.addEventListener('nextButtonClicked', (e) => {
        if (this.page >= this.totalCount) {
            return false;
        }
        const target = e.detail.target;
        const pageName = Object.assign({}, target.dataset).page;

        this.page += this.per_page;

        // [this.page, this.per_page] = [this.per_page, this.page + state.itemsPerPage];
        if (pageName === 'users-list') {
            this.updateUserList();
        }
    });
};

/**
 * Update users list according to search result
 */
UsersList.prototype.updateUserList = function () {
    this.getUsersByFilter(this.searchString, this.page, this.per_page)
        .then(result => {
            if (!result.incomplete_results) {
                this.totalCount = result.total_count;
                const items = result.items;
                const html = this.initFilterdUsersList(items);

                var parent = document.getElementById('users-list');
                parent.innerHTML = html;
                this.addListenerOnUserClick();
                this.pagination.addPaginationClickEvent();
            }
        });
};

/**
 * Listens to click event on user item
 */
UsersList.prototype.addListenerOnUserClick = function () {
    const usersLink = [...document.querySelectorAll(`[class="user-item"]`)];
    usersLink.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const username = Object.assign({}, item.dataset).user;
            const pageUrl = `?page=users&username=${username}`;
            history.replaceState({type: 3, pageUrl}, 'User info', pageUrl);

            new User(username).render();
        })
    })
};

/**
 * Initializes component
 * */
UsersList.prototype.render = function () {
    const usersListElement = document.getElementsByClassName(this.mainContentClass)[0];
    usersListElement.innerHTML = this.initUsersListContent();
    this.listenCustomEvents();
};

/**
 * Initializes user list content
 * */
UsersList.prototype.initUsersListContent = function () {
    const queryParams = this.utilService.getAllUrlParams(window.location.href);
    this.searchComponentInitData = {
        element: document.getElementsByClassName(this.mainContentClass)[0],
        name: 'users',
        placeholder: 'Search Github Users',
        tabType: state.tabTypes.users
    };
    this.searchComponent = new SearchComponent(this.searchComponentInitData);

    return `
            <div class="search-component-block">
                ${this.searchComponent.render()}       
            </div>
            <div id="users-list" class=""></div>
            `;
};

/**
 * Gets users by  filter
 *
 * @param query <string> - search string
 * @param page <number> - page start index
 * @param per_page <number> - items count per page
 * */
UsersList.prototype.getUsersByFilter = function (query = '', page = 0, per_page = 20) {
    const url = `search/users?q=${query}&page=${page}&per_page=${per_page}`;
    return this.utilService.httpCall(url);
};

/**
 * Initializes page Html source
 *
 * @param items <array> - page items array
 * @return {string} Html representation of user list
 * */
UsersList.prototype.initFilterdUsersList = function (items) {
    if (items.length === 0) {
        return `<p>Users with your search param not found</p>`
    }

    let htmlItems = ``;

    items.forEach(item => {
        htmlItems += `
        <div class="user-item-block">
            <div class="user-item" data-user="${item.login}">
                <img class="user-img" src="${item.avatar_url}" alt="Avatar" >
                
                    <h4 class="user-name">
                    ${item.login}
                    </h4>
              
            </div>
        </div>
        `
    });

    let paginationBlock = '';
    if (items.length >= state.itemsPerPage) {
        paginationBlock += `
        <div class="pagination-block">
            ${this.pagination.render()}
        </div>
        `
    }

    return `
        ${paginationBlock}
        <div class="row">
            ${htmlItems}
        </div>
        ${paginationBlock}
    `;

};
