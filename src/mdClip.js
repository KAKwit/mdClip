var contentContainer = 'content';

function getTabDetails(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};
	
	chrome.tabs.query(queryInfo, function(tabs) {
		var details = {
			url: '',
			title: '',
			description: '',
			selection: '',
			iconUrl: ''
		};

		var tab = tabs[0];
		details.url = tab.url;
		details.title = tab.title;
		details.iconUrl = tab.favIconUrl;
		
		chrome.tabs.sendMessage(tab.id, {message: 'get-description'}, function(response) {
			details.description = response;
			chrome.tabs.sendMessage(tab.id, {message: 'get-selection'}, function(response) {
				details.selection = response;
				callback(details);
			});
		});
	});
}

function getSettings(callback) {
	chrome.storage.local.get(['settings'], function(storage) {
		var settings = {
			headingLevel: 3,
			includeIcon: true,
			copyToClipboard: true,
			theme: 'default'
		};
		if (storage) {
			for (var key in storage) {
				settings[key] = storage[key];
			}
		}
		callback(settings);
	});	
}

function putSettings(settings, callback) {
	chrome.storage.local.set({settings: settings}, function() {
		callback();
	});
}

function createClip(details, settings) {
	var para = '<br/><br/>'
	var clip = Array(settings.headingLevel + 1).join("#") + ' ' + details.title + para;

	if (details.iconUrl && settings.includeIcon) {
		clip += '![icon](' + details.iconUrl + ')' + para;
	}

	if (details.description && details.description !== '') {
		clip += details.description + para;
	}

	if (details.selection && details.selection !== '') {
		clip += '> ' + details.selection + para;
	}

	clip += details.url + '<br/>';
	return clip;
}

function copyToClipboard() {
	var el = document.getElementById(contentContainer);
	el.focus();
	document.execCommand('SelectAll');
    document.execCommand('copy');
	window.getSelection().empty();
}

function getAndRenderClip() {
	getTabDetails(function(details) {
		getSettings(function(settings) {
			document.getElementById(contentContainer).innerHTML = createClip(details, settings);
			if (settings.copyToClipboard) {
				copyToClipboard();
			}
		});
	});
}

document.addEventListener('DOMContentLoaded', function() {	
	document.getElementById('copy-again').addEventListener('click', copyToClipboard);
	getAndRenderClip();
});
