'use strict';
(function($){
    var rhtml = /^text\/html/,
        rjson = /^application\/json/,
        rxml = /^(application|text)\/xml/,
        rscript = /^(application|text)\/script/,

        jsonpCallback = 0;
    
    function empty(){}

    $.ajaxSettings = {
        type: "GET",
        async: true,
        before: empty,
        success: empty,
        error: empty,
        timeout: 0
    };

    function getDataType(mime) {
        return mime && (rhtml.test(mime) ? 'html' :
            rjson.test(mime) ? 'json' :
            rxml.test(mime) ? 'xml' :
            rscript.test(mime) ? 'script' : 'text');
    }

    function serialize(data) {
        return $.isObject(data)?$.param(data):data;
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }

    $.extend({
        ajax: function(url, options) {  //TODO: return deffer object
            var headers = {},
                xhr = new XMLHttpRequest(),
                timeout;
            options = $.default(options || {}, $.ajaxSettings);
            if(options.dataType === 'jsonp')
                return this.jsonp(url, options);
            if(options.data) options.data = serialize(options.data);
            if(options.data && options.type.toUpperCase() === 'GET') {
                url = appendQuery(url, options.data);
                delete options.data;
            }

            xhr.onreadystatechange = function() {
                var dataType, error, result;
                if(xhr.readyState === 4){
                    clearTimeout(timeout);
                    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        dataType = options.dataType || getDataType(xhr.getResponseHeader('content-type'));
                        result = xhr.responseText;
                        try {
                            switch(dataType) {
                            case 'json': 
                                result = /^\s*$/.test(xhr.responseText)? null : JSON.parse(xhr.responseText);
                                break;
                            case 'xml':
                                result = xhr.responseXML;
                                break;
                            case 'script':
                                (1, eval)(result);
                                break;
                            }
                        } catch(e) {
                            error = e;
                        }
                        if(error) options.error(xhr, 'parser error', error);
                        else options.success(result, xhr, options);
                    } else {
                        options.error(xhr, xhr.statusText);
                    }
                }
            };
            if(options.contentType || (options.data && options.type.toUpperCase() !== 'GET')) {
                headers['Content-Type'] = options.contentType || 'application/x-www-form-urlencoded';
            }
            headers = $.extend(headers, options.headers || {});

            xhr.open(options.type.toUpperCase(), url, options.async);

            // must after open and before send 
            // https://developer.mozilla.org/en/xmlhttprequest
            for(var key in headers) xhr.setRequestHeader(key, headers[key]);
 
            if(options.before(xhr, options) === false){
                xhr.abort();
                return false;
            }

            if(options.timeout > 0){
                timeout = setTimeout(function(){
                    xhr.onreadystatechange = empty;
                    xhr.abort();
                    options.error(xhr, 'timeout');
                }, options.timeout);
            }
            xhr.send(options.data||null); // TODO, build data
            return xhr;
        },

        get: function(url, data, success) {
            if(success === undefined){
                success = data;
                data = null;
            }
            return this.ajax(url, {
                success: success,
                data: data
            });
        },

        post: function(url, data, success) {
            if(success === undefined){
                success = data;
                data = null;
            }
            return this.ajax(url, {
                type: "POST",
                success: success,
                data: data
            });
        },

        jsonp: function(url, options) {  // TODO: timeout and error handle
            var xhr = {},
                callback = 'callback' + (jsonpCallback++),
                script = document.createElement('script');

            window[callback] = function(response){
                options.success(response);
                delete window[callback];
            };

            script.src = url.replace(/=\?/,'='+callback);
            document.head.appendChild(script);
            return xhr;
        },

        param: function(obj) { //TODO non-traditional
            var params = [];
            for(var key in obj) {
                if($.isArray(obj[key])){
                    for(var i = 0; i < obj[key].length; i++) {
                        params.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key][i]));
                    }
                } else {
                    params.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key]));
                }
            }
            return params.join('&').replace('%20', '+');
        }
    });
})(Easy);