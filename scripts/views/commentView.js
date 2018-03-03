class CommentView {
    constructor(wrapperSelector, mainContentSelector) {
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    }

    showCreateCommentPage(isLoggedIn) {
        // console.log(postId);
        // if(postId == ""){
        //     postId = sessionStorage.getItem('id'); // this is needed when we edit the sale from the sale post details page
        // }
        // console.log("postId is : " + postId);
        console.log(sessionStorage.getItem('id'));
        let test = sessionStorage.getItem('id');
        console.log(test);

        let thisClass = this;

        $.get('templates/form-create-comment.html', function (template) {
            var renderMainContent = Mustache.render(template, null);
            $(thisClass._mainContentSelector).html(renderMainContent);

            $('#commentAuthor').val(sessionStorage.getItem('fullname'));
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
                    let data = {
                        author: commentAuthor,
                        content: commentContent,
                        date: date,
                        postid: sessionStorage.getItem('id')
                    };
                    triggerEvent('createComment', data);
                }
            });
        })
    }

}