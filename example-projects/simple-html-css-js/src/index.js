'use strict';

// index

(function () {

    document.querySelector('#shiftLogos').addEventListener('click', function () {

        var logos = document.querySelector('.logos'),
            firstLogo = document.querySelector('.logos img:first-child'),
            lastLogo = document.querySelector('.logos img:last-child');

        logos.insertBefore(lastLogo, firstLogo);
    });

    //var nb = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    //    odds = nb.filter(v => v % 2 === 0),
    //    fourtyTwo = 42;

    //console.log(`The answer is ${fourtyTwo} ${odds[2]}`);

})();
