window.responsiveChild = function(config){
    var parentWidth;
    var settings = {
        renderCallback: null,
        id:null,
        xdomain: '*',
        polling: 0
    };

    /*
     * Setup this document as a responsive iframe child.
     */
    this.setup = function() {
        console.log(config);
        for (var key in config) {
            settings[key] = config[key];
        }

        window.addEventListener('message', processMessage, false);

        settings['id'] = getParameterByName('childId');

        // Initial width is sent as querystring parameter
        var width = parseInt(getParameterByName('initialWidth'));

        if (settings.renderCallback) {
            settings.renderCallback(width);
        }

        this.sendHeightToParent();

        if (settings.polling) {
            window.setInterval(sendHeightToParent, settings.polling);
        }
    };

    /*
     * Extract a querystring parameter from the URL.
     */
    this.getParameterByName = function(name) {
        name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');

        var regex = new RegExp("[\\?&]" + name + '=([^&#]*)');
        var results = regex.exec(location.search);;

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /*
     * Verify that the message came from a trustworthy domaine
     */
    this.isSafeMessage = function(e) {
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
    this.processMessage = function(e) {
        if (!isSafeMessage(e)) {
            return;
        }

        // Parent sent width
        var match = e.data.match(/^responsive-parent-(\w+)-(\d+)$/);

        if (!match || match.length !== 3) {
            // Not the message we're listening for
            return;
        }

        settings['id'] = match[1];
        var width = parseInt(match[2]);

        console.log(width, parentWidth);

        if (width != parentWidth) {
            parentWidth = width;

            if (settings.renderCallback) {
                settings.renderCallback(width);
            }

            this.sendHeightToParent();
        }
    };

    /*
     * Transmit the current iframe height to the parent.
     */
    this.sendHeightToParent = function() {
        var height = document.getElementsByTagName('body')[0].offsetHeight.toString();
        window.top.postMessage('responsive-child-' + settings['id'] + '-'+ height, '*');
    };

    return this;
}

window.responsiveParent = function(config) {
    // Basic settings we'll need later.
    var el;
    var settings = {
        src: null,
        id: null,
        xdomain: '*'
    };

    this.setup = function(){

        // Our settings.
        for (var key in config) {
            settings[key] = config[key];
        }

        window.addEventListener('message', processMessage, false);

        // Get the div that will contain our iframe.
        el = document.getElementById(settings['id']);

        // Calculate it's width.
        var width = el.offsetWidth.toString();

        var node = document.createElement("iframe");

        // Send the initial width as a querystring parameter.
        node.src = settings.src + '?initialWidth=' + width + '&childId=' + settings['id'];

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

    };

    /*
     * Verify that the message came from a trustworthy domain.
     */
    this.isSafeMessage = function(e) {
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
    this.processMessage = function(e) {
        if (!this.isSafeMessage(e)) {
            return;
        }

        // Child sent height
        var match = e.data.match(/^responsive-child-(\w+)-(\d+)$/);

        if (!match || match.length !== 3) {
            return false;
        }

        var childId = match[1];
        var height = parseInt(match[2]);

        if (el.getAttribute('id') == childId) {
            el.getElementsByTagName('iframe')[0].setAttribute('height', height + 'px');
        }
    }

    /*
     * Transmit the current iframe width to the child.
     */
    function sendWidthToChild(el) {

        var width = el.offsetWidth.toString();
        el.getElementsByTagName('iframe')[0].contentWindow.postMessage('responsive-parent-' + settings['id'] + '-' + width, '*');
    }

    return this;
};