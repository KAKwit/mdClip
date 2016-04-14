mdClip = function() {

	/* Document object selector names */
	var selectors = {
		contentContainer     : 'content',
		optionsContainer     : 'options',
		copyAgainButton      : 'copy-again',
		optionsButton        : 'options-button',
		headingLevel         : 'heading-level',
		headingLevelValue    : 'heading-level-value',
		includeIconFalse     : 'include-icon-false',
		includeIconTrue      : 'include-icon-true',
		copyToClipboardTrue  : 'copy-to-clipboard-true',
		copyToClipboardFalse : 'copy-to-clipboard-false'
	};
	
	/* Messages sent to the window */
	var messageNames = {
		getDescription : 'get-description',
		getSelection   : 'get-selection'
	}
	
	/* Parameters for querying current tab */
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	/* Details to include in a clip */
	var details = {
		url: '',
		title: '',
		description: '',
		selection: '',
		iconUrl: ''
	};

	/* Settings and options */
	var settings = {
		headingLevel: 3,
		includeIcon: true,
		copyToClipboard: true,
		theme: 'default'
	};

	/* Gather together the details, create the clip, and copy it to clipboard */
	function getAndRenderClip() {
		getTabDetails(function(details) {
			getSettings(function(settings) {
				document.getElementById(selectors.contentContainer).innerHTML = createClip(details, settings);
				if (settings.copyToClipboard) {
					copyToClipboard();
				}
				document.getElementById('main-window').className = 'in';
			});
		});
	}

	/* Get the details for the clip from both the Chrome tab and window details */
	function getTabDetails(callback) {
		chrome.tabs.query(queryInfo, function(tabs) {
			var tab = tabs[0];
			details.url = tab.url;
			details.title = tab.title;
			details.iconUrl = tab.favIconUrl;
			chrome.tabs.sendMessage(tab.id, {message: messageNames.getDescription}, function(response) {
				details.description = response;
				chrome.tabs.sendMessage(tab.id, {message: messageNames.getSelection}, function(response) {
					details.selection = response;
					callback(details);
				});
			});
		});
	}
	
	/* Build a markdown clip from current details as per settings */
	function createClip(details, settings) {
		var br = '<br/><br/>'
		var clip = Array(settings.headingLevel + 1).join("#") + ' ' + details.title + br;

		if (details.iconUrl && settings.includeIcon) {
			clip += '![icon](' + details.iconUrl + ')' + br;
		}

		if (details.description && details.description !== '') {
			clip += details.description + br;
		}

		if (details.selection && details.selection !== '') {
			clip += '> ' + details.selection + br;
		}

		clip += details.url + '<br/>';
		return clip;
	}
	
	/* Copy the current content to the clipboard */
	function copyToClipboard() {
		var el = document.getElementById(selectors.contentContainer);
		el.focus();
		document.execCommand('SelectAll');
		document.execCommand('copy');
		window.getSelection().empty();
	}

	/* Retrieve the current settings from storage and merge with defaults */
	function getSettings(callback) {
		chrome.storage.local.get(['settings'], function(storage) {
			if (storage && storage['settings']) {
				storage = storage['settings']
				for (var key in storage) {
					settings[key] = storage[key];
				}
			}
			document.getElementById(selectors.headingLevel).value = settings.headingLevel;
			document.getElementById(selectors.headingLevelValue).textContent = settings.headingLevel;
			settings.includeIcon ? document.getElementById(selectors.includeIconTrue).setAttribute('checked', true) : document.getElementById(selectors.includeIconTrue).removeAttribute('checked');
			settings.includeIcon ? document.getElementById(selectors.includeIconFalse).removeAttribute('checked') : document.getElementById(selectors.includeIconFalse).setAttribute('checked', true);
			settings.copyToClipboard ? document.getElementById(selectors.copyToClipboardTrue).setAttribute('checked', true) : document.getElementById(selectors.copyToClipboardTrue).removeAttribute('checked');
			settings.copyToClipboard ? document.getElementById(selectors.copyToClipboardFalse).removeAttribute('checked') : document.getElementById(selectors.copyToClipboardFalse).setAttribute('checked', true);
			settings.copyToClipboard ? document.getElementById(selectors.copyAgainButton).value = 'Copy again' : document.getElementById(selectors.copyAgainButton).value = 'Copy'
			callback(settings);
		});	
	}
	
	/* Put setting back to storage */
	function putSettings(callback) {
		chrome.storage.local.set({settings: settings}, function() {
			callback();
		});
	}

	/* Show or hide the options window */
	function showHideOptions() {
		var content = document.getElementById(selectors.contentContainer);
		var optionsButton = document.getElementById(selectors.optionsButton);
		var copyButton = document.getElementById(selectors.copyAgainButton);
		showOptions = (content.className === 'in');
		showOptions ? content.className = '' : content.className = 'in';
		showOptions ? copyButton.className = '' : copyButton.className = 'in';
		showOptions ? options.className = 'in' : options.className = '';
		showOptions ? optionsButton.value = 'Okay' : optionsButton.value = 'Settings';
		
		if (!showOptions) {
			updateSettingsFromScreen();
		}
	}

	/* Gather the settings back from the screen and store */
	function updateSettingsFromScreen() {
		settings.headingLevel = parseInt(document.getElementById(selectors.headingLevel).value);
		settings.includeIcon = (document.querySelector('input[name=include-icon]:checked').value === 'true');
		settings.copyToClipboard = (document.querySelector('input[name=copy-to-clipboard]:checked').value === 'true');
		putSettings(function() {
			getAndRenderClip();
		});
	}
	
	/* Update the level value next to the range slider */
	function updateLevelValue() {
		var level = document.getElementById(selectors.headingLevel).value;
		document.getElementById(selectors.headingLevelValue).textContent = level;
	}
	
	return {
		getAndRenderClip: getAndRenderClip,
		copyToClipboard: copyToClipboard,
		showHideOptions: showHideOptions,
		updateLevelValue: updateLevelValue
	};
}();

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('options-button').addEventListener('click', mdClip.showHideOptions);
	document.getElementById('heading-level').addEventListener('input', mdClip.updateLevelValue);
	document.getElementById('copy-again').addEventListener('click', function() {
		document.getElementById('content').className = 'in copied';
		mdClip.copyToClipboard();
		window.setTimeout(function() {
			document.getElementById('content').className = 'in';
		}, 300);
	});
	mdClip.getAndRenderClip();
});
