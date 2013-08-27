define(function() {
	var StringUtil = {};

	StringUtil.prototype.endsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	StringUtil.prototype.startsWith = function(str, prefix) {
		return str.indexOf(prefix) === 0;
	};

	return StringUtil;
});
