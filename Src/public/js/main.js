const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
    backdrop.style.display = 'none';
    sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
    backdrop.style.display = 'block';
    sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

const searchInput = document.querySelector('#search');
const searchBtn = document.querySelector('.btn.btn-search');

searchInput.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) searchBtn.click();
});

searchBtn.addEventListener('click', function () {
    const value = searchInput.value;
    if (value.trim() !== '') {
        window.location.href = `/search?query=${value}`;
    }
});
