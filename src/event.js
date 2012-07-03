'use strict';
(function($) {
    var handlers = {}, _eid = 1, specialEvents = {},
        eventMethods = ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'];
    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

    function eid(element) {
        return element._eid || (element._eid = _eid++);
    }

    function getHandlers(element, event, fn, selector){
        var element_eid = eid(element);
        return (handlers[element_eid] || []).filter(function(handler){
            return handler && (handler.event == event) && (!selector || selector === handler.selector) && (!fn || fn === handler || fn === handler.originalHandler);
        });
    }

    function add(element, event, fn, selector) {
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

    function createProxy(event){
        var proxy = $.extend({originalEvent: event}, event);
        eventMethods.forEach(function(method){
            proxy[method] = function(){
                return event[method].apply(event, arguments);
            };
        });
        return proxy;
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
                    var event, match;
                    if(match = $(e.target).closest(selector, element)[0]){
		                // use custom Event rather than the (read-only) native event
                        event = createProxy(e);
                        event.currentTarget = match;
                        return fn.call(match, event);
                    }
                };
                wrapper.originalHandler = fn;
                add(element, event, wrapper, selector);
            });
        },

        undelegate: function(event, selector, fn) {
            return this.each(function(element) {
                remove(element, event, fn, selector);
            });
        }

        // TODO: on and off
    });

    ['focusin', 'focusout', 'load', 'resize', 'scroll', 'unload', 'click', 'dblclick', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'change', 'select', 'keydown', 'keypress', 'keyup', 'error'].forEach(function(event) {
        $.fn[event] = function(callback){ return this.bind(event, callback); };
    });
})(Easy);