function getTabDetails(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};
	var details = {
		url: '',
		title: '',
		description: '',
		selection: '',
		iconUrl: ''
	}
	chrome.tabs.query(queryInfo, function(tabs) {
		var tab = tabs[0];
		details.url = tab.url;
		details.title = tab.title;
		details.iconUrl = tab.favIconUrl;
		
		chrome.tabs.sendMessage(tab.id, {message: 'get-description'}, function(response) {
			details.description = response;
			console.log('get-selection');
			chrome.tabs.sendMessage(tab.id, {message: 'get-selection'}, function(response) {
				console.log(response);
				details.selection = response;
				callback(details);
			})
		});		
	});
}

function copyToClipboard() {
	var el = document.getElementById('content');
	el.focus();
	document.execCommand('SelectAll');
    document.execCommand('copy');
	window.getSelection().empty();
}

function createClip() {
	getTabDetails(function(details) {
		var text = '### ' + details.title + '<br/><br/>';
		if (details.iconUrl) {
			text += '![icon](' + details.iconUrl + ')<br/><br/>';
		}
		if (details.description && details.description != '') {
			text += details.description + '<br/><br/>';
		}
		if (details.selection && details.selection != '') {
			text += '> ' + details.selection + '<br/><br/>';
		}
		text += details.url + '<br/>';

		document.getElementById('content').innerHTML = text;
		copyToClipboard();
	});
}

document.addEventListener('DOMContentLoaded', function() {	
	document.getElementById('copy-again').addEventListener('click', copyToClipboard);
	createClip();
});
