'use strict';

(function () {

    document.querySelector('#shiftLogos').addEventListener('click', function () {

        var logos = document.querySelector('.logos'),
            firstLogo = document.querySelector('.logos img:first-child'),
            lastLogo = document.querySelector('.logos img:last-child');

        logos.insertBefore(lastLogo, firstLogo);
    });

})();
