'use strict';
(function($){
    function buildTransitionText(properties, duration, easing, complete){
        var match = /^(\d+)/.exec(duration), postfix, textArr = [];
        if(match) {
            duration = match[1];
        } else {
            duration = durations[duration] || 400;
        }
        duration = duration/1000 + 's';
        (typeof easing === 'string') || (easing = 'ease');
        postfix = ' ' + duration + ' ' + easing;
        for(var key in properties) {
            textArr.push(key + postfix);
        }
        return textArr.join(',') + ';';
    }
    var durations  = {
        fast: 200,
        slow: 600
    };
    $.fn.extend({
        animate: function(properties, duration, easing, complete){
            var transitionText = buildTransitionText(properties, duration, easing), 
                self = this,
                wrapper;
            properties['-webkit-transition'] = transitionText;
            if(typeof complete === 'function') {
                wrapper = function(e) {
                    complete.call(this, e);
                    self.unbind('webkitTransitionEnd');
                };
                this.bind('webkitTransitionEnd', wrapper);
            }
            return this.css(properties);
        }
    });
})(Easy);