define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(7182);
    function SetCssPropertyAction(settings) {
        settings = settings || {};
        __touch(7188);
        this.everyFrame = settings.everyFrame || false;
        __touch(7189);
        this.selector = settings.selector || 'body';
        __touch(7190);
        this.property = settings.property || 'background-color';
        __touch(7191);
        this.value = settings.value || 'black';
        __touch(7192);
    }
    __touch(7183);
    SetCssPropertyAction.prototype = Object.create(Action.prototype);
    __touch(7184);
    SetCssPropertyAction.external = [{
            selector: [
                'string',
                'Selector'
            ],
            property: [
                'string',
                'Property'
            ],
            value: [
                'string',
                'Value'
            ]
        }];
    __touch(7185);
    SetCssPropertyAction.prototype.onCreate = function () {
        $(this.selector).css(this.property, this.value);
        __touch(7193);
    };
    __touch(7186);
    return SetCssPropertyAction;
    __touch(7187);
});
__touch(7181);