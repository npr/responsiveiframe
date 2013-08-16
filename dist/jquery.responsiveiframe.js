/*! jQuery ResponsiveIframe - v0.0.4 - 2013-08-16
* https://github.com/npr/responsiveiframe
* Copyright (c) 2013 inadarei; Licensed MIT, GPL */
if (typeof jQuery !== 'undefined') {
  (function( $ ){
    var settings = {
      xdomain: '*',
      ie : navigator.userAgent.toLowerCase().indexOf('msie') > -1,
      scrollToTop: true
    };

    var methods = {
      // initialization for the parent, the one housing this
      init: function() {
        return this.each(function(self){
          var $this = $(this);

          if (window.postMessage) {
            if (window.addEventListener) {
              window.addEventListener('message', function(e) {
                privateMethods.messageHandler($this,e);
              } , false);
            } else if (window.attachEvent) {
              window.attachEvent('onmessage', function(e) {
                privateMethods.messageHandler($this,e);
              }, $this);
            }
          } else {
            setInterval(function () {
              var hash = window.location.hash, matches = hash.match(/^#h(\d+)(s?)$/);
              if (matches) {
                privateMethods.setHeight($this, matches[1]);
                if (settings.scrollToTop && matches[2] === 's'){
                  scroll(0,0);
                }
              }
            }, 150);
          }
        });
      }
    };

    var privateMethods = {
      messageHandler: function (elem, e) {
        var height,
          r,
          matches,
          strD;

        if (settings.xdomain !== '*') {
          var regex = new RegExp(settings.xdomain + '$');
          if(e.orgin == "null"){
            throw new Error("messageHandler( elem, e): There is no origin.  You are viewing the page from your file system.  Please run through a web server.");
          }
          if(e.origin.match(regex)){
            matches = true;
          }else{
            throw new Error("messageHandler( elem, e): The orgin doesn't match the responsiveiframe  xdomain.");
          }
        }

        if(settings.xdomain === '*' || matches ) {
          strD = e.data + "";
          r = strD.match(/^(\d+)(s?)$/);
          if(r && r.length === 3){
            height = parseInt(r[1], 10);
            if (!isNaN(height)) {
              try {
                privateMethods.setHeight(elem, height);
              } catch (ex) {}
            }
            if (settings.scrollToTop && r[2] === "s"){
              scroll(0,0);
            }
          }
        }
      },

      // Sets the height of the iframe
      setHeight : function (elem, height) {
        elem.css('height', height + 'px');
      }
    };

    $.fn.responsiveIframe = function( method ) {
      if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        $.extend(settings, arguments[0]);
        return methods.init.apply( this );
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.responsiveIframe' );
      }
    };
  }( jQuery ));
}

;(function(){
  var ResponsiveIframe = function () {},
      defaults = {
        resizeOnly: true,
        scrollToTop: false,
        pollInterval: 150
      };

  function getDocHeight() {
    var body = document.body,
       html = document.documentElement;

    return Math.max( body.scrollHeight, body.offsetHeight,
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
  }

  ResponsiveIframe.prototype.allowResponsiveEmbedding = function(opts) {
    var previousHeight;

    opts = opts || {};
    for (var k in defaults) {
      if (defaults.hasOwnProperty(k) && !opts.hasOwnProperty(k)) {
        opts[k] = defaults[k];
      }
    }

    function messageParent(newHeight) {
      newHeight += (opts.scrollToTop) ? 's' : '';
      if(top.postMessage){
        top.postMessage( newHeight , '*');
      } else {
        window.location.hash = 'h'+newHeight;
      }
    };

    function firstLoad() {
      var currentHeight = getDocHeight();
      if (!opts.resizeOnly) {
        messageParent(currentHeight);
      }

      // No "content has resized" event in the iframe, so we need to poll...
      setInterval(checkHeight, opts.pollInterval);
    }

    function checkHeight() {
      var currentHeight = getDocHeight();
      if (currentHeight !== previousHeight) {
        previousHeight = currentHeight;
        messageParent(currentHeight);
      }
    }

    if (window.addEventListener) {
      window.addEventListener("load", firstLoad, false);
    } else if (window.attachEvent) {
      window.attachEvent("onload", firstLoad);
    }
  };

  function responsiveIframe() {
    return new ResponsiveIframe();
  }

  // expose
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(responsiveIframe);
  } else if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports.responsiveIframe = responsiveIframe;
  } else {
    // Drop onto window
    window.responsiveIframe = responsiveIframe;
  }
}());
