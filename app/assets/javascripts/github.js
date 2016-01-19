(function ($) {
    'use strict';

    $.githubWidget = function(element, options) {
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
                    var total = 0;

                    $.each(data.items, function(k, v) {
                        var repo_matched = v.url.match(/^https:\/\/api\.github\.com\/repos\/(.+)\/issues\/\d+$/);
                        var repo = (repo_matched === null ? '' : repo_matched[1])
                        content += '<li class="list-group-item">';
                        content += '<div class="text-muted">' + repo + ' #' + v.number +'</div>';
                        content += '<strong><a href="' + v.html_url + '">' + v.title + '</a></strong><br/>' + v.body;

                        total++;
                    });

                    content += '</ul>';

                    fillElement(title, content);
                }
            });
        }

        plugin.init = function() {
            plugin.settings = $.extend({}, options);
            fetchFromGithub();
        }

        plugin.init();
    }

    // GITHUB WIDGET PLUGIN DEFINITION
    // ===============================

    $.fn.githubWidget = function(options) {
        return this.each(function() {
            var plugin = new $.githubWidget(this, options);
        });
    }

    $(function() {
        $.each($('[data-toggle="github-widget"]'), function() {
            var inputUser = $(this).data('user');
            if (inputUser !== undefined) {
                var options = {};
                options.user = inputUser;
                var plugin = new $.githubWidget(this, options);
            }
        });
    });

})(jQuery);
