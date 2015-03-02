define([], function () {
    'use strict';
    __touch(22491);
    function StringUtil() {
    }
    __touch(22492);
    StringUtil.endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
        __touch(22511);
    };
    __touch(22493);
    StringUtil.startsWith = function (str, prefix) {
        return str.indexOf(prefix) === 0;
        __touch(22512);
    };
    __touch(22494);
    StringUtil.capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
        __touch(22513);
    };
    __touch(22495);
    StringUtil.uncapitalize = function (str) {
        return str.charAt(0).toLowerCase() + str.substring(1);
        __touch(22514);
    };
    __touch(22496);
    StringUtil.createUniqueId = function (type) {
        var date = Date.now();
        __touch(22515);
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var randomNumber = (date + Math.random() * 16) % 16 | 0;
            __touch(22518);
            if (c === 'x') {
                return randomNumber.toString(16);
                __touch(22519);
            } else {
                return (randomNumber & 3 | 8).toString(16);
                __touch(22520);
            }
        });
        __touch(22516);
        if (type === undefined) {
            return uuid;
            __touch(22521);
        }
        return uuid + '.' + type;
        __touch(22517);
    };
    __touch(22497);
    StringUtil.getUntil = function (string, stopString) {
        var stopIndex = string.indexOf(stopString);
        __touch(22522);
        if (stopIndex === -1) {
            return string;
            __touch(22523);
        } else {
            return string.slice(0, stopIndex);
            __touch(22524);
        }
    };
    __touch(22498);
    StringUtil.getAfterLast = function (string, stopString) {
        var stopIndex = string.lastIndexOf(stopString);
        __touch(22525);
        if (stopIndex === -1) {
            return string;
            __touch(22526);
        } else {
            return string.slice(stopIndex + stopString.length, string.length);
            __touch(22527);
        }
    };
    __touch(22499);
    StringUtil.getFrom = function (string, startString) {
        var startIndex = string.indexOf(startString);
        __touch(22528);
        if (startIndex === -1) {
            return '';
            __touch(22529);
        } else {
            return string.slice(startIndex + startString.length, string.length);
            __touch(22530);
        }
    };
    __touch(22500);
    StringUtil.getIndexedName = function (base, takenNames, separator) {
        if (!separator) {
            separator = '_';
            __touch(22536);
        }
        var re = new RegExp(base + '(' + separator + '\\d+)?');
        __touch(22531);
        var i;
        __touch(22532);
        var index = 0;
        __touch(22533);
        for (i in takenNames) {
            var name = takenNames[i];
            __touch(22537);
            var m = re.exec(name);
            __touch(22538);
            if (m) {
                if (m.length > 1 && m[1]) {
                    var nidx = parseInt(m[1].substring(separator.length), 10);
                    __touch(22539);
                    if (nidx >= index) {
                        index = nidx + 1;
                        __touch(22540);
                    }
                } else {
                    index = 1;
                    __touch(22541);
                }
            }
        }
        __touch(22534);
        return base + separator + index;
        __touch(22535);
    };
    __touch(22501);
    StringUtil.getUniqueName = function (desiredName, takenNames, separator) {
        if (takenNames.indexOf(desiredName) === -1) {
            return desiredName;
            __touch(22543);
        }
        return StringUtil.getIndexedName(desiredName, takenNames, separator);
        __touch(22542);
    };
    __touch(22502);
    StringUtil.toAscii = function (input) {
        return input.replace(/([^\x00-\x7F])/g, 'x');
        __touch(22544);
    };
    __touch(22503);
    StringUtil.hashCode = function (str) {
        var hash = 0;
        __touch(22545);
        if (str.length === 0) {
            return hash;
            __touch(22547);
        }
        for (var i = 0; i < str.length; i++) {
            var character = str.charCodeAt(i);
            __touch(22548);
            hash = (hash << 5) - hash + character;
            __touch(22549);
            hash = hash & hash;
            __touch(22550);
        }
        return btoa(hash).replace('/', '_').replace('+', '-');
        __touch(22546);
    };
    __touch(22504);
    var idCounter = Date.now();
    __touch(22505);
    StringUtil.getUniqueId = function () {
        idCounter++;
        __touch(22551);
        var stringedArguments = Array.prototype.slice.call(arguments, 0).join('');
        __touch(22552);
        return StringUtil.hashCode(idCounter + '' + stringedArguments);
        __touch(22553);
    };
    __touch(22506);
    StringUtil.escapeHtmlEntities = function (text) {
        var div = document.createElement('div');
        __touch(22554);
        div.appendChild(document.createTextNode(text));
        __touch(22555);
        var edgeCases = { 34: 'quot' };
        __touch(22556);
        return div.innerHTML.replace(/[\u00A0-\u2666\"\']/g, function (c) {
            var entityName = edgeCases[c.charCodeAt(0)];
            __touch(22558);
            return '&' + (entityName || '#' + c.charCodeAt(0)) + ';';
            __touch(22559);
        });
        __touch(22557);
    };
    __touch(22507);
    var splitRegExp = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
    __touch(22508);
    StringUtil.parseURL = function (uri) {
        var split = uri.match(splitRegExp);
        __touch(22560);
        return {
            'scheme': split[1],
            'user_info': split[2],
            'domain': split[3],
            'port': split[4],
            'path': split[5],
            'query_data': split[6],
            'fragment': split[7]
        };
        __touch(22561);
    };
    __touch(22509);
    return StringUtil;
    __touch(22510);
});
__touch(22490);