import "./drag.lib.js";

/**
 * @class Memo
 * @description 메모 클래스.
 *
 * 메모 객체의 데이터와 동작을 담당합니다.
 * 해당 클래스에서 메모 데이터와 바인딩 된 DOM 담당, UI 담당.
 * 즉, 데이터, 바인딩 된 DOM, UI 동작까지가 하나의 컴포넌트화 되어 있는 클래스 설계.
 * 추후 상속을 받더라도 관리 포인트가 따로 있지 않아 확장이 용이하다.
 */

class Memo {
  // 클래스 멤버 변수들을 모델 형식으로 관리.
  static model() {
    return {
      uuid: null,
      width: 0,
      height: 0,
      cords: {
        x: 0,
        y: 0
      },
      contents: null,
      $el: null,
      map: null
    };
  }

  // 인스턴스 생성시 멤버 변수 생성 및 시작 함수 호출
  constructor(props = {}) {
    this.option = Object.assign(Memo.model(), props);
    this.init();
  }

  // 시작
  init() {
    this.uuid = this.option.uuid || this.getUUID();
    this.create();
    this.activate();
  }

  // 메모 DOM 생성 관리
  create() {
    this.createDOM();
    this.setEventListener();
    this.setDragable();
  }

  // 메모 DOM 삭제 관리
  remove() {
    this.option.map.remove = this.uuid;
    this.$el.remove();
  }

  createDOM() {
    // DOM을 캐싱, 바인딩하고 이후에는 쿼리 없이 바로 접근한다.
    this.$el = $(this.getTemplate(this.option));
    this.$el.appendTo(this.option.$wrap);
  }

  /**
   * @param  width
   * @param  height
   * @param  contents
   * @param  cords
   * @description 템플릿 생성 함수
   *  템플릿도 컴포넌트의 묶음이라 여기고 클래스 내부에서 관리
   *  그러나 추후 유지보수를 위하여 클래스 멤버 변수를 직접 참조하지 않고 파라미터를 받음.
   */
  getTemplate({ width, height, contents, cords }) {
    const TEMPLATE = `
            <div class="memo" style="top:${cords.y}px;left:${cords.x}px">
                <div data-move class="header">
                    <h1 class="blind">메모장</h1>
                    <button data-close-btn class="btn_close"><span class="blind">닫기</span></button>
                </div>
                <div class="content">
                    <div data-textarea class="textarea" contenteditable="true" style="width:${width}px; height:${height}px">
                        ${contents}
                    </div>
                    <button data-resize-btn class="btn_size"><span class="blind">메모장 크기 조절</span></button>
                </div>
            </div>
        `;
    return TEMPLATE;
  }

  /**
   * @description 메모 UI 이벤트 관리
   * memo wrapper 안에서는 버블링으로 리스너가 동작한다.
   */
  setEventListener() {
    this.$el.on("click", "[data-close-btn]", e => {
      this.remove();
    });
    this.$el.on("click", e => {
      this.activate();
    });
    this.$el
      .find("[data-textarea]")
      .on("focus", e => {
        this.activate();
      })
      .on("keyup", e => {
        this.option.contents = $(e.target).html();
        // beforeunload로 충분;
        // this.option.map.change();
      })
      .on("blur", () => {
        this.option.map.change();
      });
  }

  /**
   * @description 메모 드래그 이벤트 관리
   * 리사이징, 드래깅 기능 추가.
   */

