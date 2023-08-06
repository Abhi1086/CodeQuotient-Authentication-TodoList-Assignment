const { error } = require("console");
const express = require("express");
const fs = require("fs");
const { dirname } = require("path");
var session=require("express-session");

const app = express();

app.use(session({
  secret: ' 20 Rupee doge to raaz ki baat bataungaa',
  resave: false,
  saveUninitialized: true,
  
}))

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.get("/", function (req, res) {
  if(!req.session.isloggedIn){
    res.redirect("/login");
    return ;
  }
  res.sendFile(__dirname + "/todoViews/index.html");
});


app.get("/login",function(req,res){
  res.sendFile(__dirname+"/todoviews/login.html");
})

app.post('/login',function(req,res){
  const userName=req.body.username;
  const { username, password } = req.body;

  fs.readFile('./credentials.txt', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    const credentials = data.split('\n');
    const isValid = credentials.some(
      cred => cred.split(',')[0] === username && cred.split(',')[1] === password
    );

    if (isValid) {
    // res.send('Logged in successfully');
    req.session.isloggedIn=true;
    req.session.username=username;
    return res.redirect('/todo');
    
    } 
  else {
    res.status(401).send("error")
  }
  });
});

app.get("/signup",function(req,res){
  res.sendFile(__dirname+"/todoviews/signup.html");
})

app.post("/signup",function(req,res){
  
  const { username, password } = req.body;

  fs.readFile('./credentials.txt', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    const credentials = data.split('\n');
    const exists = credentials.some(
      cred => cred.split(',')[0] === username
    );

    if (exists) {
      return res.status(400).send('Username already exists');
    }

    fs.appendFile('./credentials.txt', `${username},${password}\n`, err => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      res.send('Registered successfully');
    });
  });

})

 //Assignment 10 code ends here -- login and signup implementation



app.post("/todo", function (req, res) {
  
  saveTodoInFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    res.status(200).send("success");
  });
});

app.get("/todo-data", function (req, res) {
 
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    res.status(200).json(data);
  });
});

app.put("/todo/:id", function (req, res) {
  readAllTodos(function (err, todos) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    const todoIndex = todos.findIndex(todo => todo.id == req.params.id);
    if (todoIndex === -1) {
      res.status(404).send("Todo not found");
      return;
    }

    todos[todoIndex].completed = req.body.completed;
    writeTodosToFile(todos, function (err) {
      if (err) {
        res.status(500).send("error");
        return;
      }
      res.status(200).send("success");
    });
  });
});

app.delete("/todo/:id", function (req, res) {
  readAllTodos(function (err, todos) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    const todoIndex = todos.findIndex(todo => todo.id == req.params.id);
    if (todoIndex === -1) {
      res.status(404).send("Todo not found");
      return;
    }

    todos.splice(todoIndex, 1);
    writeTodosToFile(todos, function (err) {
      if (err) {
        res.status(500).send("error");
        return;
      }
      res.status(200).send("success");
    });
  });
});

app.get("/about", function (req, res) {
  if(!req.session.isloggedIn){
    res.redirect("/login");
    return ;
  }
  res.sendFile(__dirname + "/todoViews/about.html");
});

app.get("/contact", function (req, res) {
  if(!req.session.isloggedIn){
    res.redirect("/login");
    return ;
  }
  res.sendFile(__dirname + "/todoViews/contact.html");
});

app.get("/todo", function (req, res) {
  if(!req.session.isloggedIn){
    res.redirect("/login");
    return ;
  }

  res.sendFile(__dirname + "/todoViews/todo.html");
});

app.get("/todoScript.js", function (req, res) {
  res.sendFile(__dirname + "/todoViews/scripts/todoScript.js");
});

app.listen(3000, function () {
  console.log("server on port 3000");
});

function readAllTodos(callback) {
  fs.readFile("./todos.json", "utf-8", function (err, data) {
    if (err) {
      console.log(err)
      callback(err);
      return;
    }

    if (data.length === 0) {
      
      data = "[]";
    }

    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

function writeTodosToFile(todos, callback) {
  fs.writeFile("./todos.json", JSON.stringify(todos), function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, todos) {
    if (err) {
      callback(err);
      return;
    }

    todos.push(todo);
    writeTodosToFile(todos, callback);
  });
}

//action for getting username
app.get('/get-username', function (req, res) {
  res.send(req.session.username);
});
//logout button action
app.get('/logout', function (req, res) {
  delete req.session.username;
  res.redirect('/login');
});