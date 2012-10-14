define(function() {
	function Util() {

	}

	Util.getByteSize = function(type) {
		switch (type) {
			case 'Byte':
				return 1;
			case 'UnsignedByte':
				return 1;
			case 'Short':
				return 2;
			case 'UnsignedShort':
				return 2;
			case 'Int':
				return 4;
			case 'HalfFloat':
				return 2;
			case 'Float':
				return 4;
			case 'Double':
				return 8;
		}
	};

	return Util;
});