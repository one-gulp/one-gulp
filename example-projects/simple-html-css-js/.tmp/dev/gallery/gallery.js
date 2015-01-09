'use strict';

// gallery

(function () {

    function toggleLogo() {
        logos[lastLogoIdx].classList.toggle('selected');
    }

    var logos = document.querySelectorAll('.logos img'),
        lastLogoIdx = 0;

    // init
    toggleLogo();

    // loop
    setInterval(function () {

        toggleLogo();
        lastLogoIdx = (lastLogoIdx + 1) % logos.length;
        toggleLogo();

    }, 1000);

})();
