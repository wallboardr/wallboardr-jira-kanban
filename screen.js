define(['jquery', 'boards/data-loader', 'require', './admin', './jira-api'], function ($, dataLoader, require) {
  'use strict';
  var plugin = require('./admin'),
      Jira = require('./jira-api'),
      jiraApi,
      initApi = function (url) {
        if (!jiraApi || jiraApi.baseUrl !== url) {
          jiraApi = new Jira(url, dataLoader);
        }
      },
      addCredentials = function (url, user, pass) {
        var creds, uparts;
        if (user) {
          creds = user;
          if (pass) {
            creds = creds + ':' + pass;
          }
          uparts = url.split('://');
          if (uparts.length > 1) {
            url = uparts[0] + '://' + creds + '@' + uparts[1];
          } else {
            url = 'http://' + creds + '@' + uparts[0];
          }
        }
        return url;
      },
      getUrl = function (repo) {
        var url;
        if (repo && repo.url) {
          url = addCredentials(repo.url, repo.username, repo.password);
        }
        return url;
      },
      getCard = function (issue, data) {
        var card = {};
        card.summary = issue.fields.summary;
        if (issue.fields.assignee) {
          card.userIcon = issue.fields.assignee.avatarUrls['48x48'];
          if (card.userIcon) {
            card.userIcon = addCredentials(card.userIcon, data.username, data.password);
          }
          card.assignee = issue.fields.assignee.displayName.split(' ')[0];
        }
        return card;
      },
      addToCorrectColumn = function (issue, columns, data) {
        var ii, card = getCard(issue, data);
        for (ii = 0; ii < columns.length; ii += 1) {
          if (issue.fields.status.name === columns[ii].statuses) {
            columns[ii].cards.push(card);
            break;
          }
        }
      },
      checkLimits = function (mydata) {
        var rr, cc, imax, imin;
        for (rr = 0; rr < mydata.columns.length; rr += 1) {
          cc = mydata.columns[rr].cards.length;
          imax = parseInt(mydata.columns[rr].max, 10);
          imin = parseInt(mydata.columns[rr].min, 10);
          if (imax === imax && cc > imax) {
            mydata.columns[rr].status = 'violate-max';
            continue;
          }
          if (imin === imin && cc < imin) {
            mydata.columns[rr].status = 'violate-min';
            continue;
          }
          mydata.columns[rr].status = 'ok';
        }
      },
      getColumns = function (loader, data) {
        if (!data) {
          return;
        }
        var url = getUrl(data),
            mydata = {
              filterId: data.filterId,
              columnCount: data.columns.length,
              columns: data.columns
            };


        initApi(url);
        return jiraApi.useFilter(data.filterId).then(function (issues) {
          var rr;
          for (rr = 0; rr < mydata.columns; rr += 1) {
            mydata.columns[rr].cards = [];
          }
          for (rr = 0; rr < issues.length; rr += 1) {
            addToCorrectColumn(issues[rr], mydata.columns, data);
          }
          checkLimits(mydata);
          return mydata;
        });


        //   filterId: 1234,
        //   columns: [
        //     {
        //       status: 'violate-min',
        //       max: null,
        //       min: 5,
        //       cards: [
        //         {summary: 'This is my Jira issue', icon: '/user/icon.png'}
        //       ]
        //     },
        //     {
        //       status: 'violate-max',
        //       cards: [
        //         {summary: 'This is my Jira issue', icon: '/user/icon.png'}
        //       ]
        //     },
        //     {
        //       status: 'ok',
        //       cards: [
        //         {summary: 'This is my Jira issue', icon: '/user/icon.png'}
        //       ]
        //     },
        //   ]
      },
      jiraKanbanScreen = function () {
        var self = this;
        return {
          getViewData: function () {
            return getColumns(dataLoader, self.props.data);
          },
          preShow: function () {
            
          }
        };
      };

  jiraKanbanScreen.config = plugin.config;
  return jiraKanbanScreen;
});