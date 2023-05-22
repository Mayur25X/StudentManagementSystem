const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const mysql = require("mysql");
const { conn } = require("./connection");
const { constants } = require("buffer");
const http = require("http");

// var bodyParser = require("body-parser");

port = 8000;
//configuration

const server = http.createServer((req, res) => {
  const user_ip =
    req.headers["req.socket.remoteAddress"] || req.socket.remoteAddress;
  console.log(`User IP address: ${user_ip}`);

  //   res.end('Hello World!');
});

const staticPath = path.join(__dirname + "/public");
app.use(express.static(staticPath));
// console.log(staticPath)

const tempPath = path.join(__dirname + "/Templates/views");
app.set("views", tempPath);
app.set("view engine", "hbs");

const PartialPath = path.join(__dirname + "/Templates/partial");
hbs.registerPartials(PartialPath);

//If use post method use this
// app.use(express.urlencoded())
// app.use(express.json())

//Routing

//restrictAccess Of the perticular Ip
const allowed_ips = ["127.0.0.1", "192.168.0.1"];

const restrictAccess = (req, res, next) => {
  //
  const user_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (
    allowed_ips.includes(user_ip) ||
    user_ip === "::1" ||
    user_ip === "::ffff:127.0.0.1"
  ) {
    // IP address is allowed, proceed with next middleware
    next();
  } else {
    // IP address is not allowed, send 403 Forbidden response
    res.status(403).send("Access denied");
  }
};

app.use(restrictAccess);

app.get("/", (req, res) => {
  // Programm to get Ip in the
  const user_ip =
    req.headers["req.socket.remoteAddress"] || req.socket.remoteAddress;
  console.log(`User IP address: ${user_ip}`);

  res.render("index.hbs");
  // Check if the IP address is allowed
});
app.get("/add", (req, res) => {
  // res.send("You forger Node Js ")
  res.render("add.hbs");
});

app.get("/addstudent", (req, res) => {
  const { Student_id, name, email, Branch, gender } = req.query;
  let quy = "select * from test where student_id=? and email=?";
  conn.query(quy, [Student_id, email], (err, result) => {
    if (err) {
      throw err;
    } else {
      if (result.length > 0) {
        res.render("add.hbs", {
          prest: true,
          Student_ID: Student_id,
        });
      } else {
        let quy2 = "insert into test values(?,?,?,?,?)";
        conn.query(
          quy2,
          [Student_id, name, email, Branch, gender],
          (err, results) => {
            if (err) {
              throw err;
            } else {
              if (results.affectedRows > 0) {
                res.render("add.hbs", { mesg: true });
              }
            }
          }
        );
      }
    }
  });
  // res.send(req.query)
});

app.get("/search", (req, res) => {
  const { Student_id } = req.query;
  let qry = "select * from test where student_id=?";
  conn.query(qry, [Student_id], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      const results = JSON.parse(JSON.stringify(result));
      res.render("search", {
        found: true,
        id: results[0].student_id,
        nam: results[0].name,
        email: results[0].email,
        Branch: results[0].Branch,
        gender: results[0].gender,
      });
      console.log(results[0]);
    } else {
      res.render("search", {
        found: false,
      });
    }
  });
});
// app.post("/search",(req,res)=>{
//     res.send(req.body)
// })

app.get("/update", (req, res) => {
  // res.send("You forger Node Js ")
  const { Student_id } = req.query;
  console.log(Student_id);
  let qry = "select * from test where student_id=?";
  conn.query(qry, [Student_id], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      const results = JSON.parse(JSON.stringify(result));
      res.render("update", {
        found: true,
        data: result,
      });
      console.log(results[0]);
    } else {
      res.render("update", {
        found: false,
      });
    }
    res.render("update");
  });
});

app.get("/delete", (req, res) => {
  res.render("delete", {
    found: false,
  });
});
app.get("/deleteStudent", (req, res) => {
  // res.send("You forger Node Js ")

  const { Student_id } = req.query;
  let qry = `Delete from test where student_id=?`;
  conn.query(qry, [Student_id], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.affectedRows > 0) {
      const results = JSON.parse(JSON.stringify(result));
      console.log(results);
      res.render("delete", {
        found: true,
        check: false,
      });
      console.log(results[0]);
    } else {
      res.render("delete", {
        found: false,
        check: true,
      });
    }
  });
  // res.render("delete")
});

app.get("/", (req, res) => {
  // res.send("You forger Node Js ")
  res.render("view.hbs");
});

app.get("/updateStudent", (req, res) => {
  const { Student_id, name, email, Branch, gender } = req.query;
  let quy2 = `Update test set name=? ,Branch=? ,email=?, gender = ? where student_id="${Student_id}" `;
  conn.query(quy2, [name, Branch, email, gender], (err, result) => {
    if (err) {
      throw err;
    } else {
      if (result.affectedRows > 0) {
        res.render("update", {
          prest: true,
          Student_ID: Student_id,
        });
      }
    }
  });
});

app.get("/questions", (req, res) => {
  res.render("question.hbs");
});

app.get("/getQ", async (req, res) => {
  const { question, choices, correct_answer, difficulty } = req.body;
  console.log(question);
  const query = {
    text: "INSERT INTO questions (question, choices, correct_answer, difficulty) VALUES ($1, $2, $3, $4) RETURNING *",
    values: [question, choices, correct_answer, difficulty],
  };
  try {
    const result = await conn.query(query);
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.put("/questions/:id", async (req, res) => {
  const { question, choices, correctanswer } = req.body;
  const { id } = req.params;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question,
        choices,
        correctAnswer,
      },
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/view", (req, res) => {
  res.render("view");
});

app.listen(port, (err) => {
  if (err) throw err;
  else {
    console.log(`Connection at prot succecful ${port}`);
  }
});
