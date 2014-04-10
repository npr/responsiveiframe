window.responsiveIframe = function(config) {
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
            el.firstChild.setAttribute('height', height + 'px');
        }
    }

    /*
     * Transmit the current iframe width to the child.
     */
    function sendWidthToChild(el) {

        var width = el.offsetWidth.toString();
        el.firstChild.contentWindow.postMessage('responsive-parent-' + settings['id'] + '-' + width, '*');
    }

    return this;
};