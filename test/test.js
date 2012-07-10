var should = chai.Should();
window.setupTest = function(){
    var testArea = document.getElementById('test-area'),
        testContent = document.getElementById('test-content').innerHTML;
    mocha.setup({
        ui: 'bdd',
        globals: [],
        timeout: 2500,
        ignoreLeaks: true
    });
    beforeEach(function(){
        testArea.innerHTML = testContent;
    });

    describe('DOM Selector', function(){
        describe('id selector', function(){
            it('should return correct element with the id selector', function(){
                $('#test-area').should.be.length(1);
                $('#test-area', '#outer-1').should.be.length(1);

                $('#not-exist').should.be.length(0);
                $('#not-exist', '#outer-1').should.be.length(0);
            });
        });
        describe('tag selector', function(){
            it('should return correct element with the tag selector', function(){
                $('ruby').should.be.length(6);
                $('ruby', 'ruby').should.be.length(4);

                $('figure').should.be.length(0);
                $('figure', 'ruby').should.be.length(0);
            });
        });
        describe('class selector', function(){
            it('should return correct element with the class selector', function(){
                $('.outer-class').should.be.length(2);
                $('ruby', '.outer-class').should.be.length(4);

                $('.not-exist').should.be.length(0);
                $('.not-exist', '.outer-class').should.be.length(0);
            });
        });
        describe('css selector', function(){
            it('should return correct element with css selector', function(){
                $('#outer-1 ruby').should.be.length(2);
                $('ruby i', 'ruby').should.be.length(2);

                $('ruby span').should.be.length(0);
                $('ruby span', 'ruby').should.be.length(0);
            });
        });
    });

    describe('Miscellaneous', function(){
        describe('add', function(){
            it('should add elements and return correct result', function(){
                $('#test-area').add('ruby').should.be.length(7);
                $('#outer-class').add('ruby').should.be.length(6);
            });
        });

        describe('get', function(){
            it('should get all elements without index', function(){
                $('#test-area').get().should.be.length(1).and.be.an.instanceof(Array);
            });
            it('should get the element at index', function(){
                $('#test-area').get(0).should.be.equal(document.getElementById('test-area'));
                should.not.exist($('#not-exist').get(0));
            });
        });
        describe('pluck', function(){
            it('should get all elements\'s give property', function(){
                var props = $([{prop:1},{prop:2},{prop:3}]).pluck('prop');
                props.should.be.length(3);
                props[1].should.be.equal(2);
            });
        });
        describe('each', function(){
            it('should traverse all elements', function(){
                var easyObj = $([1,2,3,4]), counter = 0;
                easyObj.each(function(item){
                    counter++;
                });
                counter.should.be.equal(4);
            });
        });
    });

    describe('Traversing', function(){
        describe('find', function(){
            it('should find elements and return correct result', function(){
                $('#test-area').find('ruby i').should.be.length(2);
                $('.outer-class').find('.inner-class').should.be.length(4);
                $('ruby').find('ruby').should.be.length(4);
                $('#outer-1').find('#inner-1').should.be.length(1);
            });
        });

        describe('children', function(){
            it('should get all children without selector', function(){
                $('ruby').children().should.be.length(6);
            });
            it('should get the matched children with selector', function(){
                $('#test-area').children('.outer-class').should.be.length(2);
                $('#test-area').children('#outer-1').should.be.length(1);
                $('ruby').children('ruby').should.be.length(4);
            });
        });

        describe('parent', function(){
            it('should get all immediate parents without selector', function(){
                $('.inner-class').parent().should.be.length(2);
            });
            it('should get the matched immediate parent with selector', function(){
                $('.inner-class').parent('#outer-1').should.be.length(1);
                $('.inner-class').parent().should.be.length(2);
            });
        });

        describe('parents', function(){
            it('should get all parents without selector', function(){
                $('.inner-class').parents().should.be.length(5);
            });
            it('should get the matched parent with selector', function(){
                $('.inner-class').parents('#test-area').should.be.length(1);
                $('.inner-class').parents('ruby').should.be.length(2);
            });
        });

        describe('first', function(){
            it('should get the first element', function(){
                $('.inner-class').first()[0].should.be.equal(document.getElementById('inner-1'));
                should.not.exist($('.non-existed').first());
                $([1,2,3]).first().should.be.equal(1);
            });
        });

        describe('last', function(){
            it('should get the last element', function(){
                $('.inner-class').last()[0].should.be.equal(document.getElementsByClassName('inner-class')[3]);
                should.not.exist($('.non-existed').last());
                $([1,2,3]).last().should.be.equal(3);
            });
        });

        describe('eq', function(){
            it('should get the item with the given index', function(){
                $('.inner-class').eq(2)[0].should.be.equal($('#outer-2 .inner-class').eq(-2)[0]);
                $('.inner-class').eq(4).should.be.length(0);
            });
        });

        describe('closest', function(){
            it('should get closest itself without selector', function(){
                $('.inner-class').closest()[0].id.should.be.equal('inner-1');
            });
            it('should get the matched closest parent with selector', function(){
                $('.inner-class').closest('ruby')[0].id.should.be.equal('inner-1');
                $('.inner-class').closest('.outer-class')[0].id.should.be.equal('outer-1');
                $('.inner-class').closest('.non-exist').should.be.length(0);
                $('.inner-class').closest('body').should.be.length(1);
                $('.inner-class').closest('body', document.getElementById('test-area')).should.be.length(0);
                $('.inner-class').closest('#test-area', document.body).should.be.length(1);
            });
        });

        describe('prev and next', function(){
            it('should get all next(prev) immediate siblings without selector', function(){
                $('#outer-2').prev().should.be.length(1);
                $('.outer-class').prev().should.be.length(1);

                $('#outer-1').next().should.be.length(1);
                $('.inner-class').next().should.be.length(2);
            });
            it('should get the matched next(prev) immediate siblings with selector', function(){
                $('.outer-class').next('.outer-class').should.be.length(1);

                $('.outer-class').prev('.outer-class').should.be.length(1);
            });
        });

        describe('siblings', function(){
            it('should get all siblings without selector', function(){
                $('.inner-class').siblings().should.be.length(4);
            });
            it('should get the matched next(prev) immediate siblings with selector', function(){
                $('.inner-class').siblings('#inner-1').should.be.length(1);
            });
        });
    });

    describe('Manipulation', function(){
        describe('addClass(removeClass)', function(){
            it('should add(remove) correct class to the elements', function(){
                $('#outer-1').addClass('a b c');
                document.getElementById('outer-1').className.should.be.equal('outer-class a b c');
                $('#outer-1').removeClass();
                document.getElementById('outer-1').className.should.be.equal('');

                $('.outer-class').addClass('outer-class a b c');
                $('.outer-class').each(function(elem){
                    elem.className.should.be.equal('outer-class a b c');
                });

                $('.outer-class').removeClass(' a b ');
                $('.outer-class').each(function(elem){
                    elem.className.should.be.equal('outer-class c');
                });
            });
        });
        describe('hasClass', function(){
            it('should return if the element has the given class name', function(){
                $('#outer-1').hasClass('a').should.be.false;
                $('#outer-1').addClass('a b c');
                $('#outer-1').hasClass('a').should.be.true;
                $('#outer-1').hasClass('b').should.be.true;
                $('#outer-1').hasClass('c').should.be.true;
                $('#outer-1').hasClass('d').should.be.false;
            });
        });
        describe('toggleClass', function(){
            it('should toggle class', function(){
                $('#outer-1').toggleClass('a')[0].className.should.be.equal('outer-class a');
                $('#outer-1').toggleClass('a b c')[0].className.should.be.equal('outer-class b c');
            });
        });
        describe('attr', function(){
            it('should get and set attribute', function(){
                $('#outer-1').attr('abc','a').attr('abc').should.be.equal('a');
                $('#outer-1').attr({'abc':'b', 'bcd':'c'}).attr('abc').should.be.equal('b');
                $('#outer-1').attr('bcd').should.be.equal('c');
                $('#checkbox').attr('checked').should.be.equal('checked');
                $('#checkbox').attr('class').should.be.equal('checkbox');
            });
        });
        describe('removeAttr', function(){
            it('should remove attribute', function(){
                $('#outer-1').attr('abc', 'a').attr('abc').should.be.equal('a');
                should.not.exist($('#outer-1').removeAttr('abc').attr('abc'));
            });
        });
        describe('prop', function(){
            it('should get and set property', function(){
                $('#checkbox').prop('checked').should.be.true;
                $('#checkbox')[0].checked = false;
                $('#checkbox').attr('checked').should.be.equal('checked');
                $('#checkbox').prop('checked').should.be.false;
                $('#checkbox').prop('class').should.be.equal('checkbox');
            });
        });
        describe('data', function(){
            it('should get and set data', function(){
                $('#checkbox').data('uniqueID', '444').attr('data-unique-id').should.be.equal('444');
                $('#checkbox').data('uniqueName', 'easy').attr('data-unique-name').should.be.equal('easy');
                $('#checkbox').data('feature', 'fast').attr('data-feature').should.be.equal('fast');
            });
        });
        describe('empty', function(){
            it('should empty the element', function(){
                $('#test-area').empty().html().should.be.equal('');
            });
        });
        describe('remove', function(){
            it('should remove the element', function(){
                document.getElementsByClassName('inner-class').should.be.length(4);
                $('.inner-class').remove();
                document.getElementsByClassName('inner-class').should.be.length(0);
            });
        });
        describe('text', function(){
            it('should get and set text content', function(){
                $('#inner-1').text().should.be.equal('hello');
                $('#inner-1 i').text('easyjs').text().should.be.equal('easyjs');
            });
        });
        describe('html', function(){
            it('should get and set html', function(){
                $('#inner-1').html('<b>easyjs</b>').html().should.be.equal('<b>easyjs</b>');
            });
            it('should get and set html with dom element', function(){
                var element = document.createElement('i');
                element.innerHTML = 'dom element';
                $('#inner-1').html(element).html().should.be.equal('<i>dom element</i>');
            });
            it('should get and set html with Easy Object', function(){
                $('#inner-1').html($('<b>aaa</b>')).html().should.be.equal('<b>aaa</b>');
            });
        });
        describe('after', function(){
            it('should append node element after the element', function(){
                var node = document.createElement('b');
                node.innerHTML = "after";
                node.id = "after";
                $('#outer-1').after(node);
                $('#outer-1').next()[0].id.should.be.equal('after');
            });
            it('should append string content after the target', function(){
                $('#outer-2').after('<ruby id="after">after</i>');
                $('#outer-2').next()[0].id.should.be.equal('after');
            });
            it('should reserve the original nodes and clone for the other', function(){
                var a = $('.inner-class');
                $('.outer-class').after(a);
                a[0].parentNode.should.be.equal(document.getElementById('test-area'));
                $('#test-area').children('ruby').should.be.length(10);
            });

        });
        describe('append', function(){
            it('should append node element', function(){
                var node = document.createElement('b');
                node.innerHTML = "append";
                $('#inner-1').append(node).html().should.be.equal('<i>hello</i><b>append</b>');
            });
            it('should append string content', function(){
                $('#inner-1').append('bbb<i>inject string content</i>').html().should.be.equal('<i>hello</i>bbb<i>inject string content</i>');
            });
            it('should reserve the original nodes and clone for the other', function(){
                var a = $('#outer-2');
                $('.inner-class').append(a);
                a[0].parentNode.should.be.equal(document.getElementById('inner-1')); 
            });

        });
        describe('appendTo', function(){
            it('should reserve the original nodes and clone for the other', function(){
                var a = $('#outer-2');
                a.appendTo('.inner-class');
                a[0].parentNode.should.be.equal(document.getElementById('inner-1')); 
                a.prev().first().text().should.be.equal('hello');
            });
        });
        describe('before', function(){
            it('should prepend node element after the element', function(){
                var node = document.createElement('b');
                node.innerHTML = "before";
                node.id = "before";
                $('#outer-1').before(node);
                $('#outer-1').prev()[0].id.should.be.equal('before');
            });
            it('should prepend string content after the target', function(){
                $('#outer-2').before('<ruby id="before">before</i>');
                $('#outer-2').prev()[0].id.should.be.equal('before');
            });
            it('should reserve the original nodes and clone for the other', function(){
                var a = $('.inner-class');
                $('.outer-class').before(a);
                a[0].parentNode.should.be.equal(document.getElementById('test-area'));
                $('#test-area').children('ruby').should.be.length(10);
            });

        });
        describe('prepend', function(){
            it('should prepend node element', function(){
                var node = document.createElement('b');
                node.innerHTML = "prepend";
                $('#inner-1').prepend(node).html().should.be.equal('<b>prepend</b><i>hello</i>');
            });
            it('should prepend string content', function(){
                $('#inner-1').prepend('abc<i>prepend string content</i>').html().should.be.equal('abc<i>prepend string content</i><i>hello</i>');
            });
        });
        describe('prependTo', function(){
            it('should reserve the original nodes and clone for the other', function(){
                var a = $('#outer-2');
                a.prependTo('.inner-class');
                a[0].parentNode.should.be.equal(document.getElementById('inner-1')); 
                a.next().first().text().should.be.equal('hello');
            });

        });
        describe('val', function(){
            it('should get and set value', function(){
                $('#checkbox').val(0).val().should.be.equal('0');
                $('#select').val().toString().should.be.equal('b,c');
            });
        });
        describe('css', function(){
            it('should get and set css property', function(){
                $('#inner-1').css('display').should.be.equal('inline');
                $('#inner-1').css('display', 'block').css('display').should.be.equal('block');
                $('#inner-1').css('display', '').css('display').should.be.equal('inline');
                $('#inner-1').css({'display': 'block', 'font-size': '12'}).css('font-size').should.be.equal('12px');
            });
        });
    });

    describe('AJAX', function(){
        describe('param', function(){
            it('should return correct serialized data', function(){
                $.param({a: {
                    one: 1,
                    two: 2,
                    three: 3
                }, b: [1,2,3]}).should.be.equal('a=%5Bobject+Object%5D&b=1&b=2&b=3');
                $.param({ ids: [1,2,3] }).should.be.equal('ids=1&ids=2&ids=3');
                $.param({ foo: 'bar', nested: { will: 'not be ignored' }}).should.be.equal('foo=bar&nested=%5Bobject+Object%5D');
            });
        });
        describe('ajax', function(){
            it('should send xhr and reveive correct value with get', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', { 
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });
            it('should send xhr and reveive correct value with get', function(done){
                $.ajax('http://api.jiepang.com/locations/show', { 
                    data: {guid: '09CDE73AE4F51084', apiver: 5},
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });
            it('should send xhr and reveive correct value with post', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', { 
                    type: 'post',
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });
            it('should send xhr and reveive correct value with post', function(done){
                $.ajax('http://api.jiepang.com/locations/show', { 
                    type: 'post',
                    data: {guid: '09CDE73AE4F51084', apiver: 5},
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });

        });
        describe('get', function(){
            it('should send xhr and reveive correct value with get', function(done){
                $.get('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
            it('should send xhr and reveive correct value with get', function(done){
                $.get('http://api.jiepang.com/locations/show', {guid: '09CDE73AE4F51084', apiver: 5}, function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
        });
        describe('post', function(){
            it('should send xhr and reveive correct value with post', function(done){
                $.post('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
            it('should send xhr and reveive correct value with post', function(done){
                $.post('http://api.jiepang.com/locations/show', {guid: '09CDE73AE4F51084', apiver: 5}, function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
        });
        describe('error', function(){
            it('should get timeout error', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', {
                    timeout: 10,
                    error: function(xhr, type, error) {
                        type.should.be.equal('timeout');
                        done();
                    }
                });
            });
            it('should get internal error', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=ddd', {
                    error: function(xhr, type, error) {
                        type.should.be.equal('Internal Error');
                        done();
                    }
                });
            });
        });
        describe('jsonp', function(){
            it('should send xhr and reveive correct value with jsonp', function(done){
                $.jsonp('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5&callback=?', {
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                    }
                }).done(function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
            it('should reveive timeout error', function(done){
                $.jsonp('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5&callback=?', {
                    timeout: 10,
                    error: function(xhr, type){
                        type.should.be.equal('timeout');
                    }
                }).fail(function(xhr, type){
                    type.should.be.equal('timeout');
                    done();
                });
            });
        });
    });

    describe('Event', function(){
        describe('bind(unbind)', function(){
            it('should bind the correct event on the elements', function(done) {
                $('#checkbox').click(function(e){
                    this.value = (+this.value)+1;
                    e.type.should.be.equal('click');
                    done();
                });
                $('#checkbox').trigger('click');
            });
        });
        describe('delegate', function(){
            it('should delegate event on the correct elements', function(done) {
                $('body').delegate('click', '#mocha', function(e){
                    e.currentTarget.should.be.equal(document.getElementById('mocha'));
                    e.type.should.be.equal('click');
                    done();
                });
                $('#mocha').trigger('click');
            });
        });
    });

    describe('Deffered', function(){
        describe('then', function(){
            it('should emit "then" when the deffered object is resolved', function(done) {
                var counter = 0, deffer = $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', {type: 'post'});
                deffer.done(function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    counter++;
                }).done(function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    counter++;
                    counter.should.be.equal(2);
                    counter.should.be.equal(2);
                    deffer.isResolved().should.be.true;
                    done();
                });
            });
            it('should emit "fail" when the deffered object is rejected', function(done) {
                var deffer = $.Deffered(function(deffered){
                    deffered.fail(function(err){
                        err.should.be.equal('error');
                        done();
                    });
                });
                deffer.reject('error');
            });
            
        });
        describe('when', function(){
            it('should emit "done" when all the deffered object is resolved', function(done) {
                var deffer = $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', {type: 'post'});
                $.when(deffer, {a: 1}).done(function(res1, res2){
                    res1.guid.should.be.equal('09CDE73AE4F51084');
                    res2.a.should.be.equal(1);
                    done();
                });
            });
            it('should emit "fail" when one of the deffered object is rejected', function(done) {
                var deffer = $.ajax('http://api.jiepang.com/locations/show?guid=ddd', {type: 'post'});
                $.when(deffer, {a: 1}).fail(function(xhr, type){
                    type.should.be.equal('Internal Error');
                    done();
                });
            });
        });
    });

    describe('Helper', function(){
        describe('isEasy', function(){
            it('should return if it\'s an Easy Object', function() {
                $.isEasy($()).should.be.true;
                $.isEasy($('body')).should.be.true;
                $.isEasy({}).should.be.false;
                $.isEasy(1).should.be.false;
            });
        });
        describe('isObject', function(){
            it('should return if it\'s an Object', function() {
                $.isObject($()).should.be.true;
                $.isObject({}).should.be.true;
                $.isObject([]).should.be.true;
                $.isObject(1).should.be.false;
            });
        });
        describe('isFunction', function(){
            it('should return if it\'s a function', function() {
                $.isFunction($()).should.be.false;
                $.isFunction(function() {}).should.be.true;
                $.isFunction({}).should.be.false;
            });
        });
        describe('isArray', function(){
            it('should return if it\'s an array', function() {
                $.isArray($()).should.be.false;
                $.isArray([]).should.be.true;
                $.isArray(arguments).should.be.false;
            });
        });
        describe('inherit', function(){
            it('should return the object which is inherited the given object', function() {
                var parent = {a:1}, obj = $.inherit(parent);
                obj.a.should.be.equal(1);
                obj.a = 2;
                obj.a.should.be.equal(2);
                parent.a.should.be.equal(1);
            });
        });
        describe('extend', function(){
            it('should return an object, which is the first object extend by the second object', function() {
                var first = {a:1}, second = {a:2,b:3}, obj = $.extend(first, second);;
                
                obj.a.should.be.equal(2);
                obj.b = 3;
            });
        });
        describe('default', function(){
            it('should return an object, which is the first object merged the second object', function() {
                var first = {a:1}, second = {a:2,b:3}, obj = $.default(first, second);;
                
                obj.a.should.be.equal(1);
                obj.b = 3;
            });
        });
        describe('merge', function(){
            it('should return an Easy Object which is merged result of the two param Easy Object', function() {
                var first = $('#inner-1').add('#outer-1'), second = $('.inner-class'), obj = $.merge(first, second);;
                
                obj.should.be.length(5);
            });
        });
        describe('escape', function(){
            it('should return the escaped string', function() {
                $.escape('<script></script>').should.be.equal('&lt;script&gt;&lt;&#x2F;script&gt;');
            });
        });
        describe('template', function(){
            it('should return the template string', function() {
                var temp = $.template('<% for(var i = 0; i < items.length; i++){%><li><%= items[i] %></li><% }%>');
                temp({items:['a','b','c']}).should.be.equal('<li>a</li><li>b</li><li>c</li>');
            });
            it('should return the escaped template string', function() {
                var temp = $.template('<% for(var i = 0; i < items.length; i++){%><li><%- items[i] %></li><% }%>');
                temp({items:['<script>a','<b>']}).should.be.equal('<li>&lt;script&gt;a</li><li>&lt;b&gt;</li>');
            });
        });
    });
};