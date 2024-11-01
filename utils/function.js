function getLastItem(arr) {
  if (arr && arr.length > 0) {
    return arr[arr.length - 1];
  }
  return null;
}

module.exports = { getLastItem };
