(function($) {
    var settings = {
        renderCallback: null,
        xdomain: '*',
        polling: 0
    };

    var childId = null;
    var parentWidth = null;

    /*
     * Extract a querystring parameter from the URL.
     */
    function getParameterByName(name) {
        name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');

        var regex = new RegExp("[\\?&]" + name + '=([^&#]*)');
        var results = regex.exec(location.search);;
        
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, " "));
    }    

    /*
     * Verify that the message came from a trustworthy domaine
     */
    function isSafeMessage(e) {
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
     * Process a new message from parent frame.
     */
    processMessage = function(e) {
        if (!isSafeMessage(e)) {
            return;
        }

        // Parent sent width
        var match = e.data.match(/^responsive-parent-(\d+)-(\d+)$/);

        if (!match || match.length !== 3) {
            // Not the message we're listening for
            return;
        }

        if (match[1] != childId) {
            // Not meant for us
            return;
        }

        var width = parseInt(match[2]);
        
        console.log('child #' + childId + ' recieved width: ' + width);

        if (width != parentWidth) {
            parentWidth = width;

            if (settings.renderCallback) {
                settings.renderCallback(width);
            }
                
            sendHeightToParent();
        }
    }

    /*
     * Transmit the current iframe height to the parent.
     */
    window.sendHeightToParent = function() {
        var height = $('body').height().toString();

        window.top.postMessage('responsive-child-' + childId + '-' + height, '*');
    }

    /*
     * Setup this document as a responsive iframe child.
     */
    window.setupResponsiveChild = function(config) {
        $.extend(settings, config);

        window.addEventListener('message', processMessage, false);

        // Unique child ID is sent as querystring parameter
        childId = parseInt(getParameterByName('childId'));
        
        // Initial width is sent as querystring parameter
        var width = parseInt(getParameterByName('initialWidth'));

        console.log('child #' + childId + ' received initial width: ' + width);

        if (settings.renderCallback) {
            settings.renderCallback(width);
        }

        sendHeightToParent();

        if (settings.polling) {
            window.setInterval(sendHeightToParent, settings.polling);
        }
    }
}(jQuery));
