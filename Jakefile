var fs = require('fs'),
    sys = require('sys');

desc('This is the default build task.');
task('default', function (params) {
    var files = new jake.FileList('src/*.js'),
        content = '',
        mainFile = 'src/easy.js',
        mainIndex = files.indexOf(mainFile);
    files.splice(mainIndex, 1);
    files.unshift(mainFile);
    content = files.map(function(file, i) {
        return fs.readFileSync(file).toString();
    }).join('\n');

    var out = fs.openSync('easy.js', 'w+');
    fs.writeSync(out, content);
    fs.closeSync(out);
    console.log('build successful');
});

task('minify', ['default'], function(params) {
    var uglify = require('uglify-js');
    var originFile = fs.readFileSync('easy.js').toString(),
        ast = uglify.parser.parse(originFile),
        out = fs.openSync('easy.min.js', 'w+');
    ast = uglify.uglify.ast_mangle(ast);
    ast = uglify.uglify.ast_squeeze(ast);
    fs.writeSync(out, uglify.uglify.gen_code(ast));
    fs.closeSync(out);
    console.log('minify successful ');
});