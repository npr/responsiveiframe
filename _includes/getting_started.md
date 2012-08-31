{% capture gettingstarted %}

#### Getting Started
    
ResponsiveIframe is a tiny (0.9KB minified and gzipped) jQuery plugin, developed at NPR 
to make IFrames [Responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design).
    
Due to browser security you will have to include the Javascript file both in 
the "parent" page, as well as in the page being embedded through an iframe ("child").
       
In the current version, parent page will have to also include the latest jQuery.
There is no dependency on jQuery for the child page functionality. In the future versions we would
like to remove dependency on jQuery for a parent, as well.
       
Note: the "xdomain" parameter in the makeResponsive() function call is optional.

{% endcapture %}
{{ gettingstarted | markdownify }}
