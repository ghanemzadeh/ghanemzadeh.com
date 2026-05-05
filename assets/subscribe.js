(function () {
  document.querySelectorAll('form[data-substack-redirect]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type=email]');
      var email = input ? input.value.trim() : '';
      if (!email) return;
      var medium = form.dataset.utmMedium || 'site';
      window.location.href =
        'https://ghanemzadeh.substack.com/subscribe?email=' +
        encodeURIComponent(email) +
        '&utm_source=ghanemzadeh.com&utm_medium=' +
        encodeURIComponent(medium);
    });
  });
})();
