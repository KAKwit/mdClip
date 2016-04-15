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
			var existingIndex = -1;
			for (var i = 0; i < clips.length; i++) {
				if (clips[index].url === clip.url) {
					existingIndex = i;
				}
			}
			if (index !== -1) {
				clips.splice(existingIndex, 1);
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

	function getCount(callback) {
		getClips(function () {
			callback(clipsCount);
		});
	}
	
	return {
		getClips: getClips,
		pushClip: pushClip,
		removeClip: removeClip,
		clearClips: clearClips,
		getCount: getCount
	}

}();
