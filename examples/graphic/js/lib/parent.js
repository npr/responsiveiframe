(function($) {
    var settings = {
        src: null,
        xdomain: '*'
    };

    var nextChildId = 0;

    /* 
     * Verify that the message came from a trustworthy domain.
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
     * Process a new message from a child iframe.
     */
    function processMessage(e) {
        if (!isSafeMessage(e)) {
            return;
        }

        // Child sent height
        var match = e.data.match(/^responsive-child-(\d+)-(\d+)$/);

        if (!match || match.length !== 3) {
            return false;
        }

        var childId = match[1];
        var height = parseInt(match[2]);
        
        console.log('child #' + childId + ' sent height: ' + height);

        $('.responsive-iframe[data-child-id="' + childId + '"] iframe').css('height', height + 'px');
    }

    /*
     * Transmit the current iframe width to the child.
     */
    function sendWidthToChild($elem) {
        var width = $elem.width().toString();
        var childId = $elem.attr('data-child-id');

        $elem.find('iframe')[0].contentWindow.postMessage('responsive-parent-' + childId + '-' + width, '*');
    }

    /*
     * Initialize one or many child iframes.
     */
    $.fn.responsiveIframe = function(config) {
        $.extend(settings, config);

        window.addEventListener('message', processMessage, false);

        return this.each(function() {
            var $this = $(this);

            $this.addClass('responsive-iframe');
            $this.attr('data-child-id', nextChildId);

            var width = $this.width().toString();

            // Send the initial width as a querystring parameter
            $this.append('<iframe src="' + settings.src + '?initialWidth=' + width + '&childId=' + nextChildId + '" style="width: 100%;" scrolling="no" marginheight="0" marginwidth="0" frameborder="0"></iframe>')

            nextChildId += 1;

            window.addEventListener('resize', function(e) {
                sendWidthToChild($this);
            });
        });
    };
}(jQuery));

