class CommentController {
    constructor(commentView, requester, baseUrl, appId) {
        this._commentView = commentView;
        this._requester = requester;
        this._appId = appId;
        this._baseServiceUrl = baseUrl + "/appdata/" + appId + "/comments/";
    }

    showCreateCommentPage(isLoggedIn) {
        console.log("enter comment Controller");

        this._commentView.showCreateCommentPage(isLoggedIn);
    }

    // when we create a new
    createComment(requestData) { //Create new comment to the selected sales post
    // requestData is the comment itself
    if (requestData.content.length < 5) {
        showPopup('error', "Comment must consist of at least 5 characters.");
        return;
    }
        // we get the postid from the comment we created
        let postid = requestData.postid; // +++
        // we have to create several parameters
        let serviceUrl = this._baseServiceUrl;
        serviceUrl = serviceUrl.substring(0, serviceUrl.length-9); // https://baas.kinvey.com/appdata/kid_HkqgafcLG/
        let thisRequester = this._requester;
        let requestUrlPost = serviceUrl +"posts/" + postid;

    let requestUrl = this._baseServiceUrl;
    this._requester.post(requestUrl, requestData,
        function success(data) {
            showPopup('success', "You have successfully added a new comment.");
            // to return to the same post details page we do this:
            thisRequester.get(requestUrlPost,
                function success(selectedPost) {
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

        this._requester.get(this._baseServiceUrl,
            function success(data) {
                let commentList = [];
                for (let comment of data) {
                    if (comment.postid == requestData._id)  {
                        commentList.push(comment);
                    }
                }

                requestData['commentsList'] = commentList;
                
                triggerEvent('postCommentList', requestData);
            },

            function error(data) {
                showPopup('error', "Error");
            });
    }

    // this method is deleting comments and then returning to same page and show the actual displayed comments:
    deleteComment(commentId) { //Delete the selected sale post row in Kinvey
        console.log(commentId);
        if(commentId == ""){
            commentId = sessionStorage.getItem('id');
        }
        let requestUrl = this._baseServiceUrl + commentId;

        let headers = {};
        headers['Authorization'] = "Kinvey " + sessionStorage.getItem('_authToken');
        headers['Content-Type'] = "application/json";
        let requestData = {
            headers: headers
        };

        let serviceUrl = this._baseServiceUrl;
        serviceUrl = serviceUrl.substring(0, serviceUrl.length-9); // https://baas.kinvey.com/appdata/kid_HkqgafcLG/
        let thisRequester = this._requester;
        this._requester.get(this._baseServiceUrl,
            function success(data) {
                let postid = "";
                for (let comment of data) {
                    if (comment._id == commentId)  {
                        postid = comment.postid;
                    }
                }
                let requestUrlPost = serviceUrl +"posts/" + postid;///test

                thisRequester.delete(requestUrl, requestData,
                    function success(response) {
                        showPopup("success", "You have successfully deleted this comment");
                        thisRequester.get(requestUrlPost,
                            function success(selectedPost) {
                                //showPopup('success', "You have loaded this sale post just fine!");
                                triggerEvent('loadComments', selectedPost);
                            },
                            function error() {
                                showPopup('error', "Error loading this sale post!");
                            });
                    },
                    function error(response) {
                        showPopup("error", "You don't have authorization to delete this sale comment !");
                    });
            },

            function error(data) {
                showPopup('error', "Error");
            });
    }
     
}
