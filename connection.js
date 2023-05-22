const mysql = require("mysql");
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "StudentManagement",
  port: 3307,
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Connection created..!");
});

module.exports.conn = conn;
