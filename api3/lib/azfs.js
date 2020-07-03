const azure = require("azure-storage");
const blobClient = azure.createBlobService();
const fileService = azure.createFileService();
const { PassThrough } = require("stream");
const { basename } = require("path");
const { RestaurantMenuRounded } = require("@material-ui/icons");

const FILESHARE_TASK = "taskshare";
const CONTAINER_NAME = "sounds";
function initFileShare(dirname) {
  fileService.createShareIfNotExists(FILESHARE_TASK, function (error, result, response) {
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
const stdresp = (err, result, resp) => {
  if (err) stderr(err);
  else stdout(result);
};
function getContainer(container) {
  return new Promise((resolve, reject) => {
    blobClient.createContainerIfNotExists(
      container,
      {
        publicAccessLevel: "container",
      },
      (err, result, resp) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}
function listFiles(containerName, prefix = null) {
  var token = null;

  return new Promise((resolve, reject) => {
    var files = [];

    var _page_through = function (containerName, nextPage) {
      blobClient.listBlobsSegmentedWithPrefix(containerName, prefix, nextPage, (err, result) => {
        if (err) reject(err);
        result.entries.forEach((entry) => {
          files.push({
            name: entry.name,
            etag: entry.etag,
            contentLength: entry.contentLength,
            created_at: entry.creationTime,
          });
        });
        if (result.continuationToken) {
          _page_through(containerName, result.continuationToken);
        } else {
          resolve(files);
          return;
        }
      });
    };
    _page_through(containerName, null);
  });
}

function file_put_contents(containername, filename, content) {
  return new Promise((resolve, reject) => {
    blobClient.createBlockBlobFromText(containername, filename, "adgadgadg", (err, resul, resp) => {
      console.log(resul);
      console.log(resp);
      if (err) reject(err);
      else resolve(resul);
    });
  });
}

function listFilesfs(prefixName) {
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
  fileService.createReadStream(FILESHARE_TASK, CONTAINER_NAME, filepath).pipe(writestream);
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
