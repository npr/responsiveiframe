# responsiveiframe

A simplified NPR Visuals fork of [NPR Tech's responsiveiframe](http://npr.github.com/responsiveiframe/). Does not support IE < 9. Requires jQuery on both the parent and child pages.

Licensed as MIT. See `LICENSE-MIT`.

## What is it?

A library that allows iframes to be embedded in a way that allows them to resize responsively within their parent and bypasses the usual cross-domain issues.

The typical use-case for this is embedding small custom bits of code (charts, maps, etc.) inside a CMS without override CSS or Javascript conflicts.

See an example of this in action is on [NPR.org](http://www.npr.org/blogs/health/2014/01/14/262484689/why-the-youth-gap-on-obamacare-exchanges-could-be-a-yawner).

## Usage

### On the parent page

* Include `parent.js`.
* Call `$('div').responsiveIframe({ src: 'child.html' });`, selecting your container div and passing the path to your child page as `src`. 
* You can optionally pass in a regex to filter incoming message domains: `$('iframe').responsiveIframe({ xdomain: '*\.npr\.org' });`.

### On the child (embedded) page

* Include `child.js`.
* Invoke `setupResponsiveChild();`.
* If the contents of your iframe are dynamic you will want to pass in a rendering function, like this: `setupResponsiveChild({ renderCallback: myFunc });` This function will be called once on load and then again anytime the window is resized.
* You can optionally pass in a number of milliseconds to enable automaticaly updating the height at that rate (in addition to on load and resize events). Like this `setupResponsiveChild({ polling: 500 });`.

### Manual resize events

If you have dynamic content and need finer control over resize events, your child window can invoke `sendHeightToParent()` at any time to force the iframe to update its size.

## How it works

The `parent.js` library and a small bit of javascript are injected onto the parent page. This
code writes an iframe to the page in a container of your choice. The request for the iframe's contents includes querystring parameters for the `initialWidth` and `childId` of the child page. The `initialWidth` allows the child to know its size immediately on load. (In iOS the child frame can not determine its own width accurately.) The `childId` allows multiple children to be embedded on the same page, each with its own communication to the parent.

The child page includes `child.js` and its own javascript. It invokes the `setupResponsiveIframe` function, which initializes cross-iframe communication to the parent, renders the any dynamic contents and then sends the computed height of the child to the parent via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage). Upon receiving this message the parent resizes the containing iframe, thus ensuring the contents of the child are always visible.

The parent page also registers for resize events. Any time one is received, the parent sends the new container width to each child via `postMessage`. The child rerenders its content and sends back the new height.

## Credits

Modified by [@nprapps](http://github.com/nprapps).

Originally built by [@NPR](http://github.com/npr/) developers:

* [John Nelson](https://github.com/johnymonster),
* [Mike Seid](https://github.com/mbseid),
* [Jared Biehler] (https://github.com/jaredbiehler),
* [Irakli Nadareishvili](https://github.com/inadarei) and
* [Andy Winder](https://github.com/awinder)

Based on the original prototype by [Ioseb Dzmanashvili](https://github.com/ioseb). 
