
/**
 * Represents a User.
 * @constructor
 * @param {string} parent - The parent page info .
 */
export function PaginationComponent(parent) {
    this.parent = parent;
    this.paginationElement = this.init();
}

/**
 * Initializes component
 */
PaginationComponent.prototype.render = function () {
    return this.paginationElement;
};

/**
 * Initializes source Html
 */
PaginationComponent.prototype.init = function () {
    return `
        <div class="pagination">
          <a href="#" class="prev-button" data-page="${this.parent.name}"> ← Prev </a>
          <a href="#" class="next-button" data-page="${this.parent.name}"> Next → </a>
        </div>
    `;
};

/**
 * Sets Event listener for button clicks
 */
PaginationComponent.prototype.addPaginationClickEvent  = function () {
    const prevButtons = [...document.querySelectorAll(`[class*="prev-button"]`)];
    prevButtons.map(prevButton => {
        prevButton.addEventListener('click', function (event) {
            event.preventDefault();
            var evt = new CustomEvent('prevButtonClicked', {detail: event});
            window.dispatchEvent(evt);
        });
    });


    const nextButtons = [...document.querySelectorAll(`[class*="next-button"]`)];
    nextButtons.map(nextButton => {
        nextButton.addEventListener('click', function (event) {
            event.preventDefault();
            var evt = new CustomEvent('nextButtonClicked', {detail: event});
            window.dispatchEvent(evt);
        })
    });

};
