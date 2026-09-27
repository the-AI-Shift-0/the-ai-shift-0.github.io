/*
 * relative-dates.js - keeps demo dates recent whenever a page is opened.
 *
 * Mark an element with how many days before today it happened, and how to
 * print it. Negative values are in the future (an upcoming appointment).
 *
 *   <span data-days-ago="1" data-date-format="ddd, MMM D">Sat, Sep 26</span>
 *
 * Tokens: dddd (Thursday) ddd (Thu) MMMM (September) MMM (Sep) D (26)
 *         YYYY (2026) Q (3, the quarter). Everything else prints as-is.
 *
 * The static text inside the element is the fallback if this script fails,
 * so it must already be a recent date in the same format.
 */
(function (root) {
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function daysAgo(n, today) {
    var base = today ? new Date(today.getTime()) : new Date();
    // Build from calendar parts so a DST change never shifts the day.
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() - n);
  }

  function format(date, pattern) {
    return pattern.replace(/dddd|ddd|MMMM|MMM|YYYY|D|Q/g, function (t) {
      switch (t) {
        case 'dddd': return DAYS[date.getDay()];
        case 'ddd': return DAYS[date.getDay()].slice(0, 3);
        case 'MMMM': return MONTHS[date.getMonth()];
        case 'MMM': return MONTHS[date.getMonth()].slice(0, 3);
        case 'YYYY': return String(date.getFullYear());
        case 'D': return String(date.getDate());
        case 'Q': return String(Math.floor(date.getMonth() / 3) + 1);
      }
    });
  }

  function apply(doc, today) {
    var els = doc.querySelectorAll('[data-days-ago][data-date-format]');
    for (var i = 0; i < els.length; i++) {
      var n = parseInt(els[i].getAttribute('data-days-ago'), 10);
      if (isNaN(n)) continue;
      els[i].textContent = format(daysAgo(n, today), els[i].getAttribute('data-date-format'));
    }
    return els.length;
  }

  var api = { daysAgo: daysAgo, format: format, apply: apply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root && root.document) apply(root.document);
})(typeof window !== 'undefined' ? window : null);
