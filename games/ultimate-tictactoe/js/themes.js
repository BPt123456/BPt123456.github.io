/**
 * 皮肤：只改 <html data-theme>，具体颜色在 css/themes/*.css。
 * 新增皮肤：加一份 CSS，并在 constants.js 的 THEMES 里登记。
 */
window.JJZQ = window.JJZQ || {};

JJZQ.themes = {
  storageKey: "jjzq-theme",

  current: function () {
    return document.documentElement.getAttribute("data-theme") || "ink";
  },

  apply: function (themeId) {
    var known = JJZQ.THEMES.some(function (theme) {
      return theme.id === themeId;
    });
    var id = known ? themeId : "ink";
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(JJZQ.themes.storageKey, id);
    } catch (err) {
      /* 无痕模式等情况下忽略 */
    }
    return id;
  },

  restore: function () {
    var saved = null;
    try {
      saved = localStorage.getItem(JJZQ.themes.storageKey);
    } catch (err) {
      saved = null;
    }
    return JJZQ.themes.apply(saved || "ink");
  },
};
