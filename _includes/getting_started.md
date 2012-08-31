{% capture gettingstarted %}

#### Why Do [Responsive] IFrames Matter?

IFrames are commonly used to allow embedding of third-party content. Many popular services, 
such as YouTube and Facebook, make extensive use of IFrames in their embeddable widgets.

On a [responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design) website, all 
page components must be responsive. Making IFrames responsive is somewhat of a challenging 
task. We developed this tiny (0.9KB minified and gzipped) jQuery plugin, at NPR, to make 
the task easier.

#### Getting Started
    
Due to browser security considerations, you will have to include the Javascript file both in 
the "parent" page, as well as in the page being embedded through an iframe ("child").
       
In the current version, the parent page must include the latest version of jQuery.
There is no dependency on jQuery for the child page functionality. In future versions, we would
like to remove the dependency on jQuery for the parent as well.
       
Note: the "xdomain" parameter in the makeResponsive() function call is optional.

{% endcapture %}
{{ gettingstarted | markdownify }}
