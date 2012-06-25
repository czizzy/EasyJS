(function($){
    var rhtml = /^text\/html/,
        rjson = /^application\/json/,
        rxml = /^(application|text)\/xml/,
        rscript = /^(application|text)\/script/;
    
    function empty(){}

    $.ajaxSettings = {
        type: "GET",
        async: true,
        before: empty,
        success: empty,
        error: empty
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
        ajax: function(url, options) {  //TODO: timeout
            var headers,
                xhr = new XMLHttpRequest();
            options = $.default(options || {}, $.ajaxSettings);

            if(options.data) options.data = serialize(options.data);
            if(options.data && options.type.toUpperCase() === 'GET') {
                url = appendQuery(url, options.data);
            }

            xhr.onreadystatechange = function() {
                var dataType, error, result;
                if(xhr.readyState === 4){
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
                        if(error) options.error(error, 'parsererror', xhr);
                        else options.success(result, xhr, options);
                    } else {
                        options.error(null, error, xhr);
                    }
                }
            };
            if(options.contentType || (options.data && options.type.toUpperCase() !== 'GET')) {
                headers['Content-Type'] = options.contentType || 'application/x-www-form-rulencoded';
            }

            headers = $.extend(headers, options.headers || {});
            
            xhr.open(options.type, url, options.async);

            // must after open and before send 
            // https://developer.mozilla.org/en/xmlhttprequest
            for(var key in headers) xhr.setRequestHeader(key, headers[key]);
 
            if(options.before(xhr, options) === false){
                xhr.abort();
                return false;
            }
            
            xhr.send(options.data||null); // TODO, build data
            return xhr;
        },

        get: function() {

        },

        post: function() {

        },

        jsonp: function() {

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