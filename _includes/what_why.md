{% capture whatwhy %}

#### The What and Why

IFrames are commonly used to allow embedding of third-party content. Many popular services, 
such as YouTube and Facebook, make extensive use of IFrames in their embeddable widgets.

On a [responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design) website, all 
page components must be responsive. There are multiple ways of making an IFrame responsive.
Some responsive IFrame use-cases can be solved with simple Javascript and CSS. Our library
targets a challenging use-case in which embedded content can have:

* Unknown width and height
* Unknown width/height ratio
* Can change its width or height as users interact with the content and we want the size of
the IFrame to change accordingly to avoid scrollbars.

Making IFrames with such constraints is a challenging task. We developed this tiny (0.9KB minified and gzipped) 
jQuery plugin, at NPR, to make the task easier.

For simpler use-cases, e.g. targeting the embedding of fixed ratio video content, you may want to 
check-out: [FitVid.js](http://fitvidsjs.com/), instead.

{% endcapture %}
{{ whatwhy | markdownify }}
