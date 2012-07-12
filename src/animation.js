'use strict';
(function($){
    function buildTransitionText(properties, duration, easing, complete){
        var postfix, textArr = [];
        duration = duration/1000 + 's';
        postfix = ' ' + duration + ' ' + easing;
        for(var key in properties) {
            textArr.push(key + postfix);
        }
        return textArr.join(',') + ';';
    }
    var durations  = {
        fast: 200,
        slow: 600
    },
        vendors = {Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS'},
        testEl = document.createElement('div'),
        prefix,
        event;

    $.each(vendors, function(eventPrefix, vendor) {
        if(testEl.style[vendor + 'Transition'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-';
            event = eventPrefix + 'TransitionEnd';
            return false;
        }
    });
    $.fn.extend({
        animate: function(properties, duration, easing, complete){
            var self = this,
                transitionText,
                wrapper;
            if(typeof duration !== 'number') {
                complete = easing;
                easing = duration;
                duration = 400;
            }
            if($.isFunction(easing)){
                complete = easing;
                easing = 'ease';
            }
            transitionText = buildTransitionText(properties, duration, easing);
            properties[prefix + 'transition'] = transitionText;
            if(typeof complete === 'function') {
                wrapper = function(e) {
                    complete.call(this, e);
                    self.unbind(event, wrapper);
                };
                this.bind(event, wrapper);
            }
            return this.css(properties);
        }
    });
})(Easy);