'use strict';
(function($){
    var origSlice = Array.prototype.slice;
    $.extend({
        Deffered: function(initFunc){
            var resolved = false,
                rejected = false,
                value,
                error,
                callbacks,
                errCallbacks,
                promise = {
                    then: function(successCallback, errorCallback){
                        if(resolved){
                            successCallback && successCallback.apply(this, value);
                        } else if(rejected){
                            errorCallback && errorCallback.apply(this, error);
                        } else {
                            successCallback && (callbacks || (callbacks = [])).push(successCallback);
                            errorCallback && (errCallbacks || (errCallbacks = [])).push(errorCallback);
                        }
                        return this;
                    },
                    always: function(callback){
                        return this.then(callback, callback);
                    },
                    done: function(callback){
                        return this.then(callback);
                    },
                    fail: function(callback){
                        return this.then(null, callback);
                    },
                    isResolved: function(){
                        return resolved;
                    },
                    isRejected: function(){
                        return rejected;
                    },
                    promise: function(){
                        return this;
                    }
                },
                deffered = $.inherit(promise);
            deffered.resolveWith = function(context){
                var args = origSlice.call(arguments, 1);
                if(!resolved && !rejected){
                    resolved = true;
                    value = args;
                    if(callbacks){
                        callbacks.forEach(function(callback){
                            callback.apply(context, value);
                        });
                    }
                }
            };
            deffered.resolve = function(){
                var args = origSlice.call(arguments, 0);
                args.unshift(this);
                return deffered.resolveWith.apply(this, args);
            };
            deffered.rejectWith = function(context){
                var args = origSlice.call(arguments, 1);
                if(!rejected && !resolved){
                    rejected = true;
                    error = args;
                    if(errCallbacks){
                        errCallbacks.forEach(function(callback){
                            callback.apply(context, error);
                        });
                    }
                }
            };
            deffered.reject = function(){
                var args = origSlice.call(arguments, 0);
                args.unshift(this);
                return deffered.rejectWith.apply(this, args);
            };
            deffered.promise = function(target){
                if($.isObject(target)){
                    return $.extend(target, promise);                    
                }
                return promise;
            };
            initFunc && initFunc.call(deffered, deffered);
            return deffered;
        },
        when: function(first){
            var deffer, list, resolveFunc, rejectFunc, count = arguments.length, results = Array(count);
            if(count === 1 && $.isFunction(first.promise)){
                return first.promise;
            } else {
                resolveFunc = function(i){
                    return function(result){
                        results.splice(i, 1, result);
                        count--;
                        if(!count) {
                            deffer.resolve.apply(deffer, results);
                        }
                    };
                };
                rejectFunc = function(){
                    deffer.reject.apply(deffer, arguments);
                };
                list = origSlice.call(arguments, 0);
                list = list.map(function(item, index){
                    var isNormal = !item.promise, defferedItem = isNormal?$.Deffered():item;
                    defferedItem.done(resolveFunc(index)).fail(rejectFunc);
                    if(isNormal) {
                        defferedItem.resolve(item);
                    }
                    return defferedItem;
                });
                deffer = $.Deffered();
                return deffer.promise();
            }
        }
    });

})(Easy);