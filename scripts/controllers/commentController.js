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

    createComment(requestData) { //Create new comment to the selected article
        if (requestData.content.length < 5) {
            showPopup('error', "Comment must consist of at least 5 characters.");
            return;
        }

        let requestUrl = this._baseServiceUrl;
        this._requester.post(requestUrl, requestData,
            function success(data) {
                showPopup('success', "You have successfully added a new comment.");
                redirectUrl("#/home");
            },
            function error(data) {
                showPopup('error', "An error has occurred while attempting to create a comment.");
            });
    }

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
        //console.log(requestData);
        this._requester.delete(requestUrl, requestData,
            function success(response) {
                showPopup("success", "You have successfully deleted this comment");
                redirectUrl("#")
            },
            function error(response) {
                showPopup("error", "You don't have authorization to delete this sale comment !");
            });
    }
}