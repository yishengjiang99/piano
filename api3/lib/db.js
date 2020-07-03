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

module.exports = {
  dbQuery,
  dbInsert,
  dbMeta,
  dbRow,
};
