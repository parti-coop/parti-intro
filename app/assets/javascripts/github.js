(function ($) {
  'use strict';

  $.githubWidget = function(element, options) {
    var defaults = {
      user: '',
      widget: 'assigned',
    }
    var plugin = this;
    plugin.settings = {};

    var $element = $(element),
    element = element;

    var fillElement = function(title, content) {
      var panel = '<div class="panel panel-default">';
      panel += '<div class="panel-heading">' + title + '</div>';
      panel += content;
      panel += '</div>';
      $element.html(panel);
    };

    var autoTitle = function() {
      return '<a href=\'' + plugin.settings.headingLink + '\' target="_blank">'
      + plugin.settings.title +
      '</a>';
    };

    var assigneeContent = function(issue) {
      if(issue.assignee) {
        return '<div class="pull-right"><img src="' + issue.assignee.avatar_url + '" style="max-width: 20px; margin-left: 5px;"> @' + issue.assignee.login + '</div>';
      }

      return '';
    };

    var issuesContent = function(issues) {
      var content = '<ul class="list-group">';

      $.each(issues, function(k, v) {
        var repo_matched = v.url.match(/^https:\/\/api\.github\.com\/repos\/(.+)\/issues\/\d+$/);
        var repo = (repo_matched === null ? '' : repo_matched[1])
        content += '<li class="list-group-item">';
        content += '<div class="text-muted clearfix">' + repo + ' #' + v.number + assigneeContent(v) + '</div>';
        content += '<strong><a href="' + v.html_url + '" target="_blank">' + v.title + '</a></strong><br/>' + v.body;
        if(v.labels) {
          $.each(v.labels, function(label_k, label_v) {
            content += '<span class="label" style="color:' + ((parseInt(label_v.color, 16) > 0xffffff/2) ? 'black':'white') + '; background-color:#' + label_v.color + '">' + label_v.name + '</span>';
          });
        }
      });

      content += '</ul>';

      return content;
    }

    var fetchAssignedFromGithub = function() {
      var user = plugin.settings.user;

      $.ajax({
        url: 'https://api.github.com/search/issues?q=user:parti-xyz+is:open+assignee:' + user + '&sort=pushed',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var title = autoTitle();
          var content = issuesContent(data.items);
          fillElement(title, content);
        }
      });
    }

    var fetchUserLabeledFromGithub = function() {
      var user = plugin.settings.user;

      $.ajax({
        url: 'https://api.github.com/search/issues?q=user:parti-xyz+is:open+label:@' + user + '&sort=pushed',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var title = autoTitle();
          var content = issuesContent(data.items.filter(function(v) {
            return (v.assignee && v.assignee.login == user) ? false : true
          }));
          fillElement(title, content);
        }
      });
    }

    var fetchLabeledFromGithub = function() {
      var label = plugin.settings.label;

      $.ajax({
        url: 'https://api.github.com/search/issues?q=user:parti-xyz+is:open+label:' + label + '&sort=pushed',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var title = autoTitle();
          var content = issuesContent(data.items);
          fillElement(title, content);
        }
      });
    }

    var fetchRepostoriesFromGithub = function() {
      var user = plugin.settings.user;

      $.ajax({
        url: 'https://api.github.com/users/parti-xyz/repos?sort=full_name&direction=asc',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          var title = autoTitle();

          var content = '<ul class="list-group">';

          content += '<li class="list-group-item list-group-item-warning">';
          content += '<div class="text-muted">Sourcing</div>'
          content += '</li>'
          $.each(data, function(k, v) {
            if(v.fork == false) {
              content += '<li class="list-group-item">';
              content += '<strong><a href="' + v.html_url + '/issues" target="_blank">' + v.name + '</a></strong> (' + v.open_issues_count + ')<br/>' + v.description;
              content += '</li>'
            }
          });

          content += '<li class="list-group-item list-group-item-warning">';
          content += '<div class="text-muted">Forked</div>'
          content += '</li>'
          $.each(data, function(k, v) {
            if(v.fork == true) {
              content += '<li class="list-group-item">';
              content += '<strong><a href="' + v.html_url + '/issues" target="_blank">' + v.name + '</a></strong> (' + v.open_issues_count + ')<br/>' + v.description;
              content += '</li>'
            }
          });

          content += '</ul>';

          fillElement(title, content);
        }
      });
}

plugin.init = function() {
  plugin.settings = $.extend({}, defaults, options);
  if (plugin.settings.widget === 'assigned' && plugin.settings.user !== '') {
    plugin.settings.headingLink = "https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+is%3Aissue+user%3Aparti-xyz+assignee%3A" + plugin.settings.user;
    fetchAssignedFromGithub();
  } else if (plugin.settings.widget === 'user-labeled' && plugin.settings.user !== '') {
    plugin.settings.headingLink = "https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+is%3Aissue+user%3Aparti-xyz+label%3A@" + plugin.settings.user;
    fetchUserLabeledFromGithub();
  } else if (plugin.settings.widget === 'labeled') {
    plugin.settings.headingLink = "https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+is%3Aissue+user%3Aparti-xyz+label%3A" + plugin.settings.label;
    fetchLabeledFromGithub();
  } else if (plugin.settings.widget === 'repositories') {
    plugin.settings.headingLink = "https://github.com/parti-xyz";
    fetchRepostoriesFromGithub();
  }

}

plugin.init();
}

$(function() {
  $.each($('[data-toggle="github-widget"]'), function() {
    var inputUser = $(this).data('user');
    var inputLabel = $(this).data('label');
    var inputWidget = $(this).data('widget');
    var inputTitle = $(this).data('title');

    var options = {};
    options.user = inputUser;
    options.label = (inputLabel !== undefined) ? inputLabel : '';
    options.widget = (inputWidget !== undefined) ? inputWidget : 'assigned';
    options.title = (inputTitle !== undefined) ? inputTitle : 'show in github...';
    var plugin = new $.githubWidget(this, options);
  });
});

})(jQuery);
