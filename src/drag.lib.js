// 간단하게 만든 제이쿼리 드래그 플러그인
(function($) {
  $.fn.extend({
    drag: (function() {
      let startX_, startY_;
      return function(options) {
        let opt;
        let onMousemove, onMouseup;
        opt = { end = null, start = null, move = null } = options;
        onMousemove = function(e) {
          $.isFunction(opt.end)
            ? opt.move({
                x: e.clientX - startX_,
                y: e.clientY - startY_
              })
            : "";
        };

        onMouseup = function() {
          $.isFunction(opt.end) ? opt.end() : "";
          $(document)
            .off("mouseup", onMouseup)
            .off("mousemove", onMousemove);
        };

        this.on("mousedown", function(e) {
          $.isFunction(opt.start) ? opt.start() : "";
          startX_ = e.clientX;
          startY_ = e.clientY;
          $(document)
            .on("mousemove", onMousemove)
            .on("mouseup", onMouseup);
        });
      };
    })()
  });
})(jQuery);
