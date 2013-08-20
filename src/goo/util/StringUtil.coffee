define [], ()->		
	endsWith: (str, suffix)->
		str.indexOf(suffix, str.length - suffix.length) != -1

	startsWith: (str, prefix)->
		str.indexOf(prefix) == 0
