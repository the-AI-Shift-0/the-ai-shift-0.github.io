/*
 * relative-dates.js - keeps demo dates recent whenever a page is opened.
 *
 * Mark an element with how many days before today it happened, and how to
 * print it. Negative values are in the future (an upcoming appointment).
 *
 *   <span data-days-ago="1" data-date-format="ddd, MMM D">Sat, Sep 26</span>
 *
 * Add data-weekdays-only to an event that must fall Monday to Friday.
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

  // An event that only happens on a business day (a booked session, a sales
  // call) never lands on a weekend. It moves to the NEAREST weekday - Saturday
  // back to Friday, Sunday on to Monday - so it shifts by one day at most and
  // stays inside any window around it. If that would cross today (a past
  // event becoming today or later, or the reverse) it goes the other way.
  function resolve(n, weekdaysOnly, today) {
    if (!weekdaysOnly) return daysAgo(n, today);
    var day = daysAgo(n, today).getDay();
    if (day !== 0 && day !== 6) return daysAgo(n, today);
    var shift = day === 6 ? 1 : -1;            // in days-ago units: +1 = a day earlier
    var m = n + shift;
    if ((n > 0 && m <= 0) || (n < 0 && m >= 0)) m = n - 2 * shift;
    return daysAgo(m, today);
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
      var d = resolve(n, els[i].hasAttribute('data-weekdays-only'), today);
      els[i].textContent = format(d, els[i].getAttribute('data-date-format'));
    }
    return els.length;
  }

  var api = { daysAgo: daysAgo, resolve: resolve, format: format, apply: apply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root && root.document) apply(root.document);
})(typeof window !== 'undefined' ? window : null);
