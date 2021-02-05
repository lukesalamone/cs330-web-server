
let activePost;

// gets post from the server:
const getPost = () => {
    // get post id from url address:
    const url = window.location.href;
    id = url.substring(url.lastIndexOf('#') + 1);

    // fetch post:
    fetch('/api/posts/' + id + '/')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            activePost = data;
            renderPost();
        });
};

const getComments = async () => {
  // get post id from url address:
  id = getPostId();

  let data = await fetch('/api/posts/' + id + '/comments/');
  data = await data.json();
  data.forEach(comment => {
    renderComment(comment);
  })
}

const renderComment = (comment) => {
  const template = `
      <p>${comment.author}</p>
      <div class="content">${comment.comment}</div>
      <i class="fa fa-trash" aria-hidden="true"></i>
  `;

  let div = document.createElement('div');
  div.setAttribute('comment_id', comment.id);
  div.innerHTML = template;
  div.children[2].onclick = deleteComment(comment.id);

  $('section.comments').appendChild(div);
};

const deleteComment = (commentId) => {
  return async (event) => {
    let response = await fetch('/api/comments/' + commentId, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
      }
    });

    if(response.status !== 200){
      console.log('error deleting comment ' + commentId);
    } else {
      event.target.parentElement.remove();
    }
  };
}

// updates the post:
const updatePost = (ev) => {
    const data = {
        title: document.querySelector('#title').value,
        content: document.querySelector('#content').value,
        author: document.querySelector('#author').value
    };
    console.log(data);
    fetch('/api/posts/' + activePost.id + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            activePost = data;
            renderPost();
            showConfirmation();
        });

    // this line overrides the default form functionality:
    ev.preventDefault();
};

const deletePost = (ev) => {
    const doIt = confirm('Are you sure you want to delete this blog post?');
    if (!doIt) {
        return;
    }
    fetch('/api/posts/' + activePost.id + '/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // navigate back to main page:
        window.location.href = '/';
    });
    ev.preventDefault()
};

// creates the HTML to display the post:
const renderPost = (ev) => {
    const paragraphs = '<p>' + activePost.content.split('\n').join('</p><p>') + '</p>';
    const template = `
        <p id="confirmation" class="hide"></p>
        <h1>${activePost.title}</h1>
        <div class="date">${formatDate(activePost.published)}</div>
        <div class="content">${paragraphs}</div>
        <p>
            <strong>Author: </strong>${activePost.author}
        </p>
    `;
    document.querySelector('.post').innerHTML = template;
    toggleVisibility('view');

    // prevent built-in form submission:
    if (ev) { ev.preventDefault(); }
};

// creates the HTML to display the editable form:
const renderForm = () => {
    const htmlSnippet = `
        <div class="input-section">
            <label for="title">Title</label>
            <input type="text" name="title" id="title" value="${activePost.title}">
        </div>
        <div class="input-section">
            <label for="author">Author</label>
            <input type="text" name="author" id="author" value="${activePost.author}">
        </div>
        <div class="input-section">
            <label for="content">Content</label>
            <textarea name="content" id="content">${activePost.content}</textarea>
        </div>
        <button class="btn btn-main" id="save" type="submit">Save</button>
        <button class="btn" id="cancel" type="submit">Cancel</button>
    `;

    // after you've updated the DOM, add the event handlers:
    document.querySelector('#post-form').innerHTML = htmlSnippet;
    document.querySelector('#save').onclick = updatePost;
    document.querySelector('#cancel').onclick = renderPost;
    toggleVisibility('edit');
};

const formatDate = (date) => {
    const options = {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-US', options);
};

const getPostId = () => {
  const url = window.location.href;
  return url.substring(url.lastIndexOf('#') + 1);
}

// handles what is visible and what is invisible on the page:
const toggleVisibility = (mode) => {
    if (mode === 'view') {
        document.querySelector('#view-post').classList.remove('hide');
        document.querySelector('#menu').classList.remove('hide');
    } else {
        document.querySelector('#view-post').classList.add('hide');
        document.querySelector('#menu').classList.add('hide');
    }
};

const showConfirmation = () => {
    document.querySelector('#confirmation').classList.remove('hide');
    document.querySelector('#confirmation').innerHTML = 'Post successfully saved.';
};

// called when the page loads:
const initializePage = () => {
    // get the post from the server:
    getPost();
    getComments();
    // add button event handler (right-hand corner:
    document.querySelector('#edit-button').onclick = renderForm;
    document.querySelector('#delete-button').onclick = deletePost;
};


const submitComment = async (event) => {
  event.preventDefault();

  let body = {};
  body.comment = $('#post-form textarea').value;
  body.author = $('#post-form input').value;

  let id = getPostId();
  let url = '/api/posts/' + id + '/comments';
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if(response.status !== 201){
    // todo display error
  } else {
    let json = await response.json();
    renderComment(json);

    // clear form
    $('#post-form textarea').value = '';
    $('#post-form input').value = '';
  }
};

initializePage();

// util functions

function $(x) {
  return document.querySelector(x);
}