/* Storage of clips so they can be exported later */
mdClipStore = function() {
	
	var clips = [];
	var clipsCount = 0;
	
	function getClips(callback) {
		clips = [];
		chrome.storage.local.get(['clips'], function(storage) {
			if (storage && storage['clips']) {
				storage = storage['clips'];
				for (var i = 0; i < storage.length; i++) {
					clips.push(storage[i]);
				}
			}
			clipsCount = clips.length;
			callback(clips);
		})
	}
	
	function pushClip(clip, callback) {
		getClips(function() {
			var index = -1;
			for (var i = 0; i < clips.length; i++) {
				if (clips[i].url === clip.url) {
					index = i;
				}
			}
			~index ? clips[index] = clip : clips.push(clip);
			putClips(function() {
				callback();
			})
		});
	}
	
	function removeClip(clip, callback) {
		getClips(function() {
			var index = -1;
			for (var i = 0; i < clips.length; i++) {
				if (clips[i].url === clip.url) {
					index = i;
				}
			}
			if (index !== -1) {
				clips.splice(index, 1);
			}
			putClips(function() {
				callback();
			})
		});
	}
	
	function clearClips(callback) {
		clips = [];
		putClips(function() {
			callback();
		})
	}

	function putClips(callback) {
		chrome.storage.local.set({clips: clips}, function() {
			callback();
		});
	}

	function getClipsCount(callback) {
		getClips(function () {
			callback(clipsCount);
		});
	}
	
	function getClipsAsMarkdown(settings, callback) {
		getClips(function () {
			var md = '';
			for (var i = 0; i < clips.length; i++) {
				if (i > 0) {
					md += '\n---\n\n';
				}
				md += createClip(clips[i], settings);
			}
			callback(md);
		});
	}

	function getClipsAsQvnote(callback) {
		getClips(function () {
			var md = '';
			for (var i = 0; i < clips.length; i++) {
				md += clips[i].title + '\r\n';
			}
			var zip = new JSZip();
			zip.file('test.md', md);
			zip.generateAsync({type: "base64"})
				.then(function(content) {
					callback(content);
				});
		});
	}

	function createClip(details, settings) {
		var br = '\n\n';
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

		clip += details.url + '\n';
		return clip;
	}

	return {
		getClips: getClips,
		pushClip: pushClip,
		removeClip: removeClip,
		clearClips: clearClips,
		getClipsCount: getClipsCount,
		getClipsAsMarkdown: getClipsAsMarkdown
	}

}();
