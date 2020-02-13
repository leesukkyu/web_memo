// 원한다면 로컬스토리지가 아닌 다른 곳으로 저장할 수 있도록 스토리지를 관리.
const Storage = {
  set: function(k, v) {
    localStorage.setItem(k, v);
  },
  get: function(k) {
    return localStorage.getItem(k);
  }
};
export default Storage;
