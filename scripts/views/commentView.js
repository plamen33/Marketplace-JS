class CommentView {
    constructor(wrapperSelector, mainContentSelector) {
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    }

    showCreateCommentPage(isLoggedIn, lastCommentId) {
        console.log("last Comment ID is : " + lastCommentId)
        
        let thisClass = this;

        $.get('templates/form-create-comment.html', function (template) {
            var renderMainContent = Mustache.render(template, null);
            $(thisClass._mainContentSelector).html(renderMainContent);

            $('#commentAuthor').val(sessionStorage.getItem('username'));
            console.log("enter form-create-comment.htm");
            $('#create-new-comment-request-button').on('click', function (ev) {
                if (isLoggedIn != true) {
                    showPopup('error', "Please log in to add comments");
                    redirectUrl("#/login");
                }
                else {
                    let commentAuthor = $('#commentAuthor').val();
                    let commentContent = $('#commentContent').val();
                    let date = moment().format("MMMM Do YYYY, h:mm A");
                    // this will be the new comment created object, temporary we load the postid inside it, as it will be needed later
                    let data = {
                        comment_id: lastCommentId,
                        comment_author: commentAuthor,
                        comment_content: commentContent,
                        comment_date: date,
                        postid: sessionStorage.getItem('id')
                        //commentId : lastCommentId
                    };
                    triggerEvent('createComment', data);
                }
            });
        })
    }

}