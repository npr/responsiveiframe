/*
* Pym.js is library that resizes an iframe based on the width of the parent and the resulting height of the child.
* Check out the docs at http://foo or the readme at README.md for usage.
*/

window.pym = {}
window.pym._isSafeMessage = function(e, settings) {
    /*
    * Check the message to make sure it comes from an acceptable xdomain.
    * Defaults to '*' but can be overriden in config.
    */
    if (settings.xdomain !== '*') {
        // If origin doesn't match our xdomain, return.
        if (!e.origin.match(new RegExp(settings.xdomain + '$'))) { return; }
    }

    return true;
}
window.pym.parent = function(id, config) {
    /*
    * A global function for setting up a responsive parent.
    * Use the config object to override the default settings.
    */

    var constructIframe = function(el) {
        /*
        * A function which handles constructing an iframe inside a given element.
        */

        // Calculate the width of this element.
        var width = el.offsetWidth.toString();

        // Create an iframe element attached to the document.
        var node = document.createElement("iframe");

        // Get the URL to the child page from the element's data-iframe-target attribute.
        var url = el.getAttribute('data-iframe-target');

        // Get the ID of the element to enable messages to this specific iframe child.
        var id = el.getAttribute('id');

        // If the URL contains querystring bits, use them.
        // Otherwise, just create a set of valid params.
        if (url.indexOf('?') < 0) {
            url += '?';
        } else {
            url += '&';
        }

        // Append the initial width as a querystring parameter.
        node.src = url + 'initialWidth=' + width + '&childId=' + id;

        // Set some attributes to this proto-iframe.
        node.setAttribute('width', '100%');
        node.setAttribute('scrolling', 'no');
        node.setAttribute('marginheight', '0');
        node.setAttribute('frameborder', '0');

        // Append the iframe to our element.
        el.appendChild(node);

        // Add an event listener that will handle redrawing the child on resize.
        window.addEventListener('resize', function(e) { sendWidthToChild(el); });
    }

    var processChildMessage = function(e) {
        /*
        * Process a new message from the child.
        * Used to set the height on our iframe.
        */
        if (!window.pym._isSafeMessage(e, settings)) { return; }

        // Grab the message from the child and parse it.
        var match = e.data.match(/^responsivechild (\S+) (\d+)$/);

        // If there's no match or too many matches in the message, punt.
        if (!match || match.length !== 3) { return false; }

        // Get the ID from the message.
        var childId = match[1];

        // Get the child's height from the message.
        var height = parseInt(match[2]);

        // Get a list of all of the responsive iframe containers on the page.
        elements = document.querySelectorAll('div[data-iframe-target]');

        // Loop over the containers.
        for (var i=0; i<elements.length; i++){

            // Get this container's element.
            el = elements[i];

            // See if this container is the one from the message.
            if (el.getAttribute('id') == childId) {

                // If so, update the height.
                el.getElementsByTagName('iframe')[0].setAttribute('height', height + 'px');
            }
        }
    }

    var sendWidthToChild = function(el) {
        /*
        * Transmit the current iframe width to the child.
        */

        // Get the width of the element.
        var width = el.offsetWidth.toString();

        // Pass the width out to the child so it can compute the height.
        el.getElementsByTagName('iframe')[0].contentWindow.postMessage('responsiveparent ' + el.getAttribute('id') + ' ' + width, '*');
    }

    // Default settings.
    var settings = { xdomain: '*' };

    // Add any overrides to settings coming from config.
    for (var key in config) { settings[key] = config[key]; }

    // Add a listener for processing messages from the child.
    window.addEventListener('message', processChildMessage, false);

    // Construct the iframe in the container element.
    constructIframe(document.getElementById(id));

    return this;

};

window.pym.child = function(config){
    /*
    * A global function for setting up a responsive child.
    * Use the config object to override the default settings.
    */
    var parentWidth;
    var id;

    var settings = {
        renderCallback: null,
        xdomain: '*',
        polling: 0
    };

    var getParameterByName = function(name) {
        /*
        * Generic function for parsing URL params.
        * Via http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        */
        var regex = new RegExp("[\\?&]" + name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]') + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    window.pym.child.sendHeightToParent = function() {
        /*
        * Transmit the current iframe height to the parent.
        * Make this callable from external scripts in case they update the body out of sequence.
        */

        // Get the child's height.
        var height = document.getElementsByTagName('body')[0].offsetHeight.toString();

        // Send the height to the parent.
        window.top.postMessage('responsivechild ' + id + ' '+ height, '*');
    };

    var processParentMessage = function(e) {
        /*
        * Process a new message from parent frame.
        */

        // First, punt if this isn't from an acceptable xdomain.
        if (!window.pym._isSafeMessage(e, settings)) { return; }

        // Get the message from the parent.
        var match = e.data.match(/^responsiveparent (\S+) (\d+)$/);

        // If there's no match or it's a bad format, punt.
        if (!match || match.length !== 3) { return; }

        // Get the ID out of the message.
        id = match[1];

        // Get the width out of the message.
        var width = parseInt(match[2]);

        // Change the width if it's different.
        if (width != parentWidth) {
            parentWidth = width;

            // Call the callback function if it exists.
            if (settings.renderCallback) { settings.renderCallback(width); }

            // Send the height back to the parent.
            window.pym.child.sendHeightToParent();
        }
    };

    // Initialize settings with overrides.
    for (var key in config) { settings[key] = config[key]; }

    // Set up a listener to handle any incoming messages.
    window.addEventListener('message', processParentMessage, false);

    // Identify what ID the parent knows this child as.
    id = getParameterByName('childId');

    // Get the initial width from a URL parameter.
    var width = parseInt(getParameterByName('initialWidth'));

    // If there's a callback function, call it.
    if (settings.renderCallback) { settings.renderCallback(width); }

    // Send the initial height to the parent.
    window.pym.child.sendHeightToParent();

    // If we're configured to poll, create a setInterval to handle that.
    if (settings.polling) {
        window.setInterval(window.pym.child.sendHeightToParent, settings.polling);
    }

    return this;

};