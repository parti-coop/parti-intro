(function ($) {
    'use strict';

    $.githubWidget = function(element, options) {
        var defaults = {
            user: '',
            widget: 'issues',
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

        var autoTitle = function(footer) {
            return '<a href="https://github.com/' + plugin.settings.user + '">'
                        + plugin.settings.user +
                    '</a> <span class="text-muted">@ GitHub</span>';
        };

        var fetchFromGithub = function() {
            var user = plugin.settings.user;

            $.ajax({
                url: 'https://api.github.com/search/issues?q=user:parti-xyz+is:open+assignee:' + user + '&sort=pushed',
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    var title = autoTitle();

                    var content = '<ul class="list-group">';

                    $.each(data.items, function(k, v) {
                        var repo_matched = v.url.match(/^https:\/\/api\.github\.com\/repos\/(.+)\/issues\/\d+$/);
                        var repo = (repo_matched === null ? '' : repo_matched[1])
                        content += '<li class="list-group-item">';
                        content += '<div class="text-muted">' + repo + ' #' + v.number +'</div>';
                        content += '<strong><a href="' + v.html_url + '">' + v.title + '</a></strong><br/>' + v.body;
                    });

                    content += '</ul>';

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
            if (plugin.settings.widget === 'issue' && plugin.settings.user !== '') {
                fetchFromGithub();
            } else if (plugin.settings.widget === 'repos') {
                fetchRepostoriesFromGithub();
            }

        }

        plugin.init();
    }

    $(function() {
        $.each($('[data-toggle="github-widget"]'), function() {
            var inputUser = $(this).data('user');
            var inputWidget = $(this).data('widget');

            var options = {};
            options.user = inputUser;
            options.widget = (inputWidget !== undefined) ? inputWidget : 'issue';
            var plugin = new $.githubWidget(this, options);
        });
    });

})(jQuery);
