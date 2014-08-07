define([],
/** @lends */
function () {
    'use strict';

    // This will make the dom element dispatch the "tap" event
    // Slightly modified version of http://alxgbsn.co.uk/2012/03/12/tap-js-a-lightweight-tap-event-javascript-plugin/
    function Tap(el) {
        el = typeof el === 'object' ? el : document.getElementById(el);
        this.element = el;
        this.moved = false; //flags if the finger has moved
        this.startX = 0; //starting x coordinate
        this.startY = 0; //starting y coordinate
        this.hasTouchEventOccured = false; //flag touch event
        el.addEventListener('touchstart', this, false);
        el.addEventListener('touchmove', this, false);
        el.addEventListener('touchend', this, false);
        el.addEventListener('touchcancel', this, false);
        el.addEventListener('mousedown', this, false);
        el.addEventListener('mouseup', this, false);
    }

    Tap.prototype.start = function (e) {
        if (e.type === 'touchstart') {
            this.hasTouchEventOccured = true;
        }
        this.moved = false;
        this.startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        this.startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    };

    Tap.prototype.move = function (e) {
        //if finger moves more than 10px flag to cancel
        this.endX = e.touches[0].clientX;
        this.endY = e.touches[0].clientY;
        if (Math.abs(this.endX - this.startX) > 10 || Math.abs(this.endY - this.startY) > 10) {
            this.moved = true;
        }
    };

    Tap.prototype.end = function (e) {
        var evt;

        if (this.hasTouchEventOccured && e.type === 'mouseup') {
            e.preventDefault();
            e.stopPropagation();
            this.hasTouchEventOccured = false;
            return;
        }

        if (!this.moved) {
            //create custom event
            if (window.CustomEvent) {
                evt = new window.CustomEvent('tap', {
                    bubbles: true,
                    cancelable: true
                });
            } else {
                evt = document.createEvent('Event');
                evt.initEvent('tap', true, true);
            }

            evt.offsetX = this.startX;
            evt.offsetY = this.startY;
            evt.clientX = this.startX;
            evt.clientY = this.startY;

            // dispatchEvent returns false if any handler calls preventDefault,
            if (!e.target.dispatchEvent(evt)) {
                // in which case we want to prevent clicks from firing.
                e.preventDefault();
            }
        }
    };

    Tap.prototype.cancel = function (/*e*/) {
        this.hasTouchEventOccured = false;
        this.moved = false;
        this.startX = 0;
        this.startY = 0;
    };

    Tap.prototype.destroy = function () {
        var el = this.element;
        el.removeEventListener('touchstart', this, false);
        el.removeEventListener('touchmove', this, false);
        el.removeEventListener('touchend', this, false);
        el.removeEventListener('touchcancel', this, false);
        el.removeEventListener('mousedown', this, false);
        el.removeEventListener('mouseup', this, false);
        this.element = null;
    };

    Tap.prototype.handleEvent = function (e) {
        switch (e.type) {
        case 'touchstart':
            this.start(e);
            break;
        case 'touchmove':
            this.move(e);
            break;
        case 'touchend':
            this.end(e);
            break;
        case 'touchcancel':
            this.cancel(e);
            break;
        case 'mousedown':
            this.start(e);
            break;
        case 'mouseup':
            this.end(e);
            break;
        }
    };

    return Tap;
});