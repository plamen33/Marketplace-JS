class PostController {
    constructor(postView, requester, baseUrl, appId) {
        this._postView = postView;
        this._requester = requester;
        this._appId = appId;
        this._baseServiceUrl = baseUrl;
    }

    showCreatePostPage(data, isLoggedIn) {  // data parameter is the current user
        this._postView.showCreatePostPage(data, isLoggedIn);
    }

    createPost(requestData) {

        if (requestData.title.length < 7) {
            showPopup('error', "Post title must consist of at least 7 symbols.");
            return;
        }

        if (requestData.content.length < 10) {
            showPopup('error', "Post content must consist of at least 10 symbols.");
            return;
        }
        if (!this.validateEmail(requestData.email)) {
            showPopup('error', "Please input valid email address");
            return;
        }

        let token = sessionStorage.getItem('_authToken');
        let requestUrl = this._baseServiceUrl + "posts.json?auth=" + token;
        // we need basic URL to pass to second function:
        let baseUrl = this._baseServiceUrl;
        // we set this like variable to pass it to second function, when we create the post:
        let thisClass = this;

        // get is taken from framework.js
        // first we have to get all the posts and find out the biggest ID number of the last post created, so that we prepare a new ID for the new post sale record
        this._requester.get(requestUrl,
            function success(data) {  // if we get the data do this: // data is the response data, which an array of posts
                let currentId = 0;
                //console.log(Object.entries(data));
                let tempArray = Object.entries(data);
                let dataArray = [];
                for (let i = 0; i < tempArray.length && i < 7; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
                    dataArray[i] = tempArray[i][0];
                }
                //console.log(dataArray);
                // sort array with ID numbers in descending order, the first one is the last one being generated - it has the biggest number:
                dataArray.sort((a, b) => {
                    return b - a;
                });
                //dataArray[0] contains the last ID number index generated for a post(sale), so then this will be the "ID" number of our new post sale:
                let idNumberIndexOfSalePost = Number(dataArray[0]) + 1;
                // console.log(`idNumberIndexOfSalePost : ${idNumberIndexOfSalePost}`);
                // now when we have the new ID number we will create a new post sale in method below:
                createPostInDB(idNumberIndexOfSalePost, token, requestData,  baseUrl, thisClass);
            },
            function error(data) { // if there is an error show this error message
                console.log("error reading posts");
                showPopup('error', "Error loading posts to identify last ID number !");
            }
        );
        // and here we finally create the new post sale in Firebase. In order to make a new record with Custom ID, and not the one which Firebase
        // generates, we have to specify the URL like this record already exists and to use a PUT call, not a POST
        // !!! THIS IS SOMETHING SPECIFIC ONLY FOR FIREBASE DB: !!!
        function  createPostInDB(idNumberIndexOfSalePost, token, requestData,  baseUrl, thisClass) {
            console.log("createPostInDB requestData : " + requestData);
            // we set the ID of the post to postId:
            requestData.postId = idNumberIndexOfSalePost;
            // we specify the URL like this record already exists in DB:
            let urlToCreateNewPostWithUniqueID =  baseUrl + "posts/"+ idNumberIndexOfSalePost +".json?auth=" + token ;

            /// !!! We use a PUT call instead of POST to create our new post sale record with a custom ID !!!
            //hew we use a PUT call instead of normally POST and this technique creates a new post with Custom ID (here we use numbers: 0, 1 ,2 ,3 ....) and not
            // with Firebase ID - this is a specific way to do it in Firebase
            thisClass._requester.put(urlToCreateNewPostWithUniqueID, requestData,
                function success(data) {  // data parameter is the current user
                    showPopup('success', "You have successfully created a new sale post.");
                    redirectUrl("#/");
                },
                function error(data) {
                    showPopup('error', "An error has occurred while attempting to create a new sale post.");
                }
            );
        }

    } // end of createPost method



    editPostPage(postId){ // Download (get) the article from Kinvey
        let thisClass = this;

        if(postId == ""){
            postId = sessionStorage.getItem('id'); // this is needed when we edit the sale from the sale post details page
        }
       
       //  console.log("===>postId:   " + postId);
        let requestUrl = this._baseServiceUrl + postId;
        this._requester.get(requestUrl,
            function success(data){
                // showPopup('info', "You have successfully loaded the selected post!");
                thisClass._postView.showEditPostPage(data);
            },
            function error() {
                showPopup('error', "Error loading this post!");
                showPopup('error', "EDIT is not available for Firebase! This functionality will be restored, after full project migration !", 10000);
            }
        );
    }
     //// the admin functionality was added, now only admins can edit everything
    editPost(requestData) { //Upload (put) the Post in Kinvey
        if (requestData.title.length < 7) {
            showPopup('error', "Post title must consist of at least 7 symbols.");
            return;
        }

        if (requestData.content.length < 10) {
            showPopup('error', "Post content must consist of at least 10 symbols.");
            return;
        }

        if (!this.validateEmail(requestData.email)) {
            showPopup('error', "Please input valid email address");
            return;
        }


        let requestUrl = this._baseServiceUrl + requestData._id;
        
        let postTitle = requestData.title;
        let postText = requestData.content;
        let postAuthor = requestData.author;
        let date = requestData.date;
        let tagName = requestData.tag;
        let authorUsername = requestData.authUsername;
        let email = requestData.email;
        let phone = requestData.phone;
        let imageLink = requestData.image;
        let price = requestData.price;
        let views = requestData.views;
        let authToken = requestData.authToken;  // this is only needed if we use a standard PUT request

        let request = {
            title: postTitle,
            content: postText,
            author: postAuthor,
            date: date,
            tag: tagName,
            email: email,
            phone: phone,
            image: imageLink,
            price: price,
            views: views,
            auth_username: authorUsername
        };
        let id = requestData._id;
        this._requester.put(requestUrl, request,
            function success() {
                redirectUrl("#/post/{{"+ id +"}}");
                //redirectUrl("#/");
                showPopup("success", "You have successfully edited this sale post.");
            },
            function error() {
                showPopup("error", "You don't have authorization to edit this sale post.");
            });
    }

    // we are redirected here from app.js:
    deletePost(postId, postAuthor) { //Delete the selected sale post row in Kinvey

        // TODO : // consider project deployment to Github with what we have, make backups, continue development in Github folder
        // clear unwanted debug comments, clear code, put error message for EDIT,
        // fix Edit
        // last fix EDIT for author and admin

        let loggedUserUsername = sessionStorage.getItem('username');
        // console.log(postAuthor);
        // console.log(loggedUserUsername);
        // console.log("postId : " + postId);

        if(postAuthor == loggedUserUsername || loggedUserUsername == "admin@admin.com"){
            // if(postId == ""){
            //     postId = sessionStorage.getItem('id');
            // }
            let token = sessionStorage.getItem('_authToken');
            let deleteRequestUrl = this._baseServiceUrl + "posts/"+ postId +".json?auth=" + token;
            let getPostsRequestUrl = this._baseServiceUrl + "posts.json?auth=" + token;

            let requester = this._requester;

            // first we delete the post:
            this._requester.delete(deleteRequestUrl, null,
                function success(response) {
                    showPopup("success", "You have successfully deleted this post sale");
                    requester.get(getPostsRequestUrl,
                        function success(posts) {
                            showPopup("success", "You have successfully get posts");
                            //console.log(posts);
                            //this will be the new posts array:
                            let newPostArray = [];
                            // this variable will contain the modified post array and the last_comment_id inside the sale post record in Firebase
                            // when we removed the last comment the postsArray will be undefined, so we check for that state:

                            // actually we will never be able to delete first post sale as current logic in DB does not let to open it unless
                            // you put correct data in it in DB mandatory are creation_date and comments array for this post sale to open in details view
                            // so an option for it to be deleted, but we may let it be like this to use it, as prevent from being deleted, so that it won't break site work
                            if(posts == null) {
                                // we have to create one post sale record to ensure the site works and will open, so we create this first sale post
                                // which is used for service purposes and won't be displayed. According to current logic mandatory fields for the
                                // post sale are creation_date to display the first page with post sale list, for post details - creation_date and comments array
                                newPostArray = [{ creation_date : "2020-05-27T07:27:33.212Z", postId: 0 }]
                            } else {
                                //in this case there are still comments in our array, at least one comment is present:
                                //this will be the index of the new comment array:
                                let index = 0;
                                //here we foreach the old comment array:
                                posts.forEach(function(item){
                                    //we will have null on the place where the deleted comment was placed, so we just skip such meeting:
                                    if(item == null){
                                        // we have null items in place where was the removed comment object
                                    } else{
                                        // set a newComment variable
                                        let newPost = item;
                                        //console.log(newComment);
                                        // set the new index of our new comment inside the comment object:
                                        newPost.postId = index;
                                        // put it to a newCommentArray:
                                        newPostArray.push(newPost);
                                        // increase the index for next turn:
                                        index++;
                                    }
                                });
                                // now here we prepare the object, which we will update inside the post, the new comment and last_comment_id (it will be decreased with one):
                                // the comments array will be automatically updated in Firebase with indexes: 0,1,2,3, etc. for each comment inside the post sale record:
                                console.log(newPostArray);
                            }

                            // to update all posts in Firebase what we do is we make a PUT call to posts.json URL with the newPostArray and it updates all the posts
                            // with new indexes array we created:
                            requester.put(getPostsRequestUrl, newPostArray,
                                function success(data) {  // data parameter is the current user
                                    showPopup("success", "You have successfully deleted the sale");
                                    redirectUrl("#/home")
                                },
                                function error(data) {
                                    showPopup('error', "An error has occurred while attempting to update all comments for this post");
                                    console.log("An error has occurred while attempting to update all comments for this post");
                                }
                            );

                        },
                        function error(errorResponse) {
                            showPopup("error", "Posts we not get ! some problem !");
                        }
                    );

                },
                function error(response) {
                    showPopup("error", "You don't have authorization to delete this post sale!");
                }
            );



            // the old Kinvey implementation:
            // let requestUrl = this._baseServiceUrl + postId;
            //
            // let headers = {};
            // headers['Authorization'] = "Kinvey " + sessionStorage.getItem('_authToken');
            // headers['Content-Type'] = "application/json";
            // let requestData = {
            //     headers: headers
            // };
            // //console.log(requestData);
            // let serviceUrl = this._baseServiceUrl;
            // let servUrl = this._baseServiceUrl;
            // let requester = this._requester;
            // this._requester.delete(requestUrl, requestData,
            //     function success(response) {
            //
            //         //// deleting all of the post comments
            //         serviceUrl = serviceUrl.substring(0, serviceUrl.length-6) + "comments/";
            //         // console.log(serviceUrl);
            //
            //         requester.get(serviceUrl,
            //             function success(data) {
            //                // console.log(data);
            //
            //                 for (let comment of data) {
            //                     if (comment.postid == postId)  {
            //                         // console.log(comment);
            //                         let sUrl = serviceUrl + comment._id;
            //                         ///// we show the sale post details page with actual views number:
            //                         let urn =servUrl.substring(0, 46) + "forviews";
            //                         /////
            //
            //                         let headersOne = {"Authorization": "Basic " + "dXNlcjpWaWV3Q291bnRlcg==", "Content-type": "application/json"};
            //
            //                         $.ajax({
            //                             method: "GET",
            //                             url: urn,
            //                             headers: headersOne,
            //                             success: loadSuccessData,
            //                             error: handleAjaxErrorOne
            //                         });
            //                         function loadSuccessData(data){
            //                             showPopup("success", "READ DATA FINE");
            //                             let lnx = data[0].data;
            //                             // console.log(lnx);
            //                             // let lnx = "b6fa458b-b053-40b5-ac81-c0961549a9b3.94r4l2h3jkM/SybhTwM3O1piOvMlhMyTeBjvxu+bLeU=";
            //                             let headers = { "Authorization": "Kinvey " + lnx };
            //
            //                             $.ajax({
            //                                 method: 'DELETE',
            //                                 url: sUrl,
            //                                 headers: headers,
            //                                 data: comment,
            //                                 success: loadViewSuccess,
            //                                 error: handleAjaxError
            //                             });
            //                             function loadViewSuccess(request){
            //                                 console.log("deleted successfully comment with id: " + comment._id);
            //                                 // showPopup("success", "sale post view increased with 1");
            //                             }
            //                             function handleAjaxError(response) {
            //                                 console.log("error while deleting a comment");
            //                                 // showPopup("error", "Cannot increase the view counter");
            //                             }
            //                         }
            //                         function handleAjaxErrorOne(response) {
            //                             showPopup("error", "I cannot read from DB while trying to get admin rights in order to delete comments from a deleted post.");
            //                         }
            //                     }
            //                 }
            //
            //             },
            //
            //             function error(data) {
            //                 showPopup('error', "Error");
            //             });
            //
            //         showPopup("success", "You have successfully deleted this sale");
            //         redirectUrl("#/home")
            //     },
            //     function error(response) {
            //         showPopup("error", "You don't have authorization to delete this sale post !");
            //     });
        } else{
            showPopup("warning", "You are not authorized to delete this sale record !");
        }
    }

    goHome(){
        redirectUrl("#/")
    }
    
    getPost() {   // needed when we display the sale post details
        console.log("test")
        let postid = sessionStorage.getItem('id');
        let token =  sessionStorage.getItem('getToken');
        let requestUrl = this._baseServiceUrl + "posts/"+ postid +".json?auth=" + token;
        // console.log(requestUrl);
        // console.log("postid is " + postid);
        // console.log("requestUrl is " + requestUrl);
        this._requester.get(requestUrl,
            function success(selectedPost) {
                console.log("Successfully get selected post sale: " + selectedPost)
                //showPopup('success', "You have loaded this sale post just fine!");
                triggerEvent('loadComments', selectedPost);
            },
            function error() {
                showPopup('error', "Error loading this sale post!");
            });
    }



    showPostDetails(requestDataPost, isLoggedIn) { // needed when we display the sale post details
        // requestDataPost - is the post itself
        //this._postView.showPostDetails(requestDataPost);  // by showing this sale will show the previous views number

        let token =  sessionStorage.getItem('getToken');
        let requestUrl = this._baseServiceUrl + "posts/"+ requestDataPost.postId +".json?auth=" + token;
        let postTitle = requestDataPost.title;
        let postText = requestDataPost.content;
        let postAuthor = requestDataPost.author;
        let date = requestDataPost.date;
        let tagName = requestDataPost.tag;
        let authorUsername = requestDataPost.auth_username;
        let email = requestDataPost.email;
        let phone = requestDataPost.phone;
        let imageLink = requestDataPost.image;
        let price = requestDataPost.price;
        let views = Number(requestDataPost.views) + 1; // increase the view counter
        //let authToken = requestDataPost.authToken;  // this is only needed if we use a standard PUT request
        let commentsArray = requestDataPost.comments;
        let lastCommentId = requestDataPost.last_comment_id;
        let postId = requestDataPost.postId;

        //sessionStorage.setItem('commentId', lastCommentId);

        let request = {
            title: postTitle,
            content: postText,
            author: postAuthor,
            auth_username: authorUsername,
            date: date,
            tag: tagName,
            email: email,
            phone: phone,
            image: imageLink,
            price: price,
            views: views,
            comments: commentsArray,
            postId: postId,
            last_comment_id: lastCommentId
        };
        
        // this is not needed anymore:
        //request['commentsList'] = commentsArray;
        //console.log(commentsArray);

        this._postView.showPostDetails(request, isLoggedIn);
        // restored until here:

        // update the views number of the post:
        let changeInPostSaleViews = {
            views: views
        };
        this._requester.patch(requestUrl, changeInPostSaleViews,
            function success(data) {
                console.log("able to update views in post sale");
                console.log(data)
            },
            function error() {
                showPopup('error', "Error loading this sale post! Cannot update its view counter");
                console.log("Error loading this sale post! Cannot update its view counter")
            }
        );
        
    }
    showPostDetailsEdit(requestDataPost, isLoggedIn) { // needed when we display the sale post details
        // requestDataPost - is the post itself
        //this._postView.showPostDetails(requestDataPost);  // by showing this sale will show the previous views number

        let requestUrl = this._baseServiceUrl + requestDataPost.postId;
        let postTitle = requestDataPost.title;
        let postText = requestDataPost.content;
        let postAuthor = requestDataPost.author;
        let date = requestDataPost.date;
        let tagName = requestDataPost.tag;
        let authorUsername = requestDataPost.auth_username;
        let email = requestDataPost.email;
        let phone = requestDataPost.phone;
        let imageLink = requestDataPost.image;
        let price = requestDataPost.price;
        let views = Number(requestDataPost.views);
        let authToken = requestDataPost.authToken;  // this is only needed if we use a standard PUT request
        let commentsArray = requestDataPost['commentsList'];

        let request = {
            title: postTitle,
            content: postText,
            author: postAuthor,
            auth_username: authorUsername,
            date: date,
            tag: tagName,
            email: email,
            phone: phone,
            image: imageLink,
            price: price,
            views: views
        };
        request['commentsList'] = commentsArray;

        this._postView.showPostDetails(requestDataPost, isLoggedIn);

        ///// we show the sale post details page with actual views number:
        let urn = this._baseServiceUrl.substring(0, 46) + "forviews";
        /////

        let headersOne = {"Authorization": "Basic " + "dXNlcjpWaWV3Q291bnRlcg==", "Content-type": "application/json"};

        $.ajax({
            method: "GET",
            url: urn,
            headers: headersOne,
            success: loadSuccessData,
            error: handleAjaxErrorOne
        });
        function loadSuccessData(data){
            // showPopup("success", "READ DATA FINE");
            let lnx = data[0].data;
            let headers = { "Authorization": "Kinvey " + lnx };

            $.ajax({
                method: 'PUT',
                url: requestUrl,
                headers: headers,
                data: request,
                success: loadViewSuccess,
                error: handleAjaxError
            });
            function loadViewSuccess(request){
                // showPopup("success", "sale post view increased with 1");
            }
            function handleAjaxError(response) {
                // showPopup("error", "Cannot increase the view counter");
            }
        }
        function handleAjaxErrorOne(response) {
            showPopup("error", "I cannot read from DB, while opening sale post details page");
        }
    }
    
    sortPostByTag(tagName, isLoggedIn) { //Sort The article by Tag Name
        let token = "";
        if(isLoggedIn){
            token = sessionStorage.getItem('_authToken');
        } else{
            token = sessionStorage.getItem('getToken');
        }
        let _that = this;
        let postByTag = [];
        let requestUrl = this._baseServiceUrl + "posts.json?auth=" + token;
        let sportTag = tagName;
        this._requester.get(requestUrl,
            function success(data) {
                data.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1.creation_date);
                    let date2 = new Date(elem2.creation_date);
                    return date2 - date1;
                });

                for (let i = 0; i < data.length; i++) {
                    if (data[i].tag == sportTag) {
                        // to eliminate for sure the service post sale record, with index 0:
                        if(i != data.length-1){
                            postByTag.push(data[i]);
                        }
                    }
                }

                _that._postView.showSortedPost(postByTag, isLoggedIn);
            },
            function error() {
                showPopup('error', "Error loading posts!");
            }
        );
    }

    validateEmail(email) {
        let filter = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        // more simple email validation: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!filter.test(email)) {
            return false;
        } else{
            return true;
        }
    }
    

}// end of class PostController

