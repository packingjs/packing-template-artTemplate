var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');
var assign = require('object-assign');
var clearRequire = require('clear-require');
var artTemplate = require('art-template');

module.exports = function(options) {
  options = assign({
    encoding: 'utf-8',
    extension: '.html',
    templates: '.',
    mockData: '.',
    rewriteRules: {}
  }, options);
  return function(req, res, next) {
    var urlObject = url.parse(req.url);
    var pathname = options.rewriteRules[urlObject.pathname] || urlObject.pathname;
    var templateAbsPath = path.resolve(path.join(options.templates, pathname));
    var dataAbsPath = path.resolve(path.join(options.mockData, pathname.replace(options.extension, '.js')));
    if (fs.existsSync(templateAbsPath)) {
      var tpl = fs.readFileSync(templateAbsPath, {encoding: options.encoding});
      var context = {};
      if (fs.existsSync(dataAbsPath)) {
        try {
          var contextExport = require(dataAbsPath);
          if (util.isFunction(contextExport)) {
            context = contextExport(req, res);
          } else {
            context = contextExport;
          }
        }
        catch (e) {
          console.log('File "' + dataAbsPath + ' require failed.\n' + e);
        }
      }
      artTemplate.config('base', options.templates);// 设置模板根目录，默认为引擎所在目录
      artTemplate.config('extname', options.extension);// 指定模板后缀名
      artTemplate.config('encoding', options.encoding);// 指定模板编码
      var output = artTemplate(pathname.replace(options.extension, ''), context);
      res.end(output);
    } else {
      next();
    }
  };
};
