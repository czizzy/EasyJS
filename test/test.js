window.setupTest = function(){

    // TODO refactor test case
    describe('DOM Selector', function(){
        describe('id selector', function(){
            it('should return correct element with the id selector', function(){
                $('#test').should.be.length(1);
                $('#inner', '#test').should.be.length(1);

                $('#not-exist').should.be.length(0);
                $('#not-exist', '#test').should.be.length(0);
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
                $('#test ruby').should.be.length(2);
                $('ruby i', 'ruby').should.be.length(2);

                $('ruby span').should.be.length(0);
                $('ruby span', 'ruby').should.be.length(0);
            });
        });
    });

    describe('Miscellaneous', function(){
        describe('add', function(){
            it('shoud add elements and return correct result', function(){
                $('#test').add('ruby').should.be.length(6);
            });
        });

        describe('get', function(){
            it('shoud get all elements without index', function(){
                $('#test').get().should.be.length(1).and.be.an.instanceof(Array);
            });
            it('shoud get the element at index', function(){
                $('#test').get(0).should.be.equal(document.getElementById('test'));
                should.not.exist($('#not-exist').get(0));
            });
        });
    });

    describe('Traversing', function(){
        describe('find', function(){
            it('shoud find elements and return correct result', function(){
                $('#test').find('ruby i').should.be.length(1);
                $('.outer-class').find('.inner-class').should.be.length(4);
                $('ruby').find('ruby').should.be.length(4);
                $('#test').find('#inner').should.be.length(1);
            });
        });

        describe('children', function(){
            it('shoud get all children without selector', function(){
                $('ruby').children().should.be.length(6);
            });
            it('shoud get the matched children with selector', function(){
                $('#test').children('.inner-class').should.be.length(2);
                $('#test').children('#inner').should.be.length(1);
                $('ruby').children('ruby').should.be.length(4);
            });
        });

        describe('parent', function(){
            it('shoud get all immediate parents without selector', function(){
                $('.inner-class').parent().should.be.length(2);
            });
            it('shoud get the matched immediate parent with selector', function(){
                $('.inner-class').parent('#test').should.be.length(1);
            });
        });

        describe('parents', function(){
            it('shoud get all parents without selector', function(){
                $('.inner-class').parents().should.be.length(4);
            });
            it('shoud get the matched parent with selector', function(){
                $('.inner-class').parent('#test').should.be.length(1);
                $('.inner-class').parent('ruby').should.be.length(2);
            });
        });

        describe('closest', function(){
            it('shoud get closest itself without selector', function(){
                $('.inner-class').closest()[0].id.should.be.equal('inner');
            });
            it('shoud get the matched closest parent with selector', function(){
                $('.inner-class').closest('ruby')[0].id.should.be.equal('inner');
                $('.inner-class').closest('.outer-class')[0].id.should.be.equal('test');
                $('.inner-class').closest('.non-exist').should.be.length(0);
                $('.inner-class').closest('body').should.be.length(1);
                $('.inner-class').closest('body', document.getElementById('test')).should.be.length(0);
            });
        });

        describe('prev and next', function(){
            it('shoud get all next(prev) immediate siblings without selector', function(){
                $('#test-2').prev().should.be.length(1);
                $('.outer-class').prev().should.be.length(2);

                $('#inner-2').next().should.be.length(1);
                $('.outer-class').next().should.be.length(2);
            });
            it('shoud get the matched next(prev) immediate siblings with selector', function(){
                $('.outer-class').next('.outer-class').should.be.length(1);

                $('.outer-class').prev('.outer-class').should.be.length(1);
            });
        });

        describe('siblings', function(){
            it('shoud get all siblings without selector', function(){
                $('.inner-class').siblings().should.be.length(4);
            });
            it('shoud get the matched next(prev) immediate siblings with selector', function(){
                $('.inner-class').siblings('#inner-2').should.be.length(1);
            });
        });
    });

    describe('Manipulation', function(){
        describe('addClass(removeClass)', function(){
            it('shoud add(remove) correct class to the elements', function(){
                $('#mocha').addClass('a b c');
                document.getElementById('mocha').className.should.be.equal('a b c');
                $('#mocha').removeClass();
                document.getElementById('mocha').className.should.be.equal('');

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
            it('shoud return if the element has the given class name', function(){
                $('#mocha').removeClass();
                $('#mocha').hasClass('a').should.be.false;
                $('#mocha').addClass('a b c');
                $('#mocha').hasClass('a').should.be.true;
                $('#mocha').hasClass('b').should.be.true;
                $('#mocha').hasClass('c').should.be.true;
                $('#mocha').hasClass('d').should.be.false;
            });
        });
        describe('toggleClass', function(){
            it('shoud toggle class', function(){
                $('#mocha').removeClass();
                $('#mocha').toggleClass('a')[0].className.should.be.equal('a');
                $('#mocha').toggleClass('a b c')[0].className.should.be.equal('b c');
            });
        });
        describe('attr', function(){
            it('shoud get and set attribute', function(){
                $('#mocha').attr('abc','a').attr('abc').should.be.equal('a');
                $('#mocha').attr({'abc':'b', 'bcd':'c'}).attr('abc').should.be.equal('b');
                $('#mocha').attr('bcd').should.be.equal('c');
                $('#checkbox').attr('checked').should.be.equal('checked');
                $('#checkbox').attr('class').should.be.equal('checkbox');
            });
            it('shoud get and set property', function(){
                $('#checkbox').prop('checked').should.be.true;
                $('#checkbox')[0].checked = false;
                $('#checkbox').attr('checked').should.be.equal('checked');
                $('#checkbox').prop('checked').should.be.false;
                $('#checkbox').prop('class').should.be.equal('checkbox');
            });
        });
        describe('data', function(){
            it('shoud get and set data', function(){
                $('#checkbox').data('uniqueID', '444').attr('data-unique-id').should.be.equal('444');
                $('#checkbox').data('uniqueName', 'easy').attr('data-unique-name').should.be.equal('easy');
                $('#checkbox').data('feature', 'fast').attr('data-feature').should.be.equal('fast');
            });
        });
        describe('text', function(){
            it('shoud get and set text content', function(){
                $('#inner-2').text().should.be.equal('2');
                $('#inner-2 i').text('easyjs').text().should.be.equal('easyjs');
            });
        });
        describe('html', function(){
            it('shoud get and set html', function(){
                $('#inner-2').html('<b>easyjs</b>').html().should.be.equal('<b>easyjs</b>');
            });
            it('shoud get and set html with dom element', function(){
                var element = document.createElement('i');
                element.innerHTML = 'dom element';
                $('#inner-2').html(element).html().should.be.equal('<i>dom element</i>');
            });
            it('shoud get and set html with Easy Object', function(){
                $('#inner-2').html($('<b>aaa</b>')).html().should.be.equal('<b>aaa</b>');
            });
        });
        describe('append', function(){
            it('shoud append node element', function(){
                var node = document.createElement('b');
                node.innerHTML = "append";
                $('#inner-2').append(node).html().should.be.equal('<b>aaa</b><b>append</b>');
            });
            it('shoud append string content', function(){
                $('#inner-2').append('bbb<i>inject string content</i>').html().should.be.equal('<b>aaa</b><b>append</b>bbb<i>inject string content</i>');
            });
            it('shoud reserve the original nodes and clone for the other', function(){
                var a = $('#inner-2');
                $('.inner-class').append(a);
                a[0].parentNode.should.be.equal(document.getElementById('inner')); 
            });

        });

        describe('prepend', function(){
            it('shoud prepend node element', function(){
                var node = document.createElement('b');
                node.innerHTML = "prepend";
                $('#inner-2').prepend(node).html().should.be.equal('<b>prepend</b><b>aaa</b><b>append</b>bbb<i>inject string content</i>');
            });
            it('shoud prepend string content', function(){
                $('#inner-2').prepend('abc<i>prepend string content</i>').html().should.be.equal('abc<i>prepend string content</i><b>prepend</b><b>aaa</b><b>append</b>bbb<i>inject string content</i>');
            });
        });

        describe('val', function(){
            it('shoud get and set value', function(){
                $('#checkbox').val(0).val().should.be.equal('0');
                $('#select').val().toString().should.be.equal('b,c');
            });
        });
        describe('css', function(){
            it('shoud get and set css property', function(){
                $('#inner').css('display').should.be.equal('inline');
                $('#inner').css('display', 'block').css('display').should.be.equal('block');
                $('#inner').css('display', '').css('display').should.be.equal('inline');
                $('#inner').css({'display': 'block', 'font-size': '12'}).css('font-size').should.be.equal('12px');
            });
        });
    });

    describe('AJAX', function(){
        describe('param', function(){
            it('shoud return correct serialized data', function(){
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
            it('shoud send xhr and reveive correct value with get', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', { 
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });
            it('shoud send xhr and reveive correct value with get', function(done){
                $.ajax('http://api.jiepang.com/locations/show', { 
                    data: {guid: '09CDE73AE4F51084', apiver: 5},
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });
            it('shoud send xhr and reveive correct value with post', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', { 
                    type: 'post',
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                        done();
                    }
                });
            });
            it('shoud send xhr and reveive correct value with post', function(done){
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
            it('shoud send xhr and reveive correct value with get', function(done){
                $.get('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
            it('shoud send xhr and reveive correct value with get', function(done){
                $.get('http://api.jiepang.com/locations/show', {guid: '09CDE73AE4F51084', apiver: 5}, function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
        });
        describe('post', function(){
            it('shoud send xhr and reveive correct value with post', function(done){
                $.post('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
            it('shoud send xhr and reveive correct value with post', function(done){
                $.post('http://api.jiepang.com/locations/show', {guid: '09CDE73AE4F51084', apiver: 5}, function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
        });
        describe('error', function(){
            it('shoud get timeout error', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5', {
                    timeout: 10,
                    error: function(xhr, type, error) {
                        type.should.be.equal('timeout');
                        done();
                    }
                });
            });
            it('shoud get internal error', function(done){
                $.ajax('http://api.jiepang.com/locations/show?guid=ddd', {
                    error: function(xhr, type, error) {
                        type.should.be.equal('Internal Error');
                        done();
                    }
                });
            });
        });
        describe('jsonp', function(){
            it('shoud send xhr and reveive correct value with jsonp', function(done){
                $.jsonp('http://api.jiepang.com/locations/show?guid=09CDE73AE4F51084&apiver=5&callback=?', {
                    success: function(res){
                        res.guid.should.be.equal('09CDE73AE4F51084');
                    }
                }).done(function(res){
                    res.guid.should.be.equal('09CDE73AE4F51084');
                    done();
                });
            });
            it('shoud reveive timeout error', function(done){
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
};