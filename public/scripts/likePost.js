function likePost(postId) {
    fetch(`/post/like/${postId}`, {
        method: 'POST'
})
.then(response => {
    if (!response.ok) {
    throw new Error('Failed to like post');
    }
    const likeImage = document.getElementById(`likeImage_${postId}`);
    if (likeImage) {
        if (likeImage.src.includes("/icons/like-unpressed.png")) {
            likeImage.src = "/icons/like-pressed.png"; 
        } else {
            likeImage.src = "/icons/like-unpressed.png"; 
        }
    }
})
.catch(error => {
    console.error(error);
});
}

var myButtons = document.querySelectorAll('.w3-button');

myButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
        event.preventDefault();

        console.log('Button clicked:', button.textContent);
    });
});

