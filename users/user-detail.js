import { state } from "../initialState.js";
import { UtilService } from "../util.service.js";
import { ReposList } from "../repos/repos-list.js";
import { PaginationComponent } from "../pagination/pagination.component.js";
import { UsersList } from "./users-list.js";


/**
 * Represents a User.
 * @constructor
 * @param {string} username - The username of the User.
 */
export function User(username) {
    this.mainContentClass = state.mainContentClass;
    this.UtilService = new UtilService();
    this.userName = username;
    this.reposList = new ReposList();
    Object.assign(this.reposList.pagination, new PaginationComponent({name: 'user-repos'}));
    this.userData = null;
    this.totalCount = null;
    this.mainContent = document.getElementsByClassName(this.mainContentClass)[0];
    this.page = 0;
    this.per_page = state.itemsPerPage;

    this.listenCustomEvents();

}

/**
 * Listens events for pagination of User Repositories list
 * */
User.prototype.listenCustomEvents = function(){

    //Listens custom event pagination
    window.addEventListener('prevButtonClicked', (e) => {

        if(this.page <= 0){
            return false;
        }
        const target = e.detail.target;
        const page = Object.assign({}, target.dataset).page;

        this.page -=  this.per_page;

        if (page === 'user-repos') {
            this.updateUserReposList();
        }
    });

    //Listens custom event pagination
    window.addEventListener('nextButtonClicked', (e) => {
        if(this.page >= this.totalCount){
            return false;
        }
        const target = e.detail.target;
        const pageName = Object.assign({}, target.dataset).page;

        this.page += this.per_page;

        if(pageName === 'user-repos') {
            this.updateUserReposList();
        }
    });
};

/**
 * Update User Repositories list after paginate
 */
User.prototype.updateUserReposList = function() {
    this.getUserRepos(this.page, this.per_page)
        .then(data => {
            const htmlElement = this.mainContent.getElementsByClassName('user-repos-block')[0];
            if (data.length === 0){
                htmlElement.innerHTML = `<p>User does not have repository</p>`;
                return false;
            }
            htmlElement.innerHTML = `
                <div class="user-repos-block">
                    ${this.reposList.initFilterdReposList(data)}
                </div>`;
            this.reposList.pagination.addPaginationClickEvent();

        });
};

/**
 * Initializes component
 */
User.prototype.render = function () {

    this.mainContent.innerHTML = '';
    this.getUserByUsername()
        .then(data => {
            if (data) {
                this.userData = data;
                this.totalCount = data.public_repos;
                this.mainContent.insertAdjacentHTML("afterbegin", this.initUserContent(data));
                this.addEventBackToUsers();

            }
        });

    this.getUserRepos()
        .then(data => {
            if (data.length === 0){
                this.mainContent.insertAdjacentHTML("beforeend", `<p>User does not have repository</p>`);
                return false;
            }
            const reposHtml = `
                <div class="user-repos-block">
                    ${this.reposList.initFilterdReposList(data)}
                </div>`;
            this.mainContent.insertAdjacentHTML("beforeend", reposHtml);
            this.reposList.pagination.addPaginationClickEvent();

        });
};

/** Generates User Info Block part
 *
 * @param {object} userData
 * @return {string} Html
 */
User.prototype.initUserContent = function (userData) {
    return `
        <div class="back-button"> <span class="color-aqua">←</span> Back To Users</div>
        <div class="row user-info-row">
            <div class="user-item-avatar-block">
                <div class="user-item">
                    <img class="user-img" src="${userData.avatar_url}" alt="Avatar" >
                    <h4 class="user-name">
                        ${userData.name}
                    </h4>
                </div>
            </div>
            <div class=" user-info-block">
                <div class="info">BIO : ${userData.bio ? userData.bio : ''}</div>
                <div class="info">Blog: ${userData.blog ? userData.blog : ''}</div>
                <div class="info">Company: ${userData.company ? userData.company : ''}</div>
                <div class="info">Location: ${userData.location ? userData.location : ''}</div>
            </div>
        </div>
        `;
};

/**
 * Adds Event listener for "Back To Users" button
 */
User.prototype.addEventBackToUsers = function(){
    const htmlElement = this.mainContent.getElementsByClassName('back-button')[0];

    htmlElement.addEventListener('click', function (event) {
        window.history.pushState({type: 1, pageUrl: window.history.state.pageUrl}, 'Users List', `?page=users`);
        new UsersList().render();
    })

};

/**
 * Gets user data by username
 * @return Promise for user data
 * */
User.prototype.getUserByUsername = function() {
    const url = `users/${this.userName}`;
    return this.UtilService.httpCall(url);
};

/**
 * Get User Repositories
 * @return Promise for user repositories
 * */
User.prototype.getUserRepos = function (page = 0, per_page = 20) {
    const url = `users/${this.userName}/repos?page=${page}&per_page=${per_page}`;
    return this.UtilService.httpCall(url);
};
