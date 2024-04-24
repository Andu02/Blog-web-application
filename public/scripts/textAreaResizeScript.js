// 
document.addEventListener('DOMContentLoaded', function() {
    const contentTextarea = document.getElementById('content');

    // Automatically adjust the height of the textarea as content changes
    contentTextarea.addEventListener('input', function() {
        this.style.height = 'auto'; // Reset the height to auto
        this.style.height = (this.scrollHeight + 2) + 'px'; // Set the height to the scroll height of the content
    });
});
