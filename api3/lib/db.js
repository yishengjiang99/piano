"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
const { resolve } = require("path");

function conn() {
  var c = mysql.createConnection({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "password",
    database: "grepawk",
  });
  c.on("end", function () {});
  return c;
}
async function dbRow(sql, bind) {
  const results = await dbQuery(sql, bind);
  if (results[0]) return results[0];
  else return false;
}
async function dbQuery(sql, bind) {
  return new Promise((resolve, reject) => {
    const connection = conn();
    connection.query(sql, bind, function (error, results, fields) {
      if (error) reject(error);
      else resolve(results);

      connection.end();
    });
  });
}
async function dbInsert(table, obj) {
  return new Promise((resolve, reject) => {
    const connection = conn();
    const sql = `insert ignore into ${table} SET ?`;
    connection.query(sql, obj, function (error, results, fields) {
      if (error) reject(error);
      else resolve(results.insertId);
      console.log(results);
      connection.end();
    });
  });
}
// const dbConn = async () => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection(function (err, connection) {
//       if (err) reject(err);
//       else resolve(connection);
//     });
//   });
// };
const dbMeta = async () => {
  var tables = await dbQuery("show tables");
  return tables;
};

const genuserNames = () => {
  const verbs = require("fs")
    .readSync(require("path").resolve("bin/verb.txt"))
    .split("\n")
    .map((n) => n.trim())
    .map((name) => dbInsert("available_usernames", { username: name, taken: 0 }));
};


async function getOrCreateUser(req) {
  const username = req.headers["g-username"];
  var user;
  if (username) {
    user = await dbRow("SELECT * from user where username=? limit 1", [username]);
  }

  if (!user) {
    const randUsername = await dbRow(
      "select username from available_usernames where taken=0 order by rand() limit 1"
    );
    dbQuery("update available_usernames set taken=1 where username=?", [randUsername.username]);
    const userId = await dbInsert("user", {
      username: randUsername.username,
      loggedin_cnt: 1,
    }).catch((e) => {});
    user = await dbRow("select username from user where id=?", [userId]).catch((e) =>
      console.log(e)
    );
  }
  if (!user) {
    throw new exception("unable to select or insert new user");
  }
}
module.exports = {
  dbQuery,
  dbInsert,
  dbMeta,
  dbRow,
};
