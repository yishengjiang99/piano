const azure = require("azure-storage");
const blobClient = azure.createBlobService();
const fileService = azure.createFileService();
const { PassThrough } = require("stream");

const FILESHARE_TASK = "taskshare";
const CONTAINER_NAME = "sounds";
function initFileShare(dirname) {
  fileService.createShareIfNotExists(FILESHARE_TASK, function (
    error,
    result,
  ) {
    if (!error) {
      console.error(error);
      return false;
    }
    fileService.createDirectoryIfNotExists(
      dirname || FILESHARE_TASK,
      CONTAINER_NAME,
      {},
      (err, result, resp) => {
        if (err) stderr(err);
        return stdout(result);
      }
    );
  });
}
function getContainer(container, stdout, stderr) {
  blobClient.createContainerIfNotExists(
    container,
    {
      publicAccessLevel: "blob",
    },
    (err, result, resp) => {
      if (err) stderr(err);
      return stdout(result);
    }
  );
}

function file_put_contents(filepath, content) {
  return new Promise((resolve, reject) => {
    fileService.createFileFromText(
      FILESHARE_TASK,
      CONTAINER_NAME,
      filepath,
      content,
      function (error, result, response) {
        if (!error) reject(error);
        resolve(result);
      }
    );
  });
}

function listFiles(prefixName) {
  return new Promise((resolve, reject) => {
    var files = [];
    var _page_through = function (prefixName, nextPage) {
      fileService.listFilesAndDirectoriesSegmentedWithPrefix(
        FILESHARE_TASK,
        CONTAINER_NAME,
        prefixName,
        nextPage,
        (err, result) => {
          if (err) {
            console.log(err);
            resolve([]); //handle it here.
            return;
          }
          result.entries.forEach((entry) => {
            files.push(entry);
          });
          if (result.continuationToken) {
            _page_through(prefixName, result.continuationToken);
          } else {
            resolve(files);
            return;
          }
        }
      );
    };
    _page_through(prefixName, null);
  });
}
function file_stream_contents(filepath, writestream) {
  fileService
    .createReadStream(FILESHARE_TASK, CONTAINER_NAME, filepath)
    .pipe(writestream);
}
function file_get_contents(filepath) {
  return new Promise((resolve, reject) => {
    var w = new PassThrough();
    var chunks = [];
    file_stream_contents(filepath, w);
    w.on("data", (d) => chunks.push(d));
    w.on("done", () => {
      resolve(chunks.join());
    });
    w.on("error", (e) => reject(e));
  });
}
module.exports = {
  getContainer,
  listFiles,
  getContainer,
  initFileShare,
  file_get_contents,
  blobClient,
  file_put_contents,
  file_stream_contents,
};
