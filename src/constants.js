/** Time used for cleaning up images and public access of google upload files */
const STORAGE_TIME = Date.now() + (3600 * 1000 * 24); // 24 hrs

/** Size used for download and upload */
const MAX_DAILY_SIZE = 30000; // 30kb per day

module.exports = {
  STORAGE_TIME,
  MAX_DAILY_SIZE,
};
