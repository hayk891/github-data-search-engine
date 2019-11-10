// Constants
export const state = Object.freeze({
    appTitle: 'GitHub Data Search Engine',
    tabTypes: {
        users: '1',
        repos: '2',
    },
    tabs: [
        {type: '1', name: 'Users'},
        {type: '2', name: 'Repositories'}
    ],
    mainContentClass: 'main',
    itemsPerPage: 20
});
