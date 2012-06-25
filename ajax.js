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

    $.extend($, {
        ajax: function(url, options) {
            var xhr = new XMLHttpRequest();
            options = $.default(options || {}, $.ajaxSettings);

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

            xhr.open(options.type, url, options.async);
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

        }
    });
})(Easy);