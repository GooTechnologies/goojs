(function () {
	'use strict';

	var editor;
	var mapping, touched;

	function request(url, callback) {
		var httpRequest = new XMLHttpRequest();

		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState == 4) {
				if (httpRequest.status == 200) {
					callback(httpRequest.responseText);
				} else {
					throw new Error('Could not retrieve ' + url);
				}
			}
		};

		httpRequest.open('GET', url);
		httpRequest.send();
	}

	function setupEditor() {
		editor = ace.edit('editor');
		editor.setTheme('ace/theme/monokai');
		editor.getSession().setMode('ace/mode/javascript');
		editor.getSession().setUseWrapMode(true);
		editor.setReadOnly(true);
		editor.setFontSize(18);
		editor.session.setOption('useWorker', false);
	}

	function updateFile(file, source) {
		editor.setValue(source);

		// editor.session.addMarker(new Range(4, 5, 8, 5), "foo", "line");

		var offset = mapping[file].offset;
		var localMapping = mapping[file].mapping;

		var annotations = localMapping.map(function (entry, index) {
			var count = touched[index + offset];

			return {
				row: entry.line - 1,
				column: 0,
				text: 'count: ' + count,
				type: "warning"
			};
		});

		console.log(annotations);
		editor.getSession().setAnnotations(annotations);
	}

	function populateSelect(files) {
		var select = document.getElementById('file');

		files.forEach(function (file) {
			var option = document.createElement('option');
			option.innerText = file;

			select.appendChild(option);
		});

		select.addEventListener('change', function () {
			var currentFile = this.options[this.selectedIndex].text;
			request('../' + currentFile, function (source) {
				updateFile(currentFile, source);
			});
		});
	}

	setupEditor();

	window.addEventListener('message', function (event) {
		mapping = event.data.mapping;
		touched = event.data.touched;

		var files = Object.keys(mapping);

		populateSelect(files);
	});
})();