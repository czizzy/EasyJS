window.setupTest = function(){
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
        });
    });
};