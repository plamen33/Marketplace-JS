class CommentController {
    constructor(commentView, requester, baseUrl, appId) {
        this._commentView = commentView;
        this._requester = requester;
        this._appId = appId;
        this._baseServiceUrl = baseUrl + "/appdata/" + appId + "/comments/";
    }

    loadComments(requestData) { //Load comments using post Id from Kinvey

        triggerEvent('postCommentList', requestData);
    }
}