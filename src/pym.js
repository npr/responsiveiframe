/*
* Pym.js is library that resizes an iframe based on the width of the parent and the resulting height of the child.
* Check out the docs at http://blog.apps.npr.org/pym.js/ or the readme at README.md for usage.
*/

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.pym = factory.call(this);
    }
})(function() {
    var MESSAGE_DELIMITER = 'xPYMx';

    var lib = {};

    var _getParameterByName = function(name) {
        /*
        * Generic function for parsing URL params.
        * Via http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        */
        var regex = new RegExp("[\\?&]" + name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]') + '=([^&#]*)');
        var results = regex.exec(location.search);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var _isSafeMessage = function(e, settings) {
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

    var _makeMessage = function(id, messageType, message) {
        /*
         * We use string-building here because JSON message passing is
         * not supported in all browsers.
         */
        var bits = ['pym', id, messageType, message];

        return bits.join(MESSAGE_DELIMITER);
    }

    var _makeMessageRegex = function(id) {
        /*
         * Construct a regex to match passed messages.
         */
        var bits = ['pym', id, '(\\S+)', '(.+)'];

        return new RegExp('^' + bits.join(MESSAGE_DELIMITER) + '$');
    }

    var _autoInit = function() {
        /*
        * Initialize Pym for elements on page that have data-pym attributes.
        */
        var elements = document.querySelectorAll(
            '[data-pym-src]:not([data-pym-auto-initialized])'
        );

        var length = elements.length;

        for (var idx = 0; idx < length; ++idx) {
            var element = elements[idx];

            /*
            * Mark automatically-initialized elements so they are not
            * re-initialized if the user includes pym.js more than once in the
            * same document.
            */
            element.setAttribute('data-pym-auto-initialized', '');

            // Ensure elements have an id
            if (element.id === '') {
                element.id = 'pym-' + idx;
            }

            var src = element.getAttribute('data-pym-src');
            var xdomain = element.getAttribute('data-pym-xdomain');
            var config = {};

            if (xdomain) {
               config.xdomain = xdomain;
            }

            new lib.Parent(element.id, src, config);
        }
    };

    lib.Parent = function(id, url, config) {
        /*
        * A global function for setting up a responsive parent.
        * Use the config object to override the default settings.
        */
        this.id = id;
        this.url = url;
        this.el = document.getElementById(id);
        this.iframe = null;

        this.settings = {
            xdomain: '*'
        };

        this.messageRegex = _makeMessageRegex(this.id); 
        this.messageHandlers = {};

        this.constructIframe = function() {
            /*
            * A function which handles constructing an iframe inside a given element.
            */

            // Calculate the width of this element.
            var width = this.el.offsetWidth.toString();

            // Create an iframe element attached to the document.
            this.iframe = document.createElement("iframe");

            // Save fragment id
            var hash = '';
            var hashIndex = this.url.indexOf('#');

            if (hashIndex > -1) {
                hash = this.url.substring(hashIndex, this.url.length);
                this.url = this.url.substring(0, hashIndex);
            }

            // If the URL contains querystring bits, use them.
            // Otherwise, just create a set of valid params.
            if (this.url.indexOf('?') < 0) {
                this.url += '?';
            } else {
                this.url += '&';
            }
                        // Append the initial width as a querystring parameter, and the fragment id
            this.iframe.src = this.url + 'initialWidth=' + width + '&childId=' + this.id + hash;

            // Set some attributes to this proto-iframe.
            this.iframe.setAttribute('width', '100%');
            this.iframe.setAttribute('scrolling', 'no');
            this.iframe.setAttribute('marginheight', '0');
            this.iframe.setAttribute('frameborder', '0');

            // Append the iframe to our element.
            this.el.appendChild(this.iframe);

            // Add an event listener that will handle redrawing the child on resize.
            var that = this;
            window.addEventListener('resize', function(e) {
                that.sendWidthToChild();
            });
        };

        this.on = function(messageType, callback) {
            /*
             * Bind a callback to a message from the child.
             */
            if (!(messageType in this.messageHandlers)) {
                this.messageHandlers[messageType] = [];
            }

            this.messageHandlers[messageType].push(callback);
        };

        this.processChildMessage = function(e) {
            /*
            * Process a new message from the child.
            * Used to set the height on our iframe.
            */
            if (!_isSafeMessage(e, this.settings)) { return; }

            // Grab the message from the child and parse it.
            var match = e.data.match(this.messageRegex);

            // If there's no match or too many matches in the message, punt.
            if (!match || match.length !== 3) {
                return false;
            }

            var messageType = match[1];
            var message = match[2];

            if (messageType in this.messageHandlers) {
                for (var i = 0; i < this.messageHandlers[messageType].length; i++) {
                   this.messageHandlers[messageType][i].call(this, message);
                }
            }
        };

        this.sendMessageToChild = function(messageType, message) {
            /*
             * Send a message to the the child.
             */
            this.el.getElementsByTagName('iframe')[0].contentWindow.postMessage(_makeMessage(this.id, messageType, message), '*');
        };

        this.sendWidthToChild = function() {
            /*
            * Transmit the current iframe width to the child.
            */
            var width = this.el.offsetWidth.toString();

            this.sendMessageToChild('width', width);
        };

        this._onHeightMessage = function(data) {
            /*
             * Handle parent message from child.
             */
            var height = parseInt(data);
            
            this.iframe.setAttribute('height', height + 'px');
        };

        // Add any overrides to settings coming from config.
        for (var key in config) {
            this.settings[key] = config[key];
        }

        // Add height event callback 
        this.on('height', this._onHeightMessage);

        // Add a listener for processing messages from the child.
        var that = this;
        window.addEventListener('message', function(e) {
            return that.processChildMessage(e)
        }, false);

        // Construct the iframe in the container element.
        this.constructIframe();

        return this;
    };

    lib.Child = function(config) {
        /*
        * A global function for setting up a responsive child.
        * Use the config object to override the default settings.
        */
        this.parentWidth = null;
        this.id = null;

        this.settings = {
            renderCallback: null,
            xdomain: '*',
            polling: 0
        };

        this.messageRegex = null;
        this.messageHandlers = {};

        this.on = function(messageType, callback) {
            /*
             * Bind to a callback to a message from the parent.
             */
            if (!(messageType in this.messageHandlers)) {
                this.messageHandlers[messageType] = [];
            }

            this.messageHandlers[messageType].push(callback);
        };

        this.processParentMessage = function(e) {
            /*
            * Process a new message from parent frame.
            */
            // First, punt if this isn't from an acceptable xdomain.
            if (!_isSafeMessage(e, this.settings)) { return; }

            // Get the message from the parent.
            var match = e.data.match(this.messageRegex);

            // If there's no match or it's a bad format, punt.
            if (!match || match.length !== 3) { return; }

            var messageType = match[1];
            var message = match[2];
            if (messageType in this.messageHandlers) {
                for (var i = 0; i < this.messageHandlers[messageType].length; i++) {
                   this.messageHandlers[messageType][i].call(this, message);
                }
            }
        };

        this.sendMessageToParent = function(messageType, message) {
            /*
             * Send a message to the parent.
             */
            window.top.postMessage(_makeMessage(this.id, messageType, message), '*');
        };

        this.sendHeightToParent = function() {
            /*
            * Transmit the current iframe height to the parent.
            * Make this callable from external scripts in case they update the body out of sequence.
            */

            // Get the child's height.
            var height = document.getElementsByTagName('body')[0].offsetHeight.toString();

            // Send the height to the parent.
            this.sendMessageToParent('height', height);
        };

        this._onWidthMessage = function(data) {
            /*
             * Handle width message from the child.
             */
            var width = parseInt(data);

            // Change the width if it's different.
            if (width != this.parentWidth) {
                this.parentWidth = width;

                // Call the callback function if it exists.
                if (this.settings.renderCallback) {
                    this.settings.renderCallback(width);
                }

                // Send the height back to the parent.
                this.sendHeightToParent();
            }
        };

        // Identify what ID the parent knows this child as.
        this.id = _getParameterByName('childId');
        this.messageRegex = new RegExp('^pym' + MESSAGE_DELIMITER + this.id + MESSAGE_DELIMITER + '(\\S+)' + MESSAGE_DELIMITER + '(.+)$');

        // Get the initial width from a URL parameter.
        var width = parseInt(_getParameterByName('initialWidth'));

        // Bind the width message handler
        this.on('width', this._onWidthMessage);

        // Initialize settings with overrides.
        for (var key in config) {
            this.settings[key] = config[key];
        }

        // Set up a listener to handle any incoming messages.
        var that = this;
        window.addEventListener('message', function(e) {
            that.processParentMessage(e);
        }, false);

        // If there's a callback function, call it.
        if (this.settings.renderCallback) {
            this.settings.renderCallback(width);
        }

        // Send the initial height to the parent.
        this.sendHeightToParent();

        // If we're configured to poll, create a setInterval to handle that.
        if (this.settings.polling) {
            window.setInterval(this.sendHeightToParent, this.settings.polling);
        }

        return this;
    };

    // Initialize elements with pym data attributes
    _autoInit();

    return lib;
});
