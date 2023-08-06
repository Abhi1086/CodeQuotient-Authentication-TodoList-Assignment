const submitTodoNode = document.getElementById("submitTodo");
const userInputNode = document.getElementById("userInput");
const prioritySelectorNode = document.getElementById("prioritySelector");
const todoListNode = document.getElementById("todo-item");

// credentials from login form
const submitLoginNode=document.getElementById("submitLogin")
const userNameLoginNode=document.getElementById("usernameLogin");
const passwordLoginNode=document.getElementById("passwordSignUp");

//credentials from signup form
const submitSignUpNode=document.getElementById("submitSignUp")
const userNameSignUpNode=document.getElementById("usernameSignUp");
const passwordSignUpNode=document.getElementById("passwordSignUp");


//fetching  username by calling the route and showing usnername and adding lgout button dynamically 
fetch('/get-username', {
  credentials: 'same-origin'  // Needed to include the session cookie in the request
})
.then(res => res.text())
.then(username => {
  if (username) {
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.innerHTML = `
      Logged in as ${username} 
      <button id="logoutButton">Logout</button>
    `;
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
      fetch('/logout')
      .then(res => location.reload());
    });
  }
})
.catch(console.error);
fetch("/todo-data")
.then(res => res.json())
.then((todos) => {
  todos.forEach(function (todo) {
    showTodoInUI(todo);
  });
})
.catch(error => console.error('Error:', error));

// submit todo event 
submitTodoNode.addEventListener("click", function () {
  const todoText = userInputNode.value;
  const priority = prioritySelectorNode.value;

  if (!todoText || !priority) {
    alert("Please enter a todo");
    return;
  }

  const todo = {
    id: Date.now(),
    todoText,
    priority,
    completed: false
  };

  fetch("/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
  .then(res => res.text())
  .then((res) => {
    if (res === "success") {
      showTodoInUI(todo);
    } else {
      alert("something weird happened");
    }
  })
  .catch(error => console.error('Error:', error));
});

//signup button event
submitSignUpNode.addEventListener("click", function() {
  const userName = userNameSignUpNode.value;
  const password = passwordSignUpNode.value;

  fetch('/signup', {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
      },

      //object ko string format me convert krliya
      body: JSON.stringify({
          username: userName,
          password: password,
      }),
  })
  .then(response => response.text())
  .then(data => {
      if (data === 'Registered successfully') {
          alert('Registered successfully');
          // redirect to login page or whatever you want
      } else {
          alert('Failed to register: ' + data);
      }
  })
  .catch(console.error);
});

//login button event
submitLoginNode.addEventListener("click", function() {
  const userName = userNameLoginNode.value;
  const password = passwordLoginNode.value;

  fetch('/login', {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          username: userName,
          password: password,
      }),
  })
  .then(response => response.text())
  .then(data => {
      if (data === 'Logged in successfully') {
          alert('Logged in successfully');
          // redirect to todo page or whatever you want
      } else {
          alert('Failed to login: ' + data);
      }
  })
  .catch(console.error);
});

// Assignement 10 code ends for todoScript



function showTodoInUI(todo) {
  const todoItemDiv = document.createElement("div");
  todoItemDiv.style.display = 'flex';
  todoItemDiv.style.justifyContent = 'space-between';
  todoItemDiv.style.marginBottom = '10px';
  todoItemDiv.style.padding = '10px';
  todoItemDiv.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.1)';
  todoItemDiv.style.borderRadius = '5px';
  todoItemDiv.style.background = 'white';

  const todoTextNode = document.createElement("span");
  todoTextNode.innerText = todo.todoText;
  todoTextNode.style.textDecoration = todo.completed ? 'line-through' : 'none';

  const priorityNode = document.createElement("span");
  priorityNode.innerText = 'Priority: ' + todo.priority;
  priorityNode.style.fontWeight = 'bold';
  priorityNode.style.marginRight = '10px';

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.style.padding = '5px 10px';
  deleteButton.style.border = 'none';
  deleteButton.style.borderRadius = '5px';
  deleteButton.style.background = '#f44336';
  deleteButton.style.color = 'white';
  deleteButton.style.cursor = 'pointer';

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  checkbox.addEventListener("change", function () {
    fetch(`/todo/${todo.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: checkbox.checked }),
    })
    .then(res => res.text())
    .then((res) => {
      if (res === "success") {
        todoTextNode.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
      } else {
        console.error("Failed to update todo");
      }
    })
    .catch(error => console.error('Error:', error));
  });

  deleteButton.addEventListener("click", function () {
    fetch(`/todo/${todo.id}`, { method: "DELETE" })
    .then(res => res.text())
    .then((res) => {
      if (res === "success") {
        todoItemDiv.remove();
      } else {
        console.error("Failed to delete todo");
      }
    })
    .catch(error => console.error('Error:', error));
  });

  todoItemDiv.appendChild(todoTextNode);
  todoItemDiv.appendChild(priorityNode);
  todoItemDiv.appendChild(checkbox);
  todoItemDiv.appendChild(deleteButton);

  todoListNode.appendChild(todoItemDiv);
  userInputNode.value= "";
}

fetch("/todo-data")
  .then(res => res.json())
  .then((todos) => {
    todos.forEach(function (todo) {
      showTodoInUI(todo);
    });
  })
  .catch(error => console.error('Error:', error));
