(function($) {
    var settings = {
        xdomain: '*'
    };

    /*
     * Process a new message from a child iframe.
     */
    function processMessage($elem, e) {
        if (settings.xdomain !== '*') {
            var regex = new RegExp(settings.xdomain + '$');
          
            if (!e.origin.match(regex)) {
                // Not the origin we're listening for
                return;
            }
        }

        var match = e.data.match(/^(\d+)$/);

        if (!match || match.length !== 2) {
            // Not the message we're listening for
            return;
        }

        var height = parseInt(match[1]);

        $elem.css('height', height + 'px');
    }

    /*
     * Initialize one or many child iframes.
     */
    $.fn.responsiveIframe = function( config ) {
        $.extend(settings, config);

        return this.each(function() {
            var $this = $(this);

            window.addEventListener('message', function(e) {
                processMessage($this, e);
            } , false);
        });
    };
}(jQuery));

