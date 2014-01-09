# responsiveiframe

A simplified NPR Visuals fork of [NPR Tech's responsiveiframe](http://npr.github.com/responsiveiframe/). Does not support IE < 9.

Licensed as MIT. See `LICENSE-MIT`.

## Usage

On the parent page:

* Include `parent.js`
* Call `$('iframe').responsiveIframe();`, selecting your iframe
* You can optionally pass in a regex to filter incoming message domains: `$('iframe').responsiveIframe({ xdomain: '*\.npr\.org' });`

On the child page:

* Include `child.js`
* Invoke `setupResponsiveChild();`
* You can optionally pass in a number of milliseconds to enable automaticaly updating the height at that rate (in addition to on load and resize events). Like this `setupResponsiveChild(500);`

## Credits

Modified by [@nprapps](http://github.com/nprapps).

Originally built by [@NPR](http://github.com/npr/) developers:

* [John Nelson](https://github.com/johnymonster),
* [Mike Seid](https://github.com/mbseid),
* [Jared Biehler] (https://github.com/jaredbiehler),
* [Irakli Nadareishvili](https://github.com/inadarei) and
* [Andy Winder](https://github.com/awinder)

Based on the original prototype by [Ioseb Dzmanashvili](https://github.com/ioseb). 
