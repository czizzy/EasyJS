(function($) {
    $.fn.extend({
        bind: function(event, fn){
            return this.each(function(element){
                element.addEventListener(event, fn, false);
            });
        },
        
        unbind: function(event, fn) {
            
        }
    });

    ['focusin', 'focusout', 'load', 'resize', 'scroll', 'unload', 'click', 'dblclick', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'change', 'select', 'keydown', 'keypress', 'keyup', 'error'].forEach(function(event) {
        $.fn[event] = function(callback){ return this.bind(event, callback) }
    });
})(Easy);