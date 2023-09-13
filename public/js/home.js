$(document).ready(() => {
    $.get("/api/posts", (results) => {
        //console.log(results);
        outputPosts(results, $(".postsContainer"));
    })
})

