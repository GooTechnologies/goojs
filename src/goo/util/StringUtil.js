define(function() {
	// REVIEW: This doesn't look like GooJS code, see ArrayUtil.js
	return {
		endsWith: function(str, suffix) {
			return str.indexOf(suffix, str.length - suffix.length) !== -1;
		},
		startsWith: function(str, prefix) {
			return str.indexOf(prefix) === 0;
		}
	};
});
