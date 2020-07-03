// const server = require("@xarc/fastify-server");
const fastify = require("fastify")({
  logger: true,
});

const fz = require("./azfs.js");
const { dbRow, dbQuery, dbInsert } = require("./db.js");
const server = require("@xarc/fastify-server");
const { resolve } = require("path");
const { execute } = require("child_process");
const { exception } = require("console");

async function getUser(req) {
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
const hashCheckAuthLogin = async (username) => {
  const hashExpected = await execute(
    `md5 -s '${username}${process.env.secret_md5_salt || "welcome"}'`
  )
    .toString()
    .catch((e) => console.error(e));
  return hashExpected;
};
fastify.get("/checkin.jpeg", async (req, res) => {
  const user = getUser(req);
  const files = await dbQuery(
    `select f.*, m.meta as meta 
    from user u 
      left join files f on u.id=f.user_id 
      left join file_meta m on f.id=m.file_id
      where u.id=?`,
    [user.id]
  ).catch((e) => {
    console.error(e);
  });
  //console.log(res.headers);

  res.header("content-type", "image/jpeg");

  res.header("set-cookie", `g-username=${user.username}`);
  res.header("set-cookie", `g-hash=${hashCheckAuthLogin(user.username)}`);
  res.send(JSON.stringify({ user, files }));
});

fastify.post("/file", async (req, res) => {
  const filename = req.query.filename;
  const content = req.body;
  const filetype = require("path").extname(filename);
  const user = getUser(req);

  const fileid = await dbInsert("files", {
    user_id: user.id,
    filename: new Date().getDate() + "_log.txt",
    filetype: filetype,
    blob: filecontent.toString(2),
  });

  if (fileid) {
    res.status = 200;
    return;
  } else {
    res.status = 500;
    return;
  }

  //req.cookie("g-username")
});
fastify.listen(3333, (err, address) => {
  if (err) throw err;
  fastify.log.info(`server listening on ${address}`);
});
