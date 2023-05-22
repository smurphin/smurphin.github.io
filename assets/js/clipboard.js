// clipboard.js

document.addEventListener('DOMContentLoaded', function () {
    var copyButtons = document.querySelectorAll('.copy-button');
  
    copyButtons.forEach(function (button) {
      var clipboard = new ClipboardJS(button);
  
      clipboard.on('success', function (e) {
        button.textContent = 'Copied!';
        setTimeout(function () {
          button.textContent = 'Copy';
        }, 2000);
        e.clearSelection();
      });
    });
  });
  