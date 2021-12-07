const searchIndex = (arr, id) => arr.findIndex((talker) => talker.id === parseInt(id, 10));
const searchId = (arr, id) => arr.find((talker) => talker.id === parseInt(id, 10));

module.exports = {
  searchIndex,
  searchId,
};