{% capture codesample %}  
    <!-- Activate responsiveness in the "child" page -->
    <script src="/js/responsiveiframe.js"></script>
    <script>
      var ir = responsiveIframe();
      ir.allowResponsiveEmbedding();
    </script>
      
    <!-- Corresponding code in the "parent" page -->
    <script src="/js/jquery.js"></script>
    <script src="/js/responsiveiframe.js"></script>
    <script>
      $(function() {
        $('#myIframeID').makeResponsive({ xdomain: '*'});
      });
    </script>
{% endcapture %}
{{ codesample | markdownify }}