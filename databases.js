(function () {
    "use strict";

    /*jshint jquery:true browser:true */
    /*global TCGA:true chrome:true async:true */

    TCGA.loadScript({
        registerModules: false,
        scripts: ["https://raw.github.com/caolan/async/master/dist/async.min.js"]
    }, function () {

        var databases;

     // Check the state of supported databases.
        databases = {};
        chrome.permissions.getAll(function (permissions) {
            var origins;
         // Skip the non-optional origin.
            origins = permissions.origins.slice(1);
            async.map(origins, function (origin, callback) {
                chrome.permissions.contains({
                    origins: [origin]
                }, function (result) {
                    databases[origin] = result;
                    callback();
                });
            }, function () {

             // Register tab.
                TCGA.ui.registerTab({
                    id: "databases",
                    title: "Databases",
                    content: "<div class=\"page-header\"><h1>Databases <small>Activate third-party databases for use with the TCGA Toolbox.</small></h1></div><p><span class=\"label label-info\">Info</span> This module will not add APIs to interact with third-party databases.</p><h2>cBio Cancer Genomics Portal</h2><p>cBio Cancer Genomics Portal provides visualization, analysis and download of large-scale cancer genomics data sets.</p><button class=\"btn databases-toggle\" data-database-name=\"cBio\" data-database-url=\"http://www.cbioportal.org/*\" class=\"btn\"></button>",
                    switchTab: true
                }, function (err, el) {

                 // Update state of buttons.
                    $(".databases-toggle", el).each(function (i, button) {
                        var database;
                        database = button.dataset.databaseUrl;
                        if (databases[database] === true) {
                            button.innerText = "Deactivate " + button.dataset.databaseName;
                        } else {
                            button.innerText = "Activate " + button.dataset.databaseName;
                        }
                    });

                    $(".databases-toggle", el).click(function (ev) {
                        var button, database;
                        button = ev.target;
                        database = button.dataset.databaseUrl;
                        if (databases[database] === true) {
                            chrome.permissions.remove({
                                origins: [database]
                            }, function (removed) {
                                if (removed === true) {
                                    databases[database] = false;
                                    button.innerText = "Activate " + button.dataset.databaseName;
                                } else {
                                    console.error("Origin was not removed.");
                                }
                            });
                        } else {
                            chrome.permissions.request({
                                origins: [database]
                            }, function (granted) {
                                if (granted === true) {
                                    databases[database] = true;
                                    button.innerText = "Deactivate " + button.dataset.databaseName;
                                } else {
                                    console.error("Origin was not granted.");
                                }
                            });
                        }
                    });

                });

            });
        });

    });

}());
