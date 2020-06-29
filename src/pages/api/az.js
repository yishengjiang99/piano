import {
  file_get_contents,
  list_files,
  file_put_content,
  blobservice,
} from "../../lib/azfs";
const containerName = "sounds";
export default (req, res) => {
  if (req.query.filename) {
    file_get_contents("containerName/" + req.query.filename, res);
  } else {
    list_files().then(files);
  }
};
