class CommentController {
    constructor(commentView, requester, baseUrl, appId) {
        this._commentView = commentView;
        this._requester = requester;
        this._appId = appId;
        this._baseServiceUrl = baseUrl;
    }

    showCreateCommentPage(isLoggedIn) {
        console.log("enter showCreateCommentPage method of CommentController");
        console.log("here we will get the actual comment ID from Firebase: ");
        // we get the postid from the comment we created
        let postId = sessionStorage.getItem('id');
        let token =  sessionStorage.getItem('_authToken');
        // URL to get the latest state of post sale:
        let requestUrlPost = this._baseServiceUrl +"posts/" + postId +".json?auth=" + token;

        // we have to define the commentView to run it under internal function:
        let commentView = this._commentView;
        this._requester.get(requestUrlPost,
            function success(selectedPost) {
                //showPopup('success', "Get the comment ID just fine");
                commentView.showCreateCommentPage(isLoggedIn, selectedPost.last_comment_id);
            },
            function error() {
                console.log("Error while getting last comment ID, redirection to home.")
                showPopup('error', "Error getting last comment ID !");
                redirectUrl("#/home");
            });


    }

    // when we create a new
    createComment(requestData) { //Create new comment to the selected sales post
    // requestData is the comment itself
    if (requestData.comment_content.length < 5) {
        showPopup('error', "Comment must consist of at least 5 characters.");
        return;
    }
        // we get the postid from the comment we created
        let postId = requestData.postid; // +++
        // we have to create several parameters
        let serviceUrl = this._baseServiceUrl;

        // this was done for Kinvey:
        //serviceUrl = serviceUrl.substring(0, serviceUrl.length-9); // https://baas.kinvey.com/appdata/kid_HkqgafcLG/

        let thisRequester = this._requester;

        let token =  sessionStorage.getItem('_authToken'); // be careful with this token
        // URL to get the latest state of post sale:
        let requestUrlPost = serviceUrl +"posts/" + postId +".json?auth=" + token;

        // we prepare the comment URL like it is already created - this is a Firebase technique to create new record with custom ID:
        let requestUrl = this._baseServiceUrl + "posts/" + postId +"/comments/"+ requestData.comment_id +".json?auth=" + token;

        let requestUrlToUpdateLastCommentId = this._baseServiceUrl + "posts/" + postId  +".json?auth=" + token;
        //we remove this data from the comment object, as we do not need to put it in DB:
        delete requestData.postid;
        // we do a PUT call instead of doing normally a POST - but this is for Firebase only:
        // here we create the comment inside the SALE Post:
    this._requester.put(requestUrl, requestData,
        function success(data) {
            showPopup('success', "You have successfully added a new comment.");
            // to return to the same post details page we do this:

            // we need to define this in order to make one more internal call to Firebase DB to update last comment ID:
            let internalRequester = thisRequester;

            // so here we get the latest post sale data, now with new comment, which we just created:
            thisRequester.get(requestUrlPost,
                function success(selectedPost) {

                    //here we need to update last_comment_id in Firebase DB:

                    let lastCommentIdData = {
                        last_comment_id: selectedPost.last_comment_id+1
                    };
                    //sessionStorage.setItem('commentId', selectedPost.last_comment_id+1);
                    //console.log(sessionStorage.getItem('commentId'));
                    console.log(lastCommentIdData);
                    internalRequester.patch(requestUrlToUpdateLastCommentId, lastCommentIdData,
                        function success(data) {  // data parameter is the current user
                            showPopup('success', "You have successfully Updated last_COMMENT ID.");
                        },
                        function error(data) {
                            showPopup('error', "An error has occurred while attempting to update last comment ID in DB.");
                        }
                    );
                    
                    //showPopup('success', "You have loaded this sale post just fine!");
                    triggerEvent('loadComments', selectedPost);
                },
                function error() {
                    showPopup('error', "Error loading this sale post!");
                });
            // redirectUrl("#/home");
        },
        function error(data) {
            showPopup('error', "An error has occurred while attempting to create a comment.");
        });
    }// end of createComment method

