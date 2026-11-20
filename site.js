document.querySelectorAll('form.mail').forEach(function (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var lines = [];
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (field) {
      if (field.value.trim()) {
        lines.push(field.name + ': ' + field.value.trim());
      }
    });
    var subject = form.getAttribute('data-subject') || 'Website message';
    var href = 'mailto:travis@vethomeguard.org?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
  });
});