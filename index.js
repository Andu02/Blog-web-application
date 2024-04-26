import express from "express";
import bodyParser from "body-parser";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

const minTitleLength = 5;
const maxTitleLength = 50;
const minContentLength = 5;
const maxContentLength = 500;

// Set up middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Define an array to store posts
let postsArray = [];

// Set EJS as view engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static("public"));

// HOME PAGE
app.get("/", (req, res) => {
  res.render("index", { posts: postsArray });
});

// Create new post
app.get("/create", (req, res) => {
  res.render("createPost", { posts: postsArray });
});

// Post new post
app.post("/create", validatePost(true, false, "createPost"), (req, res) => {
  let { title, content } = req.body;

  const newPost = {
    id: generateId(),
    date: new Date().toDateString(),
    hour: new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2,'0'),
    author: "unknown",
    comments: [],
    numberComments: 0,
    isLiked: false,
    title,
    isEdited: "",
    content,
    author: "Unknown",
  };
  postsArray.push(newPost);
  res.redirect("/");
});

// Get post
app.get("/post/:id", (req, res) => {
  const postId = req.params.id;
  const post = postsArray.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  res.render("seePost", { post, posts: postsArray });
});

// Post delete
app.post("/post/delete/:id", (req, res) => {
  const postId = req.params.id;
  postsArray = postsArray.filter((post) => post.id !== postId);
  res.redirect("/");
});

// Create comment
app.get("/post/comment/:id", (req, res) => {
  const postId = req.params.id;
  const post = postsArray.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  res.render("createComment", { post, posts: postsArray });
});

// Post new comment
app.post(
  "/create-comment/:id",
  validatePost(false, true, "createComment"),
  (req, res) => {
    const postId = req.params.id;
    const post = postsArray.find((post) => post.id === postId);
    const { content } = req.body;

    if (post) {
      const comment = {
        content: content,
        date: new Date().toDateString(),
        hour: new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2,'0'),
        author: "Unknown",
      };
      post.comments.push(comment);
      post.numberComments++;
      res.redirect("/post/" + postId);
    } else {
      res.status(404).send("Post not found");
    }
  }
);

// Redirect previous page
app.post("/redirect", (req, res) => {
  const returnTo = req.body.returnTo || "/";
  res.redirect(returnTo);
});

// Create new edit
app.get("/post/edit/:id", (req, res) => {
  const postId = req.params.id;
  const post = postsArray.find((post) => post.id === postId);
  if (!post) {
    res.sendStatus(404);
    return;
  }
  res.render("editPost", { post, posts: postsArray });
});

// Post edit
app.post("/post/edit/:id", validatePost(true, true, "editPost"), (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const postIndex = postsArray.findIndex((post) => post.id === postId);
  if (postIndex === -1) {
    res.sendStatus(404);
    return;
  }
  postsArray[postIndex] = { ...postsArray[postIndex], title, content };
  postsArray[postIndex].isEdited = "(EDITED)";
  res.redirect("/post/" + postId);
});

// Add like to post
app.post("/post/like/:id", (req, res) => {
  const postId = req.params.id;
  const post = postsArray.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).send("Post not found");
  }
  post.isLiked = !post.isLiked;
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function containsOnlyWhitespace(str) {
  return str.trim().length === 0;
}

// To restrict the character limit
function validatePost(requireTitle, requirePost, view) {
  return function (req, res, next) {
    let title = "";
    let content = "";
    const errors = [];

    if (requireTitle) {
      ({ title, content } = req.body);
    } else {
      ({ content } = req.body);
    }

    if (requireTitle && containsOnlyWhitespace(title)) {
      errors.push('Title cannot be empty or contain only whitespace.');
    }

    // Check if content is required and validate
    if (containsOnlyWhitespace(content)) {
      errors.push('Content cannot be empty or contain only whitespace.');
    }

    let post = "";
    if (requirePost) {
      const postId = req.params.id;
      post = postsArray.find((post) => post.id === postId);
    }

    if (requireTitle && (!title || title.length < minTitleLength || title.length > maxTitleLength)) {
      errors.push(`The title should have a minimum of ${minTitleLength} characters and a maximum of ${maxTitleLength}.`);
    }

    if (!content || content.length < minContentLength || content.length > maxContentLength) {
      errors.push(`The content should have a minimum of ${minContentLength} characters and a maximum of ${maxContentLength}.`);
    }

    if (errors.length > 0) {
      // There are validation errors, render the form again with error messages
      res.render(view, {
        errors,
        post: post,
        title: requireTitle ? (title ? title.substring(0, maxTitleLength) : "") : "", // Truncate title if it's too long
        content: content ? content.substring(0, maxContentLength) : "", // Truncate content if it's too long
      });
    } else {
      // No validation errors, proceed to the next middleware or route handler
      next();
    }
  };
}