    loadComments(requestData) { //Load comments using post Id from Kinvey
        // requestData is the post (sale) object
        console.log(requestData.comments);
        triggerEvent('postCommentList', requestData);
        
        // this all is not needed now:
        // let token =  sessionStorage.getItem('getToken');
        // let requestUrl = this._baseServiceUrl + "comments.json?auth=" + token;
        // this._requester.get(requestUrl,
        //     function success(data) {
        //         console.log(Object.entries(data));
        //         let tempArray = Object.entries(data);
        //         //dataArray will contain all our comment objects:
        //         let dataArray = [];
        //         for (let i = 0; i < tempArray.length && i < 7; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
        //             dataArray[i] = tempArray[i][1];
        //         }
        //         let commentList = [];
        //
        //         for (let comment of dataArray) {
        //             if (comment.postid == requestData._id)  {
        //                 commentList.push(comment);
        //             }
        //         }
        //       
        //         requestData['commentsList'] = commentList;
        //        
        //         triggerEvent('postCommentList', requestData);
        //     },
        //
        //     function error(data) {
        //         showPopup('error', "Error");
        //     });
    }

    // this method is deleting comments and then returning to same page and show the actual displayed comments:
    deleteComment(commentId, postId, commentAuthor) { // Delete the selected sale post row in Firebase
        // if(commentId == ""){
        //     commentId = sessionStorage.getItem('id');
        // }
        let loggedUserUsername = sessionStorage.getItem('username');
        // console.log(postAuthor);
        // console.log(loggedUserUsername);
        // console.log("postId : " + postId);
        // console.log("comment ID: " + commentId);

        if(commentAuthor == loggedUserUsername || loggedUserUsername == "admin@admin.com"){
            let token = sessionStorage.getItem('_authToken');
            let requestUrl = this._baseServiceUrl + "posts/" + postId + "/comments/" + commentId + ".json?auth=" + token;
            let requestUrlToGetBackPost = this._baseServiceUrl + "posts/"+ postId +".json?auth=" + token;
            // basically this is the same URL, as above:
            let updatePostURL = this._baseServiceUrl + "posts/"+ postId +".json?auth=" + token;
            let thisRequester = this._requester;
            //console.log(requestUrl);
            // first we delete the comment from the sale post:
            this._requester.delete(requestUrl, null,
                function success(response) {
                    showPopup("success", "You have successfully deleted this comment");
                    // here we have to reload all comments
                    let thisInternalRequestor = thisRequester;
                    // now we get back the post sale data, in which the comment is deleted now:
                    thisRequester.get(requestUrlToGetBackPost,
                        function success(selectedPost) {

                            // rearrange all comments in an array assign all new ids to each comment
                            // prepare the new lastCommentID:
                            // we have the post, the comments are inside:
                            // let's get all the comments in an array:
                            let commentsArray = selectedPost.comments;
                            console.log("old Comments array: " + commentsArray);
                            //this will be the new comments array:
                            let newCommentArray = [];
                            // this variable will contain the modified comment array and the last_comment_id inside the sale post record in Firebase
                            let newCommentsData = "";
                            // when we removed the last comment the commentsArray will be undefined, so we check for that state:
                            if(typeof commentsArray == "undefined") {
                                // in this occasion we set comments to be array with zero string - '0' and we set the last_comment_id to be 0:
                                newCommentsData = {
                                    comments: ['0'],
                                    last_comment_id: selectedPost.last_comment_id - 1
                                };
                            } else{
                                //in this case there are still comments in our array, at least one comment is present:
                                //this will be the index of the new comment array:
                                let index = 0;
                                //here we foreach the old comment array:
                                commentsArray.forEach(function(item){
                                    //we will have null on the place where the deleted comment was placed, so we just skip such meeting:
                                    if(item == null){
                                        // we have null items in place where was the removed comment object
                                    } else{
                                        // set a newComment variable
                                        let newComment = item;
                                        //console.log(newComment);
                                        // set the new index of our new comment inside the comment object:
                                        newComment.comment_id = index;
                                        // put it to a newCommentArray:
                                        newCommentArray.push(newComment);
                                        // increase the index for next turn:
                                        index++;
                                    }
                                });
                                // now here we prepare the object, which we will update inside the post, the new comment and last_comment_id (it will be decreased with one):
                                // the comments array will be automatically updated in Firebase with indexes: 0,1,2,3, etc. for each comment inside the post sale record:
                                newCommentsData = {
                                    comments: newCommentArray,
                                    last_comment_id: selectedPost.last_comment_id - 1
                                };
                            }

                            console.log(newCommentArray);

                            // now we make patch request to update partially the post sale data - to update it with new comments array and new last_comment_id:
                            thisInternalRequestor.patch(updatePostURL, newCommentsData,
                                function success(data) {  // data parameter is the current user
                                    //showPopup('success', "You have successfully updated all comments for this post.");
                                    console.log("DEBUG: successfully updated all comments for this post, during delete comment action on Marketplace.")
                                    // finally here we get the latest version of post sale object which we will display after the comment was deleted and comments data
                                    // was rearranged inside the post to ensure correct work of whole affected Marketplace site components:
                                    thisRequester.get(requestUrlToGetBackPost,
                                        function success(latestPost) {
                                            //showPopup('success', "You have loaded this sale post just fine!");
                                            console.log("Sale post was loaded successfully !");
                                            // and now we trigger the loadComments method to display the whole thing, at this place we go out of this method:
                                            triggerEvent('loadComments', latestPost);
                                        },
                                        function error(){
                                            showPopup('error', "Error loading this sale post!");
                                        }
                                    );
                                },
                                function error(data) {
                                    showPopup('error', "An error has occurred while attempting to update all comments for this post");
                                }
                            );

                        },
                        function error() {
                            showPopup('error', "Error loading this sale post!");
                        });
                },
                function error(response) {
                    showPopup("error", "You don't have authorization to delete this sale comment !");
                }
            );


            // old Kinvey code left for information purposes:
            // let headers = {};
            // headers['Authorization'] = "Kinvey " + sessionStorage.getItem('_authToken');
            // headers['Content-Type'] = "application/json";
            // let requestData = {
            //     headers: headers
            // };
            //
            // let serviceUrl = this._baseServiceUrl;
            // serviceUrl = serviceUrl.substring(0, serviceUrl.length-9); // https://baas.kinvey.com/appdata/kid_HkqgafcLG/
            // let thisRequester = this._requester;
            // this._requester.get(this._baseServiceUrl,
            //     function success(data) {
            //         let postid = "";
            //         for (let comment of data) {
            //             if (comment._id == commentId)  {
            //                 postid = comment.postid;
            //             }
            //         }
            //         let requestUrlPost = serviceUrl +"posts/" + postid;///test
            //
            //         thisRequester.delete(requestUrl, requestData,
            //             function success(response) {
            //                 showPopup("success", "You have successfully deleted this comment");
            //                 thisRequester.get(requestUrlPost,
            //                     function success(selectedPost) {
            //                         //showPopup('success', "You have loaded this sale post just fine!");
            //                         triggerEvent('loadComments', selectedPost);
            //                     },
            //                     function error() {
            //                         showPopup('error', "Error loading this sale post!");
            //                     });
            //             },
            //             function error(response) {
            //                 showPopup("error", "You don't have authorization to delete this sale comment !");
            //             });
            //     },
            //
            //     function error(data) {
            //         showPopup('error', "Error");
            //     });
        } else{
            showPopup("error", "You don't have authorization to delete this sale comment !");
        }


    }
     
}
