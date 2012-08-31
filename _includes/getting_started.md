{% capture gettingstarted %}

#### Why Do [Responsive] IFrames Matter?

Using IFrames is a common method for third-party content embedding. Many popular services 
(from YouTube to Facebook) use it to isolate embedded content and scripts from the parent 
page. 

On a [responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design) website, all 
page components must be responsive. Making IFrames responsive is somewhat of a challenging 
task. We developed this tiny (0.9KB minified and gzipped) jQuery plugin, at NPR, to make 
the task easier.

#### Getting Started
    
Due to browser security you will have to include the Javascript file both in 
the "parent" page, as well as in the page being embedded through an iframe ("child").
       
In the current version, parent page will have to also include the latest jQuery.
There is no dependency on jQuery for the child page functionality. In the future versions we would
like to remove dependency on jQuery for a parent, as well.
       
Note: the "xdomain" parameter in the makeResponsive() function call is optional.

{% endcapture %}
{{ gettingstarted | markdownify }}
