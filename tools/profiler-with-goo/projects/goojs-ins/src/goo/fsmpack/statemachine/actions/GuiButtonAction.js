define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
    'use strict';
    __touch(6641);
    function GuiButtonAction(settings) {
        settings = settings || {};
        __touch(6648);
        this.everyFrame = settings.everyFrame || true;
        __touch(6649);
        this.name = settings.name || 'Button';
        __touch(6650);
        this.event = settings.event || 'dummy';
        __touch(6651);
    }
    __touch(6642);
    GuiButtonAction.prototype = Object.create(Action.prototype);
    __touch(6643);
    GuiButtonAction.external = [
        {
            name: 'Name',
            key: 'name',
            type: 'string'
        },
        {
            name: 'Send Event',
            key: 'event',
            type: 'event'
        }
    ];
    __touch(6644);
    GuiButtonAction.prototype._setup = function (fsm) {
        this.button = $('<button/>', {
            text: this.name,
            css: {
                'position': 'relative',
                'z-index': 10000
            },
            click: function () {
                fsm.send(this.event);
                __touch(6653);
            }.bind(this)
        }).appendTo($('body'));
        __touch(6652);
    };
    __touch(6645);
    GuiButtonAction.prototype.exit = function () {
        if (this.button) {
            this.button.remove();
            __touch(6654);
        }
    };
    __touch(6646);
    return GuiButtonAction;
    __touch(6647);
});
__touch(6640);