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
    var speed = {
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
            event = eventPrefix? (eventPrefix + 'TransitionEnd') : 'transitionend';
            return false;
        }
    });
    $.extend($.fn, {
        animate: function(properties, duration, easing, complete){
            var self = this,
                transitionText,
                wrapper,
                defferFunc;
            duration = speed[duration] || duration;
            if(typeof duration !== 'number') {
                complete = easing;
                easing = duration;
                duration = 400;
            }
            if($.isFunction(easing) || easing == undefined){
                complete = easing;
                easing = 'ease';
            }
            transitionText = buildTransitionText(properties, duration, easing);
            properties[prefix + 'transition'] = transitionText;

            defferFunc = function(deffered){
                if(typeof complete === 'function') {
                    deffered.done(function(e){
                        complete.call(this, e);  
                    });
                }
                wrapper = function(e) {
                    deffered.resolveWith(self, e);
                    self.unbind(event, wrapper);
                };
                self.bind(event, wrapper);
                setTimeout(function(){  // if modified css consecutive, the last one work
                    self.css(properties);
                }, 0);
            }
            if(!this.queue) this.queue = $.Queue();
            this.queue.add(defferFunc);
            return this;
        },

        fadeIn: function(duration, callback){
            return this.css({opacity: 0}).show().animate({opacity: 1}, duration, 'linear', callback);
        },

        fadeOut: function(duration, callback){
            var self = this;
            return this.animate({opacity: 0}, duration, 'linear', function(e){
                self.hide();
                callback.call(this, e);
            });
        }

    });
})(Easy);