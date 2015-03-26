define([], function () {
    'use strict';
    var apiUrl = '/rest/api/2',
        Jira = function (url, loader) {
          this.baseUrl = url;
          this.loader = loader;
        },
        load = function (url, filter) {
          return this.loader({
            url: url,
            filter: filter,
            proxy: true
          });
        },
        filterSearch,
        filterFilters;

    filterSearch = function (data) {
      return data && data.issues;
    };

    Jira.prototype.search = function (jql) {
      var endpoint = this.baseUrl + apiUrl + '/search?jql=' + encodeURIComponent(jql);
      return load.call(this, endpoint, filterSearch);
    };

    filterFilters = function (data) {
      return data && data.jql;
    };
    Jira.prototype.useFilter = function (id) {
      var endpoint = this.baseUrl + apiUrl + '/filter/' + id;
      var self = this;
      return load.call(self, endpoint, filterFilters).then(function (jql) {
        return self.search(jql);
      });
    };

    return function (url, loader) {
      return new Jira(url, loader);
    };
});