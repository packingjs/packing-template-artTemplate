var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');
var assign = require('object-assign-deep');
var clearRequire = require('clear-require');
var artTemplate = require('art-template');

module.exports = function(options) {
  options = assign({
    encoding: 'utf-8',
    extension: '.html',
    templates: '.',
    globalData: '__global.js',
    mockData: '.',
    rewriteRules: {}
  }, options);
  return function(req, res, next) {
    var urlObject = url.parse(req.url);
    var pathname = options.rewriteRules[urlObject.pathname] || urlObject.pathname;
    var templateAbsPath = path.resolve(path.join(options.templates, pathname));
    var dataAbsPath = path.resolve(path.join(options.mockData, pathname.replace(options.extension, '.js')));
    var globalDataPath = path.resolve(path.join(options.mockData, options.globalData));
    if (fs.existsSync(templateAbsPath)) {
      var tpl = fs.readFileSync(templateAbsPath, {encoding: options.encoding});
      var globalContext = {};
      if (fs.existsSync(globalDataPath)) {
        var gcontext = require(globalDataPath);
        if (util.isFunction(gcontext)) {
          globalContext = gcontext(req, res);
        } else {
          globalContext = gcontext;
        }
      }
      var pageContext = {};
      if (fs.existsSync(dataAbsPath)) {
        var pcontext = require(dataAbsPath);
        if (util.isFunction(pcontext)) {
          pageContext = pcontext(req, res);
        } else {
          pageContext = pcontext;
        }
      }
      artTemplate.config('base', options.templates);// 设置模板根目录，默认为引擎所在目录
      artTemplate.config('extname', options.extension);// 指定模板后缀名
      artTemplate.config('encoding', options.encoding);// 指定模板编码
      var output = artTemplate(pathname.replace(options.extension, ''), assign(globalContext, pageContext));
      res.end(output);
    } else {
      next();
    }
  };
};
