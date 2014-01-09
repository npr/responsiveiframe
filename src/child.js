(function($) {
    /*
     * Transmit the current iframe height to the parent.
     */
    window.sendHeightToParent = function() {
        var height = $(document).height().toString();

        window.top.postMessage(height, '*');
    }

    /*
     * Setup thisdocument as a responsive iframe child.
     */
    window.setupResponsiveChild = function(polling) {
        window.addEventListener("load", sendHeightToParent);
        window.addEventListener("resize", sendHeightToParent);

        if (polling) {
            window.setInterval(sendHeightToParent, polling);
        }
    }
}(jQuery));
