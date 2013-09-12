define(function() {
	var StringUtil = {};

	StringUtil.endsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	StringUtil.startsWith = function(str, prefix) {
		return str.indexOf(prefix) === 0;
	};

	StringUtil.capitalize = function(str) {
		return str.substring(0,1).toUpperCase()+str.substring(1);
	};


	return StringUtil;
});
