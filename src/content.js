chrome.runtime.onMessage.addListener(function(request, sender, response){
	if (request.message === 'get-description') {
		var description = '';
		var el = document.querySelector('meta[name~=description]');
		if (el) {
			description = el.getAttribute('content');
		}
		response(description);
	}
	if (request.message === 'get-selection') {
		response(window.getSelection().toString());
	}
});
