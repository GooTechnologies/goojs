/*
Goo's own JSHint reporter.
Based on the default reporter,
but also reports unused variables.
*/

"use strict";

module.exports = {
	reporter: function (results, data, opts) {
		var len = results.length;
		var str = '';
		var prevfile;

		opts = opts || {};

		results.forEach(function (result) {
			var file = result.file;
			var error = result.error;

			if (prevfile && prevfile !== file) {
				str += "\n";
			}
			prevfile = file;

			str += file  + ': line ' + error.line + ', col ' +
				error.character + ', ' + error.reason;

			str += ' (' + error.code + ')';

			str += '\n';
		});
		data.forEach(function (result) {
			var globals = result.implieds;
			if (globals && globals.length) {
				globals.forEach(function (item) {
					str += result.file + ':' + item.line + " Implied global: '" + item.name + "'\n";

					len++;
				});
			}

			var unuseds = result.unused;
			if (unuseds) {
				unuseds.forEach(function (item) {
					str += result.file + ':' + item.line + " Unused variable: '" + item.name + "'\n";

					len++;
				});
			}
		});

		if (str) {
			process.stdout.write(str + "\n" + len + ' error' + ((len === 1) ? '' : 's') + "\n");
			//process.exit(1);
			process.on('exit', function () { process.exit(1); });
		}
	}
};
