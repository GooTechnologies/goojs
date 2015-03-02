define([
    'goo/scripts/Scripts',
    'goo/scriptpack/WASDControlScript',
    'goo/scriptpack/MouseLookControlScript'
], function (Scripts, WASDScript, MouseLookControlScript) {
    'use strict';
    __touch(19236);
    function FlyControlScript() {
        var wasdScript = Scripts.create(WASDScript);
        __touch(19243);
        var lookScript = Scripts.create(MouseLookControlScript);
        __touch(19244);
        function setup(parameters, environment) {
            lookScript.setup(parameters, environment);
            __touch(19249);
            wasdScript.setup(parameters, environment);
            __touch(19250);
        }
        __touch(19245);
        function update(parameters, environment) {
            lookScript.update(parameters, environment);
            __touch(19251);
            wasdScript.update(parameters, environment);
            __touch(19252);
        }
        __touch(19246);
        function cleanup(parameters, environment) {
            lookScript.cleanup(parameters, environment);
            __touch(19253);
            wasdScript.cleanup(parameters, environment);
            __touch(19254);
        }
        __touch(19247);
        return {
            setup: setup,
            cleanup: cleanup,
            update: update
        };
        __touch(19248);
    }
    __touch(19237);
    var wasdParams = WASDScript.externals.parameters;
    __touch(19238);
    var mouseLookParams = MouseLookControlScript.externals.parameters;
    __touch(19239);
    var params = wasdParams.concat(mouseLookParams.slice(1));
    __touch(19240);
    FlyControlScript.externals = {
        key: 'FlyControlScript',
        name: 'Fly Control',
        description: 'This is a combo of WASDscript and mouselookscript',
        parameters: params
    };
    __touch(19241);
    return FlyControlScript;
    __touch(19242);
});
__touch(19235);