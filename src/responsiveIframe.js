/*
* This is a responsive iFrame library.
* Check out the docs at http://foo or the readme at README.md for usage.

*/

window.responsiveChild = function(config){
    var parentWidth;
    var id;
    var settings = {
        renderCallback: null,
        id:null,
        xdomain: '*',
        polling: 0
    };
    for (var key in config) { settings[key] = config[key]; }

    /*
    * Extract a querystring parameter from the URL.
    */
    var getParameterByName = function(name) {
        name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');

        var regex = new RegExp("[\\?&]" + name + '=([^&#]*)');
        var results = regex.exec(location.search);;

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /*
    * Verify that the message came from a trustworthy domaine
    */
    var isSafeMessage = function(e) {
        if (settings.xdomain !== '*') {
            var regex = new RegExp(settings.xdomain + '$');

            if (!e.origin.match(regex)) {
                // Not the origin we're listening for
                return;
            }
        }

        return true;
    };

    /*
    * Process a new message from parent frame.
    */
    var processMessage = function(e) {
        if (!isSafeMessage(e)) {
            return;
        }

        // Parent sent width
        var match = e.data.match(/^responsiveparent (\S+) (\d+)$/);

        if (!match || match.length !== 3) {
            // Not the message we're listening for
            return;
        }

        id = match[1];
        var width = parseInt(match[2]);

        if (width != parentWidth) {
            parentWidth = width;

            if (settings.renderCallback) {
                settings.renderCallback(width);
            }

            window.responsiveChild.sendHeightToParent();
        }
    };

    /*
    * Transmit the current iframe height to the parent.
    */
    window.responsiveChild.sendHeightToParent = function() {
        var height = document.getElementsByTagName('body')[0].offsetHeight.toString();
        window.top.postMessage('responsivechild ' + id + ' '+ height, '*');
    };

    window.addEventListener('message', processMessage, false);

    id = getParameterByName('childId');

    // Initial width is sent as querystring parameter
    var width = parseInt(getParameterByName('initialWidth'));

    if (settings.renderCallback) {
        settings.renderCallback(width);
    }

    window.responsiveChild.sendHeightToParent();

    if (settings.polling) {
        window.setInterval(window.responsiveChild.sendHeightToParent, settings.polling);
    }

}

window.responsiveParent = function(config) {
    var elements = document.querySelectorAll('div[data-iframe-target]');
    var settings = { xdomain: '*' };

    for (var key in config) { settings[key] = config[key]; }

    var constructIframe = function(el) {
        // Calculate its width.
        var width = el.offsetWidth.toString();

        var node = document.createElement("iframe");

        var url = el.getAttribute('data-iframe-target');
        var id = el.getAttribute('id');

        if (url.indexOf('?') < 0) {
            url += '?';
        } else {
            url += '&';
        }

        // Send the initial width as a querystring parameter.
        node.src = url + 'initialWidth=' + width + '&childId=' + id;

        // Super not-dry way to set attrs on our iFrame.
        node.setAttribute('width', '100%');
        node.setAttribute('scrolling', 'no');
        node.setAttribute('marginheight', '0');
        node.setAttribute('frameborder', '0');
        el.appendChild(node);

        // Do our magic on screen resize.
        window.addEventListener('resize', function(e) {
            sendWidthToChild(el);
        });
    }

    /*
    * Verify that the message came from a trustworthy domain.
    */
    var isSafeMessage = function(e) {
        if (settings.xdomain !== '*') {
            var regex = new RegExp(settings.xdomain + '$');

            if (!e.origin.match(regex)) {
                // Not the origin we're listening for
                return;
            }
        }

        return true;
    }

    /*
    * Process a new message from a child iframe.
    */
    var processMessage = function(e) {
        if (!isSafeMessage(e)) {
            return;
        }

        // Child sent height
        var match = e.data.match(/^responsivechild (\S+) (\d+)$/);

        console.log(match);

        if (!match || match.length !== 3) {
            return false;
        }

        var childId = match[1];
        var height = parseInt(match[2]);

        elements = document.querySelectorAll('div[data-iframe-target]');

        for (var i=0; i<elements.length; i++){
            el = elements[i];
            if (el.getAttribute('id') == childId) {
                el.getElementsByTagName('iframe')[0].setAttribute('height', height + 'px');
            }
        }
    }

    /*
    * Transmit the current iframe width to the child.
    */
    function sendWidthToChild(el) {
        var width = el.offsetWidth.toString();
        el.getElementsByTagName('iframe')[0].contentWindow.postMessage('responsiveparent ' + el.getAttribute('id') + ' ' + width, '*');
    }

    window.addEventListener('message', processMessage, false);

    for (var i=0; i<elements.length; i++){
        constructIframe(elements[i]);
    }

};