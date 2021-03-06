import { existsSync } from 'fs';
import assign from 'object-assign-deep';
import artTemplate from 'art-template';
import { getPath, getContext } from 'packing-template-util';

module.exports = function(options) {
  options = assign({
    encoding: 'utf-8',
    extension: '.html',
    templates: '.',
    globalData: '__global.js',
    mockData: '.',
    rewriteRules: {}
  }, options);
  return async (req, res, next) => {
    const { templatePath, pageDataPath, globalDataPath, endpoint } = getPath(req, options);
    const context = await getContext(req, res, pageDataPath, globalDataPath);
    const { template, filename, basedir } = res;
    if (template) {
      try {
        res.end(artTemplate.render(template, context));
      } catch (e) {
        console.log(e);
        next();
      }
    } else if (existsSync(templatePath)) {
      try {
        artTemplate.config('base', options.templates);// 设置模板根目录，默认为引擎所在目录
        artTemplate.config('extname', options.extension);// 指定模板后缀名
        artTemplate.config('encoding', options.encoding);// 指定模板编码
        var output = artTemplate(endpoint.replace(options.extension, ''), context);
        res.end(output);
      } catch (e) {
        console.log(e);
        next();
      }
    } else {
      next();
    }
  };
};
