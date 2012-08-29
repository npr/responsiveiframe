responsiveiframe
================

# Responsive IFrames

## Dependencies
jQuery

## Usage
Load the jquery.responsiveiframe.js library in both the page that displays the iframe, and the iframe src.

In the page that displays the iframe, attach the plugin like so:

```
<script type="text/javascript">	
	$(document).ready(
		function() {
			$('iframe').responsiveIframe();
		}
	);
</script>
```

In the iframe src, attach the plugin like so:

```
<script type="text/javascript">	
	$(document).ready(
		function() {
			$('body').responsiveIframe('sendMessages');
		}
	);
</script>
```