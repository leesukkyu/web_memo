import Memo from "./Memo.mjs";
import Storage from "./Storage.mjs";

/*
 메모 기능을 한 페이지 내에서 간단하게 여러 개를 사용할 수 있도록 설계.
 해당 영역에서 메모 데이터 로드.
 */

$(function() {
  let Index;

  const CONFIG = {
    MEMO_WIDTH: 200,
    MEMO_HEIGHT: 100,
    MEMO_CONTENTS: "메모를 입력하세요."
  };

  Index = {
    init: function() {
      // 페이지 시작
      this.startMemo();
    },

    startMemo: (function() {
      // 메모 기능 시작
      let memoList_ = [];
      let createRemoveBtn;

      createRemoveBtn = function() {
        $('<button class="btn_remove">모든 쪽지 데이터 삭제 하기</button>')
          .click(() => {
            Memo.removeAllData(memoList_);
          })
          .appendTo($("body"));
      };

      return function() {
        let data;
        let memo1, memo2;

        // 첫 번째 메모 기능 시작
        memo1 = Memo.init({
          $wrap: $("#wrap"), // 메모 기능이 동작할 DOM
          width: CONFIG.MEMO_WIDTH, // 메모의 넓이
          height: CONFIG.MEMO_HEIGHT, // 메모의 높이
          contents: CONFIG.MEMO_CONTENTS // 메모 기본 컨텐츠
        });

        data = Storage.get("wrap"); // 저장된 메모장 로우 데이터를 가져온다.
        memo1.externList = JSON.parse(data); // set externList 이용으로 불러온 데이터를 넣어준다.
        memo1.externSaveFn = function(data) {
          // 메모 데이터가 변경시 해당 hook은 호출 됩니다.
          // 메모 생성, 삭제, 이동 종료, 리사이즈 종료, 블러 이벤트, 페이지 종료
          // 자동으로 Memo 객체가 this로 바인딩 되며 메모 데이터가 파라미터로 넘어오게 됩니다.
          Storage.set("wrap", JSON.stringify(data));
        };

        // 두 번째 메모 기능 시작
        memo2 = Memo.init({
          $wrap: $("#wrap2"),
          width: CONFIG.MEMO_WIDTH,
          height: CONFIG.MEMO_HEIGHT,
          contents: CONFIG.MEMO_CONTENTS
        });
        data = Storage.get("wrap2");
        memo2.externList = JSON.parse(data);
        memo2.externSaveFn = function(data) {
          Storage.set("wrap2", JSON.stringify(data));
        };

        // 호스트 코드에서 생성된 메모 인스턴스들을 관리할 수 있습니다.
        memoList_.push(memo1);
        memoList_.push(memo2);

        createRemoveBtn.call(this); // 모든 쪽지 삭제 기능 추가.
      };
    })()
  };

  Index.init();
});
