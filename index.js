import { state } from "./initialState.js";
import { UsersList } from "./users/users-list.js";
import { UtilService } from "./util.service.js";
import { ReposList } from "./repos/repos-list.js";
import { User } from "./users/user-detail.js";

/**
 * Application root.
 * @constructor
 * @param {string} title - The application title
 * @param {string} title - The application tabs
 */
export function AppRoot(title, tabs = []) {
    this.title = title;
    this.tabs = tabs;

    this.usersList = new UsersList();
    this.utilService = new UtilService();
    this.reposList = new ReposList();

    window.addEventListener('popstate', (event) => {
        event.preventDefault();
        this.initTabContent(window.history.state.type, window.history.state.pageUrl);

    }, false);
}

/**
 * Adds Event listener for tab click
 */
AppRoot.prototype.addListenerOnTabClick = function () {
    const refs = [...document.querySelectorAll(`[class="tablinks"]`)];
    refs.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            refs.forEach(item => {
                this.utilService.removeClass(item, 'active');
            });
            this.utilService.addClass(item, 'active');
            const type = Object.assign({}, event.target.dataset).type;
            this.initTabContent(type, `?page=${this.getPageNameByTabType(type)}`);
        });
    });
};

/**
 * Gets tab name by type
 * @param {string} type - Type of tab
 * @return {string} name - Name of tab
 */
AppRoot.prototype.getPageNameByTabType = function (type) {
    let name = '';
    const tabTypes = state.tabTypes;
    switch (type) {
        case tabTypes.users:
            name = `users`;
            break;
        case tabTypes.repos:
            name = `repos`;
            break;

        default:
            break;
    }
    return name;
};

/**
 * Listens event of "Enter" key for search
 */
AppRoot.prototype.addLisenerOnSearchKeyup = function () {
    const searchInput = [...document.querySelectorAll(`[class*="search"]`)][0];

    if (!searchInput) {
        return false;
    }
    searchInput.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            var evt = new CustomEvent('onSearchEnter', {detail: event});
            window.dispatchEvent(evt);
        }
    })
};

/**
 * Initializes component
 *
 * @param {array} tabs - Array of tabs
 * @return {string} - Html representation of tab
 */
AppRoot.prototype.initTabs = function (tabs) {
    return `${this.generateTabs(tabs)}`;
};

/**
 * Generates tabs
 *
 * @param {array} tabsObj - Array of tabs
 * @return {string} - Html representation of tab
 */
AppRoot.prototype.generateTabs = function (tabsObj) {
    let tabsHtml = '';
    tabsObj.map(tab => {
        tabsHtml += `<button class="tablinks" data-type="${tab.type}" >${tab.name}</button>`;
    });

    return `<div class="tab">${tabsHtml}</div>`;
};

/**
 * Initializes root component
 *
 * @return {string} - Html representation of main page
 */
AppRoot.prototype.initAppRootContent = function () {
    return `
        <div class="main-title">${this.title}</div>
        ${this.initTabs(this.tabs)}
        <div class="main"></div>
    `;
};

/**
 * Construct and render the page
 */
AppRoot.prototype.render = function () {
    const body = document.getElementsByTagName("body")[0];
    body.innerHTML = this.initAppRootContent();
    this.addListenerOnTabClick();
    if (window.history.state) {
        this.initTabContent(window.history.state.type, window.history.state.pageUrl);
    }

    const queryParams = this.utilService.getAllUrlParams(window.location.href);
    if ('username' in queryParams) {
        new User(queryParams.username).render();
    }
};

/**
 * Initializes Users and Repositories components
 */
AppRoot.prototype.initTabContent = function (type, pageUrl) {
    const tabTypes = state.tabTypes;
    switch (type) {
        case tabTypes.users:
            document.title = 'Users List';
            window.history.pushState({type, pageUrl}, 'Users List', pageUrl);
            this.usersList.render();
            break;
        case tabTypes.repos:
            document.title = 'Repository List';
            window.history.pushState({type, pageUrl}, "Repos List", pageUrl);
            this.reposList.render();
            break;

        default:
            break;
    }

    const refs = [...document.querySelectorAll(`[class*="tablinks"]`)];
    refs.forEach(item => {
        this.utilService.removeClass(item, 'active');
    });
    refs.forEach(item => {
        const t = Object.assign({}, item.dataset).type;
        if (t == type) {
            this.utilService.addClass(item, 'active');
        }
    });

    this.addLisenerOnSearchKeyup();
};
