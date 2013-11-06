(function () {
    "use strict";

    /*jshint jquery:true browser:true */
    /*global TCGA:true chrome:true async:true */

    TCGA.loadScript({
        registerModules: false,
        scripts: ["https://cdnjs.cloudflare.com/ajax/libs/async/0.2.7/async.min.js"]
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
                    content: "<div class=\"page-header\"><h1>Databases <small>Activate third-party databases for use with the TCGA Toolbox.</small></h1><p>Author: <a href=\"mailto:gruene@uab.edu\">Alexander Grüneberg</a></p></div><p><span class=\"label label-info\">Info</span> This module will not add APIs to interact with third-party databases.</p><h2>cBio Cancer Genomics Portal: Web Service</h2><p>URI: <a href=\"http://www.cbioportal.org/public-portal/webservice.do\" target=\"_blank\">http://www.cbioportal.org/public-portal/webservice.do</a><br />Documentation: <a href=\"http://www.cbioportal.org/public-portal/web_api.jsp\" target=\"_blank\">http://www.cbioportal.org/public-portal/web_api.jsp</a></p><button class=\"btn databases-toggle\" data-database-name=\"cBio\" data-database-url=\"http://www.cbioportal.org/*\" class=\"btn\"></button>",
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
