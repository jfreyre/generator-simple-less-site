'use strict';
var path = require('path');
var fs = require('fs');

module.exports = {
  appName: appName,
  processDirectory: processDirectory
};


function appName (self) {
  var counter = 0, suffix = self.options['app-suffix'];
  // Have to check this because of generator bug #386
  process.argv.forEach(function(val) {
    if (val.indexOf('--app-suffix') > -1) {
      counter++;
    }
  });
  if (counter === 0 || (typeof suffix === 'boolean' && suffix)) {
    suffix = 'App';
  }
  return suffix ? self._.classify(suffix) : '';
}

function filterFile (template) {
  // Find matches for parans
  var filterMatches = template.match(/\(([^)]+)\)/g);
  var filters = [];
  if(filterMatches) {
    filterMatches.forEach(function(filter) {
      filters.push(filter.replace('(', '').replace(')', ''));
      template = template.replace(filter, '');
    });
  }

  return { name: template, filters: filters };
}

function templateIsUsable (self, filteredFile) {
  var filters = self.config.get('filters');
  var enabledFilters = [];
  for(var key in filters) {
    if(filters[key]) enabledFilters.push(key);
  }
  var matchedFilters = self._.intersection(filteredFile.filters, enabledFilters);
  // check that all filters on file are matched
  if(filteredFile.filters.length && matchedFilters.length !== filteredFile.filters.length) {
    return false;
  }
  return true;
}

function processDirectory (self, source, destination) {
  var root = self.isPathAbsolute(source) ? source : path.join(self.sourceRoot(), source);
  var files = self.expandFiles('**', { dot: true, cwd: root });
  var dest, src;

  files.forEach(function(f) {
    var filteredFile = filterFile(f);
    if(self.name) {
      filteredFile.name = filteredFile.name.replace('name', self.name);
    }
    var name = filteredFile.name;
    var copy = false, stripped;

    src = path.join(root, f);
    dest = path.join(destination, name);

    if(path.basename(dest).indexOf('_') === 0) {
      stripped = path.basename(dest).replace(/^_/, '');
      dest = path.join(path.dirname(dest), stripped);
    }

    if(path.basename(dest).indexOf('!') === 0) {
      stripped = path.basename(dest).replace(/^!/, '');
      dest = path.join(path.dirname(dest), stripped);
      copy = true;
    }

    if(templateIsUsable(self, filteredFile)) {
      if(copy) {
        self.copy(src, dest);
      } else {
        self.template(src, dest);
      }
    }
  });
}