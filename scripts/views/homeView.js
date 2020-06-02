class HomeView {
    // these 2 selectors correspond to the selectors we initialized in the app.js
    constructor(wrapperSelector, mainContentSelector) {
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    }

    // Pages are rendered trough templates of HTML code. Those templates are being filled with specific data, which is passed to the functions that render them
    // Guest home page is rendered when no user is logged in
    showGuestPage(sideBarData, mainData) {
        let thisClass = this; // thisClass = this and this is the HomeView class itself
  
        // when we have mainData.length == 1 - we have 1 service record in Firebase and we do not display it in real app:
        // if(mainData.length == 1 || mainData.length==0){  // we should not have such occasion mainData length to be equal to 0
        //     console.log("we display nothing");
        //     $.get('templates/welcome-guest.html', function (template) { // basically template = templates/welcome-guest.html
        //         // render the content for the home page using Mustache
        //         // In the current page we render several things – the sidebar, the recent posts links, on the sidebar and the main content (the posts which are
        //         // presented on the home page). The sidebar basically needs no data, because the recent posts are loaded trough a separate get request. That is
        //         // why we just have to pass to the wrapper selector the currently rendered wrapper.
        //         // so here we render the sidebar:
        //
        //         let renderedWrapper = Mustache.render(template, null);
        //         // we take the wrapper  selector of the current class and
        //         // using JQuery, we are replacing that particular element’s HTML with the currently rendered content
        //         $(thisClass._wrapperSelector).html(renderedWrapper);
        //
        //         // In JavaScript requests are asynchronous, that is why when 1 request is depending on the other, you must nest it inside the other, because that way you are
        //         // assuring yourself that the requests will be completed in the order you gave them.
        //         // here we render the main content of the home page, which are the blog posts
        //         $.get('templates/posts-guest.html', function (template) {
        //             let blogPosts = {
        //                 blogPosts: [] //we initialize the object as blogPosts, because the template uses that word to create a reference for Mustache
        //             };
        //
        //             let renderedPosts = Mustache.render(template, blogPosts);
        //             // we pass renderedPosts to the articles element
        //             $('.articles').html(renderedPosts);  // articles is in the welcome-guest.html
        //         });
        //         // let us render the sidebar’s recent posts. The recent posts depend on the sidebar, that is why we nest it’s rendering in the sidebar’s
        //         $.get('templates/recent-posts.html', function (template) {
        //             let recentPosts = {
        //                 recentPosts: []   // recentPosts member is assigned with the value of the sideBarData parameter passed to the showGuestPage function
        //             };
        //             // Mustache actually uses some data to render the current template. That is why we pass to it the recentPosts object we created. Mustache needs object
        //             // with the same name as it was referenced in the template -> recent-posts.html
        //             let renderedRecentPosts = Mustache.render(template, recentPosts);
        //             // here we use a one-time only selector and render the rendered recent posts to the current selector’s HTML
        //             $('.recent-posts').html(renderedRecentPosts);
        //         });
        //     });
        //
        // } else{
            // this is in regular mode of site : there is at least 2 sales on site : 1 service one and 1 real one or more real sale posts
        // get the template using jQuery:
        // get function requests a file on the local host, and passes it as a parameter to the function given as callback to that request
             $.get('templates/welcome-guest.html', function (template) { // basically template = templates/welcome-guest.html
                // render the content for the home page using Mustache
                // In the current page we render several things – the sidebar, the recent posts links, on the sidebar and the main content (the posts which are
                // presented on the home page). The sidebar basically needs no data, because the recent posts are loaded trough a separate get request. That is
                // why we just have to pass to the wrapper selector the currently rendered wrapper.
                // so here we render the sidebar:

                let renderedWrapper = Mustache.render(template, null);
                // we take the wrapper  selector of the current class and
                // using JQuery, we are replacing that particular element’s HTML with the currently rendered content
                $(thisClass._wrapperSelector).html(renderedWrapper);

                // In JavaScript requests are asynchronous, that is why when 1 request is depending on the other, you must nest it inside the other, because that way you are
                // assuring yourself that the requests will be completed in the order you gave them.
                // here we render the main content of the home page, which are the blog posts
                $.get('templates/posts-guest.html', function (template) {
                    let blogPosts = {
                        blogPosts: mainData //we initialize the object as blogPosts, because the template uses that word to create a reference for Mustache
                    };

                    let renderedPosts = Mustache.render(template, blogPosts);
                    // we pass renderedPosts to the articles element
                    $('.articles').html(renderedPosts);  // articles is in the welcome-guest.html
                });
                // let us render the sidebar’s recent posts. The recent posts depend on the sidebar, that is why we nest it’s rendering in the sidebar’s
                $.get('templates/recent-posts.html', function (template) {
                    let recentPosts = {
                        recentPosts: sideBarData   // recentPosts member is assigned with the value of the sideBarData parameter passed to the showGuestPage function
                    };
                    // Mustache actually uses some data to render the current template. That is why we pass to it the recentPosts object we created. Mustache needs object
                    // with the same name as it was referenced in the template -> recent-posts.html
                    let renderedRecentPosts = Mustache.render(template, recentPosts);
                    // here we use a one-time only selector and render the rendered recent posts to the current selector’s HTML
                    $('.recent-posts').html(renderedRecentPosts);
                });
            });
       // } // this was end of else clause, which we commented
    }
    // User home page when there is a logged in user
    showUserPage(sideBarData, mainData) {
        let _that = this;
        // old solution is commented, keep it for service purposes:
        // when we have mainData.length == 1 - we have 1 service record in Firebase and we do not display it in real app:
        // if(mainData.length == 1 || mainData.length==0){
        //     $.get('templates/welcome-user.html', function (template) {
        //         let renderedWrapper = Mustache.render(template, []);
        //
        //         $(_that._wrapperSelector).html(renderedWrapper);
        //
        //         $.get('templates/posts.html', function (template) {
        //             let blogPosts = {
        //                 blogPosts: []
        //             };
        //
        //             let renderedPosts = Mustache.render(template, blogPosts);
        //             $('.articles').html(renderedPosts); // articles is in the welcome-user.html
        //         });
        //
        //         $.get('templates/recent-posts.html', function (template) {
        //             let recentPosts = {
        //                 recentPosts: []
        //             };
        //
        //             let renderedRecentPosts = Mustache.render(template, recentPosts);
        //             $('.recent-posts').html(renderedRecentPosts);
        //         });
        //     });
        // } else{
            //  this is in regular mode of Marketplace site : there is at least 2 sales on site : 1 service one and 1 real one or more real sale posts
            $.get('templates/welcome-user.html', function (template) {
                let renderedWrapper = Mustache.render(template, sideBarData);

                $(_that._wrapperSelector).html(renderedWrapper);

                $.get('templates/posts.html', function (template) {
                    let blogPosts = {
                        blogPosts: mainData
                    };

                    let renderedPosts = Mustache.render(template, blogPosts);
                    $('.articles').html(renderedPosts); // articles is in the welcome-user.html
                });

                $.get('templates/recent-posts.html', function (template) {
                    let recentPosts = {
                        recentPosts: sideBarData
                    };

                    let renderedRecentPosts = Mustache.render(template, recentPosts);
                    $('.recent-posts').html(renderedRecentPosts);
                });
            });
       // } // end of else, which is commented

    }
}