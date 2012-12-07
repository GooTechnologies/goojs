define(function() {
	"use strict";

	function DdsUtils() {
	}

	/**
	 * @description Check a value against a bit mask to see if it is set.
	 * @param value the value to check
	 * @param bitMask our mask
	 * @return true if the mask passes
	 */
	DdsUtils.isSet = function(value, bitMask) {
		return (value & bitMask) == bitMask;
	};

	/**
	 * @description Get the string as a dword int value.
	 * @param string our string... should only be 1-4 chars long.  Expected to be 1 byte chars.
	 * @return the int value
	 */
	DdsUtils.getIntFromString = function(string) {
		var bytes = [];
		for (var i = 0; i < string.length; i++) {
			bytes[i] = string.charCodeAt(i);
		}
		return DdsUtils.getIntFromBytes(bytes);
	};

	/**
	 * @description Get the byte array as a dword int value.
	 * @param bytes our array... should only be 1-4 bytes long.
	 * @return the int value
	 */
	DdsUtils.getIntFromBytes = function(bytes) {
		var rVal = 0;
		rVal |= (bytes[0] & 0xff) << 0;
		if (bytes.length > 1) {
			rVal |= (bytes[1] & 0xff) << 8;
		}
		if (bytes.length > 2) {
			rVal |= (bytes[2] & 0xff) << 16;
		}
		if (bytes.length > 3) {
			rVal |= (bytes[3] & 0xff) << 24;
		}
		return rVal;
	};

	return DdsUtils;
});