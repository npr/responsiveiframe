{% capture gettingstarted %}

#### Getting Started
    
<p>ResponsiveIframe is a tiny jQuery plugin, developed at NPR, to make IFrames <a href="http://en.wikipedia.org/wiki/Responsive_Web_Design">Responsive</a>.</p>
    
<p>Due to browser security you will have to include the Javascript file both in the "parent" page, as well
   as in the page being embedded through an iframe ("child").</p>
       
<p>In the current version, parent page will have to also include the latest jQuery.
   There is no dependency on jQuery for the child page functionality. In the future versions we would
   like to remove dependency on jQuery for parent, as well.</p>
       
<p>The "xdomain" parameter in the makeResponsive() function call is optional</p>

{% endcapture %}
{{ gettingstarted | markdownify }}
