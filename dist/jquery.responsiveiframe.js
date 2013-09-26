/*! jQuery ResponsiveIframe - v0.0.3 - 2013-09-26
* https://github.com/npr/responsiveiframe
* Copyright (c) 2013 Irakli Nadareishvili; Licensed MIT, GPL */
/*! jQuery ResponsiveIframe - v0.0.3 - 2013-09-05
* https://github.com/npr/responsiveiframe
* Copyright (c) 2013 Irakli Nadareishvili; Licensed MIT, GPL */
if (typeof jQuery !== 'undefined') {
    (function ($) {
        'use strict';
        var settings = {
                xdomain: '*',
                ie: navigator.userAgent.toLowerCase().indexOf('msie') > -1,
                scrollToTop: true
            },
            privateMethods = {
                messageHandler: function (elem, e) {
                    var height, r, matches, strD, regex;

                    if (settings.xdomain !== '*') {
                        regex = new RegExp(settings.xdomain + '$');
                        if (e.origin === "null") {
                            throw new Error("messageHandler( elem, e): There is no origin.  You are viewing the page from your file system.  Please run through a web server.");
                        }
                        if (e.origin.match(regex)) {
                            matches = true;
                        } else {
                            throw new Error("messageHandler( elem, e): The orgin doesn't match the responsiveiframe  xdomain.");
                        }
                    }

                    if (settings.xdomain === '*' || matches) {
                        strD = String(e.data.split('###')[1]);
                        r = strD.match(/^(\d+)(s?)$/);
                        if (r && r.length === 3) {
                            height = parseInt(r[1], 10);
                            if (!isNaN(height)) {
                                try {
                                    privateMethods.setHeight(elem, height);
                                } catch (ignore) {}
                            }
                            if (settings.scrollToTop && r[2] === "s") {
                                scroll(0, 0);
                            }
                        }
                    }
                },

                // Sets the height of the iframe
                setHeight: function (elem, height) {
                    height = height + 130;
                    $('iframe[name="' + elem + '"]').css('height', height + 'px');
                },
                getDocHeight: function () {
                    var D = document;
                    return Math.min(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
                }
            },
            methods = {
                // initialization for the parent, the one housing this
                init: function () {
                    return this.each(function () {
                        var $this = $(this);
                        if (window.postMessage) {
                            if (window.addEventListener) {
                                window.addEventListener('message', function (e) {
                                    var elem = e.data.split('###')[0];
                                    privateMethods.messageHandler(elem, e);
                                }, false);
                            } else if (window.attachEvent) {
                                window.attachEvent('onmessage', function (e) {
                                    var elem = e.data.split('###')[0];
                                    privateMethods.messageHandler(elem, e);
                                }, $this);
                            }
                        } else {
                            setInterval(function () {
                                var elem = $('iframe[name="' + $this[0].name + '"]'),
                                    hash = elem[0].contentWindow.location.hash,
                                    matches;
                                if (hash) {
                                    matches = hash.match(/^#h(\d+)(s?)$/);
                                    if (matches) {
                                        privateMethods.setHeight($this[0].src, matches[1]);
                                    }
                                }
                            }, 150);
                        }
                    });
                }
            };

        $.fn.responsiveIframe = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            if (typeof method === 'object' || !method) {
                $.extend(settings, method);
                return methods.init.apply(this);
            }
            $.error('Method ' + method + ' does not exist on jQuery.responsiveIframe');
        };
    }(jQuery));
}

(function () {
    'use strict';
    var self,
        module,
        ResponsiveIframe = function () {
            self = this;
        };

    ResponsiveIframe.prototype.allowResponsiveEmbedding = function () {
        if (window.addEventListener) {
            window.addEventListener("load", self.messageParent, false);
            window.addEventListener("resize", self.messageParent, false);
            self.messageParent();
        } else if (window.attachEvent) {
            window.attachEvent("onload", self.messageParent);
            window.attachEvent("onresize", self.messageParent);
            self.messageParent();
        }
    };

    ResponsiveIframe.prototype.messageParent = function (scrollTop) {
        var h = document.body.offsetHeight,
            message;
        h = scrollTop ? h + 's' : h;
        message = window.name + '###' + h;
        if (top.postMessage) {
            top.postMessage(message, '*');
        } else {
            window.location.hash = 'h' + h;
        }
    };

    function responsiveIframe() {
        return new ResponsiveIframe();
    }

    // expose
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports.responsiveIframe = responsiveIframe;
    } else {
        window.responsiveIframe = responsiveIframe;
    }
}());