  // 이동 기능 추가
  setDragable() {
    this.$el.find("[data-move]").drag({
      start: () => {
        this.activate();
      },
      move: cords => {
        this.clearSelection();
        this.$el.css({
          left: this.option.cords.x + cords.x + "px",
          top: this.option.cords.y + cords.y + "px"
        });
      },
      end: () => {
        if (Memo.isErrorPoition(this)) {
          this.$el.addClass("rollback");
          this.$el.css({
            left: this.option.cords.x + "px",
            top: this.option.cords.y + "px"
          });
          setTimeout(() => {
            this.$el.removeClass("rollback");
          }, 320);
        } else {
          this.option.cords.x = parseInt(this.$el.css("left"), 10);
          this.option.cords.y = parseInt(this.$el.css("top"), 10);
          this.option.map.change();
        }
      }
    });

    // 리사이즈 기능 추가
    this.$el.find("[data-resize-btn]").drag({
      start: () => {
        this.activate();
      },
      move: cords => {
        this.clearSelection();
        this.$el.find("[data-textarea]").css({
          width: this.option.width + cords.x + "px",
          height: this.option.height + cords.y + "px"
        });
      },
      end: () => {
        this.option.width = parseInt(this.$el.find("[data-textarea]").css("width"), 10);
        this.option.height = parseInt(this.$el.find("[data-textarea]").css("height"), 10);
        this.option.map.change();
      }
    });
  }

  // 메모 활성화 담당
  activate() {
    let entries;
    entries = this.option.map.entries;
    for (let [key, memoObj] of entries) {
      memoObj.$el.removeClass("active");
    }
    if (this.option.map[this.uuid]) {
      this.option.map[this.uuid].$el.addClass("active");
    }
  }
  // 메모의 부적절한 위치 파악
  static isErrorPoition(memoObj) {
    let ExtraValue = 50;
    return (
      parseInt(memoObj.$el.css("top"), 10) < 0 || // 너무 위로 간 경우
      parseInt(memoObj.$el.css("top"), 10) + ExtraValue > memoObj.option.$wrap.height() || // 너무 아래로 간 경우
      parseInt(memoObj.$el.css("left"), 10) + ExtraValue > memoObj.option.$wrap.width() || // 너무 우측으로 간 경우
      parseInt(memoObj.$el.css("left"), 10) + memoObj.$el.width() - ExtraValue < 0 // 너무 좌측으로 간 경우
    );
  }
  
  // TODO: 유틸들 외부로 빼기
  
  // 드래그시 셀렉션 
  clearSelection() {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  }
  
  // 고유값 생성
  getUUID() {
    let dt, uuid;
    dt = new Date().getTime();
    uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      let r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
}

/**
 * @class MemoService
 * @description 메모 서비스 클래스.
 * 메모 객체의 생성과 객체들의 맵 데이터를 관리.
 * 서비스가 인스턴스화 되어 여러 개의 메모 서비스가 생성 가능.
 * 옵저버 기능을 위해 Map을 랩핑한 ProxyMap을 사용하고, Memo가 변화할 때마다 ProxyMap에 변화를 알림.
 * 데이터를 로드하고 저장하는 기능은 외부에서 Setter 이용.
 */

class MemoService {
  constructor(option) {
    this.option = option;
    this.proxyMap = null;
    this.externSaveFn_ = null;
    this.externList_ = null;
    this.init();
  }

  init() {
    // 프록시 맵 생성.
    this.proxyMap = MemoService.createProxyMap();
    // 리플렉트를 통해 proxyMap에 change 함수 할당.
    Reflect.setPrototypeOf(this.proxyMap, {
      // 해당 change 함수는 map이 변경될 때마다 호출.
      change: function() {
        this.save();
      }.bind(this)
    });
    this.setEventListener();
  }

  /**
   * @description 메모 서비스 이벤트 관리
   */
  setEventListener() {
    this.option.$wrap.on("contextmenu", e => {
      e.preventDefault();
      if (e.target == this.option.$wrap[0]) {
        this.onMouseRightClick.call(this, e);
      }
    });
    $(window).on("beforeunload", e => {
      this.onBeforeunload.call(this, e);
    });
  }

  // 마우스 우클릭 리스너
  onMouseRightClick(e) {
    let parentOffset, cords;
    e.preventDefault();
    parentOffset = $(e.target).offset();
    cords = {
      x: e.pageX - parentOffset.left,
      y: e.pageY - parentOffset.top
    };
    this.createMemo(cords);
  }

  // 페이지 나갈 때 리스너
  onBeforeunload(e) {
    this.save();
  }

