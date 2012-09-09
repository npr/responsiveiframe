{% capture codesample %}
#### Getting Started
    
Due to browser security constraints, you will have to include the Javascript file both in 
the "parent" page, as well as in the page being embedded through an iframe ("child").
       
In the current version, the parent page must include the latest version of jQuery.
There is no dependency on jQuery for the child page functionality. In future versions, we would
like to remove the dependency on jQuery for the parent as well.
       
Note: the "xdomain" parameter in the makeResponsive() function call is optional.

#### Code Sample

    <!-- Activate responsiveness in the "child" page -->
    <script src="/js/jquery.responsiveiframe.js"></script>
    <script>
      var ri = responsiveIframe();
      ri.allowResponsiveEmbedding();
    </script>
      
    <!-- Corresponding code in the "parent" page -->
    <script src="/js/jquery.js"></script>
    <script src="/js/jquery.responsiveiframe.js"></script>

    <script>
      ;(function($){          
          $(function(){
            $('#myIframeID').responsiveIframe({ xdomain: '*'});
          });        
      })(jQuery);
    </script>
{% endcapture %}
{{ codesample | markdownify }}
