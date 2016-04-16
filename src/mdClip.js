mdClip = function() {

	/* Document object selector names */
	var selectors = {
		mainWindow           : 'main-window',
		contentContainer     : 'content',
		storageContainer     : 'storage',
		storageList          : 'storage-list',
		optionsContainer     : 'options',
		optionsButton        : 'options-button',
		exportButton         : 'export-button',
		storageButton        : 'storage-button',
		copyAgainButton      : 'copy-again',
		headingLevel         : 'heading-level',
		headingLevelValue    : 'heading-level-value',
		includeIconFalse     : 'include-icon-false',
		includeIconTrue      : 'include-icon-true',
		copyToClipboardTrue  : 'copy-to-clipboard-true',
		copyToClipboardFalse : 'copy-to-clipboard-false',
		copyToStorageTrue    : 'copy-to-storage-true',
		copyToStorageFalse   : 'copy-to-storage-false',
        exportSelect         : 'export-select',
        themeSelect          : 'theme-select',
		storedClips          : 'stored-clips'
	};

	/* Messages sent to the window */
	var messageNames = {
		getDescription   : 'get-description',
		getSelection     : 'get-selection',
		downloadMarkdown : 'download-markdown'
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
		copyToStorage: true,
		theme: 'default',
		export: 'markdown'
	};

	const noStoredClips = '<p><i>No stored clips.</i></p>';
	
	/* Gather together the details, create the clip, and copy it to clipboard & storage */
	function getAndRenderClip() {
		getTabDetails(function(details) {
			getSettings(function(settings) {
				document.getElementById(selectors.contentContainer).innerHTML = createClip(details, settings);
				if (settings.copyToClipboard) {
					copyToClipboard();
				}
				document.getElementById('main-window').className = settings.theme + ' in';
				if (settings.copyToStorage) {
					mdClipStore.pushClip(details, function() {
						mdClipStore.getClipsCount(function(count) {
							document.getElementById(selectors.storedClips).textContent = count;
						});
					});
				}
			});
		});
	}

	/* Get the details for the clip from both the Chrome tab and window details */
	function getTabDetails(callback) {
		chrome.tabs.query(queryInfo, function(tabs) {
			var tab = tabs[0];
			details.url = tab.url;
			details.title = htmlEscape(tab.title);
			details.iconUrl = tab.favIconUrl;
			chrome.tabs.sendMessage(tab.id, {message: messageNames.getDescription}, function(response) {
				details.description = htmlEscape(response);
				chrome.tabs.sendMessage(tab.id, {message: messageNames.getSelection}, function(response) {
					details.selection = response;
					callback(details);
				});
			});
		});
	}
	
	/* Build a markdown clip from current details as per settings */
	function createClip(details, settings) {
		var br = '<br/><br/>';
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
			settings.copyToClipboard ? document.getElementById(selectors.copyAgainButton).value = 'Copy again' : document.getElementById(selectors.copyAgainButton).value = 'Copy';
			settings.copyToStorage ? document.getElementById(selectors.copyToStorageTrue).setAttribute('checked', true) : document.getElementById(selectors.copyToStorageTrue).removeAttribute('checked');
			settings.copyToStorage ? document.getElementById(selectors.copyToStorageFalse).removeAttribute('checked') : document.getElementById(selectors.copyToStorageFalse).setAttribute('checked', true);
			settings.copyToStorage ? document.getElementById(selectors.storageButton).className = 'in' : document.getElementById(selectors.storageButton).className = '';
			
			var e = document.getElementById(selectors.exportSelect);
			selectOption(e, settings.export);
			e = document.getElementById(selectors.themeSelect);
			selectOption(e, settings.theme);

			document.getElementById(selectors.mainWindow).className = settings.theme;			
			document.getElementById(selectors.copyAgainButton).className = 'in';
			
			var count = 0;
			mdClipStore.getClipsCount(function(count) {
				document.getElementById(selectors.storedClips).textContent = count;
				callback(settings);
			});
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
		var options = document.getElementById(selectors.optionsContainer);
		var optionsButton = document.getElementById(selectors.optionsButton);
		var copyButton = document.getElementById(selectors.copyAgainButton);
		var storageButton = document.getElementById(selectors.storageButton);
		var showOptions = (content.className === 'in');
		showOptions ? content.className = '' : content.className = 'in';
		showOptions ? copyButton.className = '' : copyButton.className = 'in';
		showOptions ? storageButton.className = '' : storageButton.className = 'in';
		showOptions ? options.className = 'in' : options.className = '';
		showOptions ? optionsButton.value = 'Okay' : optionsButton.value = 'Settings';
		
		if (!showOptions) {
			updateSettingsFromScreen();
		}
	}
	
	/* Show or hide storage */
	function showHideStorage() {
		var content = document.getElementById(selectors.contentContainer);
		var storage = document.getElementById(selectors.storageContainer);
		var storageList = document.getElementById(selectors.storageList);
		var optionsButton = document.getElementById(selectors.optionsButton);
		var storageButton = document.getElementById(selectors.storageButton);
		var exportButton = document.getElementById(selectors.exportButton);
		var copyButton = document.getElementById(selectors.copyAgainButton);
		var showStorage = (content.className === 'in');
		showStorage ? content.className = '' : content.className = 'in';
		showStorage ? storage.className = 'in' : storage.className = '';
		showStorage ? copyButton.className = '' : copyButton.className = 'in';
		showStorage ? optionsButton.className = '' : optionsButton.className = 'in';
		showStorage ? exportButton.className = 'in' : exportButton.className = '';
		showStorage ? storageButton.value = 'Close' : storageButton.value = 'Storage';
		
		if (showStorage) {
			storageList.innerHTML = '';
			mdClipStore.getClips(function(clips) {
				if (clips.length === 0) {
					storageList.innerHTML = noStoredClips;
				}
				else {
					for (var i = 0; i < clips.length; i++) {
						storageList.innerHTML = storageList.innerHTML + '<p><strong>' + clips[i].title + '</strong><br/>' + clips[i].url + '</p>';
					}
				}
			});
		}
		
		if (!showStorage) {
			getAndRenderClip();
		}
	}

	/* Gather the settings back from the screen and store */
	function updateSettingsFromScreen() {
		settings.headingLevel = parseInt(document.getElementById(selectors.headingLevel).value);
		settings.includeIcon = (document.querySelector('input[name=include-icon]:checked').value === 'true');
		settings.copyToClipboard = (document.querySelector('input[name=copy-to-clipboard]:checked').value === 'true');
		settings.copyToStorage = (document.querySelector('input[name=copy-to-storage]:checked').value === 'true');
		var e = document.getElementById(selectors.exportSelect);
		settings.export = e.options[e.selectedIndex].value;
		e = document.getElementById(selectors.themeSelect);
		settings.theme = e.options[e.selectedIndex].value;
		putSettings(function() {
			getAndRenderClip();
		});
	}

	/* Clear clips from the store */
	function clearClips() {
		mdClipStore.clearClips(function() {
			mdClipStore.getClipsCount(function(count) {
				document.getElementById(selectors.storageList).innerHTML = noStoredClips;
				document.getElementById(selectors.storedClips).textContent = count;
			});
		});
	}

	/* Update the level value next to the range slider */
	function updateLevelValue() {
		var level = document.getElementById(selectors.headingLevel).value;
		document.getElementById(selectors.headingLevelValue).textContent = level;
	}

	function selectOption(e, v) {
		for (var i = 0; i < e.length; i++) {
			if (e.options[i].value === v) {
				e.selectedIndex = i;
			}
		}
	}

	function htmlEscape(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
	
	function exportClips() {
		if (settings.export === 'markdown') {
			exportToMarkdown();
		}
	}
	
	function exportToMarkdown() {
		mdClipStore.getClipsAsMarkdown(settings, function(content) {
			chrome.tabs.query(queryInfo, function(tabs) {
				var tab = tabs[0];
				chrome.tabs.sendMessage(tab.id, {message: messageNames.downloadMarkdown, content: content}, function(response) {
				});
			});
		});
	}
	
	return {
		getAndRenderClip: getAndRenderClip,
		copyToClipboard: copyToClipboard,
		showHideOptions: showHideOptions,
		showHideStorage: showHideStorage,
		updateLevelValue: updateLevelValue,
		clearClips: clearClips,
		exportClips: exportClips
	};
}();

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('options-button').addEventListener('click', mdClip.showHideOptions);
	document.getElementById('storage-button').addEventListener('click', mdClip.showHideStorage);
	document.getElementById('heading-level').addEventListener('input', mdClip.updateLevelValue);
	document.getElementById('clear-store').addEventListener('click', mdClip.clearClips);
	document.getElementById('export-button').addEventListener('click', mdClip.exportClips);
	document.getElementById('copy-again').addEventListener('click', function() {
		document.getElementById('content').className = 'in copied';
		mdClip.copyToClipboard();
		window.setTimeout(function() {
			document.getElementById('content').className = 'in';
		}, 300);
	});
	mdClip.getAndRenderClip();
});