  // 메모 객체 생성
  createMemo(cords) {
    let memoObj;
    memoObj = new Memo({
      $wrap: this.option.$wrap,
      map: this.proxyMap,
      width: this.option.width,
      height: this.option.height,
      contents: this.option.contents,
      cords
    });
    // 생성한 메모를 Map에 저장
    this.insertDataToMap(memoObj);
  }

  // Map에 메모 데이터 저장
  insertDataToMap(data) {
    if (data instanceof Map) {
      this.proxyMap.assign = data;
    } else {
      this.proxyMap[data.uuid] = data;
    }
  }

  // 외부 맵 데이터로 메모를 생성.
  // 외부 로우 메모 데이터를 map 형태로 바꿉니다.
  createMemoByExternList(list) {
    let memoObj, result;
    result = new Map();
    for (let i in list) {
      memoObj = new Memo({
        $wrap: this.option.$wrap,
        map: this.proxyMap,
        width: list[i].width,
        height: list[i].height,
        contents: list[i].contents,
        cords: list[i].cords,
        uuid: list[i].uuid
      });
      result.set(list[i].uuid, memoObj);
    }
    this.insertDataToMap(result);
  }

  // 저장 전처리 함수. 메모 데이터를 간략화된 로우 데이터형태로 만들어 준다.
  save() {
    let list, count;
    let entries, opt;
    (count = 0), (list = []);
    entries = this.proxyMap.entries;
    for (let [key, memoObj] of entries) {
      opt = memoObj.option;
      list[count++] = {
        uuid: memoObj.uuid,
        width: opt.width,
        height: opt.height,
        cords: opt.cords,
        contents: opt.contents
      };
    }
    if (this.externSaveFn_) {
      this.externSaveFn_(list);
    }
  }

  // 외부에 map, externSaveFn get/set 제공
  set externList(list) {
    this.createMemoByExternList(list);
  }
  get externList() {
    return this.proxyMap;
  }
  set externSaveFn(v) {
    this.externSaveFn_ = v;
  }
  get externSaveFn() {
    return this.externSaveFn_;
  }

  /**
   * @description 프록시 맵 팩토리 함수
   * 옵저버 기능을 위해 프록시 사용
   * Map으로 priority, 생성일 정렬 보장.
   */

  static createProxyMap() {
    return new Proxy(new Map(), {
      get(map, key, ...a) {
        if (key === "entries") {
          return map.entries();
        } else {
          if (map.has(key)) {
            return map.get(key);
          } else {
            return map[key];
          }
        }
      },
      set(map, key, value) {
        if (key === "remove") {
          map.delete(value);
        } else if (key == "clear") {
          if (value === true) {
            map.clear();
          }
        } else if (key === "assign") {
          for (let [key, v] of value) {
            map.set(key, v);
          }
        } else {
          map.set(key, value);
        }
        map.change();
        return true;
      },
      setPrototypeOf(target, proxyProto) {
        for (let i in proxyProto) {
          target[i] = proxyProto[i];
        }
        return false;
      }
    });
  }

  // 전체 데이터 삭제 기능
  static removeAllData(memoInstanceList) {
    try {
      for (let i in memoInstanceList) {
        let entries;
        entries = memoInstanceList[i].proxyMap.entries;
        for (let [key, memoObj] of entries) {
          memoObj.$el.remove();
        }
        memoInstanceList[i].proxyMap.clear = true;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 * 클래스를 직접 외부에 노출하기 보다 해당 서비스를 외부로 노출.
 * 클래스가 수정되거나 바뀌는 경우 호스트 측에 사이드 이팩트가 가지 않도록 버퍼층 제공.
 * @returns {init, removeAllData}
 */
const service = (function() {
  let init_, removeAllData_;
  init_ = function(option = ({ $wrap = null, width = 200, height = 100, contents = "", mapData = new Map(), cords = { x: 0, y: 0 } } = {})) {
    return new MemoService(option);
  };
  removeAllData_ = function() {
    MemoService.removeAllData(arguments[0]);
  };
  return {
    init: init_,
    removeAllData: removeAllData_
  };
})();

export default service;
