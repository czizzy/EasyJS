'use strict';
(function($) {
    var handlers = {}, _eid = 1, specialEvents = {};
    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

    function eid(element) {
        return element._eid || (element._eid == _eid++);
    }

    function getHandlers(element, event, fn, selector){
        var element_eid = eid(element);
        return (handlers[element_eid] || []).filter(function(handler){
            return handler && (handler.event == event) && (!selector || selector === handler.selector) && (!fn || fn === handler);
        });
    }

    function add(element, event, fn, selector) {  // TODO: fn is unique
        var element_eid = eid(element);
        fn.event = event;
        fn.selector = selector;
        (handlers[element_eid] || (handlers[element_eid] = [])).push(fn);
        element.addEventListener(event, fn);
    }

    function remove(element, event, fn, selector) {
        var elementHandlers = handlers[eid(element)];
        getHandlers(element, event, fn, selector).forEach(function(handler) {
            elementHandlers.splice(elementHandlers.indexOf(handler), 1);
            element.removeEventListener(handler.event, handler);
        });
    }

    $.Event = function(type, options) {
        var event = document.createEvent(specialEvents[type] || 'Events'),
            bubbles = options?(!!options.bubbles) : true;
        event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null);
        return event;
    };

    $.fn.extend({
        bind: function(event, fn){
            return this.each(function(element){
                add(element, event, fn);
            });
        },
        
        unbind: function(event, fn) {
            return this.each(function(element) {
                remove(element, event, fn);
            });
        },

        trigger: function(type) {    // TODO: plain object
            var event = $.Event(type);
            return this.each(function(element) {
                element.dispatchEvent(event);
            });
        },

        delegate: function(event, selector, fn) {
            return this.each(function(element){
                var wrapper = function(e) {
		            // TODO: use custom Event rather than the (read-only) native event
                    var match;
                    if(match = $(e.target).closest(selector, element)[0]){
                        //e.currentTarget = match;
                        return fn.call(match, e);
                    }
                };
                add(element, event, wrapper, selector);
            });
        }
    });

    ['focusin', 'focusout', 'load', 'resize', 'scroll', 'unload', 'click', 'dblclick', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'change', 'select', 'keydown', 'keypress', 'keyup', 'error'].forEach(function(event) {
        $.fn[event] = function(callback){ return this.bind(event, callback); };
    });
})(Easy);