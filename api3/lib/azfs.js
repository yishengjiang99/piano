const azure = require("azure-storage");
const blobClient = azure.createBlobService();
const fileService = azure.createFileService();
const { PassThrough } = require("stream");
const { basename } = require("path");
const { RestaurantMenuRounded } = require("@material-ui/icons");

const FILESHARE_TASK = "taskshare";
const CONTAINER_NAME = "sounds";

const errHandler = (err, res) => res.end(err.message);

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
    console.log("create container");
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
/*
 * req = http request
 * fh: = writeable stream
 */
async function page_blob_stdin(container, filename, contentType, writeableStream) {
  const reqOptions = {
    contentSettings: {
      //
      contentType: contentType,
      contentDisposition: "inline",
    },
  };
  await azfs.getContainer(container).catch((err) => errHandler(err, connection.socket));
  azfs.blobClient.createPageBlobFromStream(container, filename, fh, 1024, reqOptions, errHandler);
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
          resolve(files);
          //          _page_through(containerName, result.continuationToken);
        } else {
          resolve(files);
          return;
        }
      });
    };
    _page_through(containerName, null);
  });
}
function listContainers() {
  return new Promise((resolve, reject) => {
    blobClient.listContainersSegmented(null, (err, result, resp) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  return blobClient.listContainersSegmented(null, (err, result, resp));
}
function file_put_contents_append(containername, filename, content) {
  return new Promise((resolve, reject) => {
    blobClient.createAppendBlobFromText(containername, filename, content, (err, resul, resp) => {
      if (err) reject(err);
      else resolve(resp);
    });
  });
}
function file_put_contents(containername, filename, content) {
  return new Promise((resolve, reject) => {
    blobClient.createBlockBlobFromText(containername, filename, content, (err, resul, resp) => {
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
            //console.log(err);
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
function file_stream_contents(containerName, fileName, writestream) {
  return new Promise((resolve, reject) => {
    blobClient.getBlobToStream(containerName, fileName, writestream, (err, result, response) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function file_get_contents(filepath) {
  console.log(filepath);
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
  listContainers,
  file_put_contents,
  file_stream_contents,
  file_put_contents_append,
  page_blob_stdin,
};
