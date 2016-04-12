# mdClip
Chrome extension to create a small markdown note from the current page.

### Installation
For the moment, download the source and then go to extensions.  Ensure _"Developer mode"_ is switched on, then click the _"Load unpacked extension..."_ button.  Choose the location where you put the `src` files and add it.

### What it does
When you click the icon it will attempt to create a little markdown clip of the current tab and place it in your clipboard.  This includes the following details (if available):

* Heading from the current tab title
* Image from the tab's favicon
* Paragraph from the meta description
* Quote from any current selection

If you choose to do so then you can edit it in place and click the _"Copy again"_ button to copy it to the clipboard again.

Then paste it into whatever you like.

### Purpose
I recently started using the awesome [Quiver](http://happenapps.com/#quiver) application for notes, but I needed a way to quickly make note cells of web pages that I was visiting.  There didn't seem to be anything available to do what I needed, so I cobbled together this.
