(function () {
	'use strict';

	function compile(source) {
		function compileLine(line) {
			var trimmed = line.trim();

			if (trimmed.length === 0) {
				return '';
			}

			if (trimmed.indexOf('/*') === 0 && trimmed.lastIndexOf('*/') === trimmed.length - 2) {
				return trimmed.slice(2, -2);
			} else {
				var replacedBegin = trimmed.replace(/\/\*/g, '" +');
				var replacedEnd = replacedBegin.replace(/\*\//g, '+ "');
				return '__str += "' + replacedEnd + '\\n";';
			}
		}

		var	templateCode = "var __str = '';\n" +
			source.split('\n').map(compileLine).join('\n') +
			"\n return __str;";

		return new Function('data', templateCode);
	}

	window.jsTemplate = window.jsTemplate || {};
	window.jsTemplate.compile = compile;
})();