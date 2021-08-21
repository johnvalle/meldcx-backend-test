const { MAX_DAILY_SIZE } = require('../constants');
const firebase = require('./firebase');

const getDateToday = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();

  if (dd < 10) dd = `0${dd}`;
  if (mm < 10) mm = `0${mm}`;
  return `${yyyy}-${mm}-${dd}`;
};

async function updateDailyUsage({ action, fileSize, ipAddress }) {
  /** Init Firebase Firestore Database */
  const db = firebase.firestore().collection('daily_usage');
  const nodeId = `${getDateToday()}-${ipAddress}`;
  const dataRef = await db.doc(nodeId);
  const doc = await dataRef.get();

  if (!doc.exists) {
    // if first time uploading or downloading
    const remainingSize = MAX_DAILY_SIZE - fileSize;
    dataRef.set({
      downloads: action === 'download' ? remainingSize : MAX_DAILY_SIZE,
      uploads: action === 'upload' ? remainingSize : MAX_DAILY_SIZE
    });
  } else {
    // if data is already existing, update limits
    dataRef.update({
      downloads: action === 'download' ? doc.data().downloads - fileSize : doc.data().downloads,
      uploads: action === 'upload' ? doc.data().uploads - fileSize : doc.data().uploads
    });
  }
}

module.exports = {
  getDateToday,
  updateDailyUsage,
};
