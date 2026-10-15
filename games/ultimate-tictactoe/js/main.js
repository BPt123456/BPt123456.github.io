(function () {
  var game = new JJZQ.Game();
  var themeId = JJZQ.themes.restore();
  var themeSelect = document.getElementById("theme-select");
  if (themeSelect) {
    themeSelect.value = themeId;
  }
  JJZQ.ui.init(game);
})();
