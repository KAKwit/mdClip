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
	if (request.message === 'download-qvnote') {
		location.href = "data:application/zip;base64," + request.content;
	}
	if (request.message === 'download-markdown') {
		var a = document.createElement('a');
		var blob = new Blob([request.content], {type : "text/plain;charset=UTF-8"});
		a.href = window.URL.createObjectURL(blob);
		a.download = 'mdClip.md';
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		delete a;
	}
});
