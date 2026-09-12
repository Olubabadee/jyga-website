/* ==========================================================================
   JYGA ARCHITECTS — booking.js
   Handles the appointment-type pills and time-slot picker on booking.html.
   Actual form submission (the fake "request noted" confirmation) is already
   handled generically by main.js via the [data-contact-form] attribute —
   no duplicate logic needed here.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Minimum selectable date = today ---------- */
  var dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  /* ---------- Single-select pill groups (appointment type, time slot) ---------- */
  function wirePillGroup(gridId, hiddenInputId) {
    var grid = document.getElementById(gridId);
    var hidden = document.getElementById(hiddenInputId);
    if (!grid || !hidden) return;

    grid.querySelectorAll('button').forEach(function (btn) {
      if (btn.classList.contains('is-unavailable')) return;
      btn.addEventListener('click', function () {
        grid.querySelectorAll('button').forEach(function (b) {
          b.classList.remove('is-selected');
        });
        btn.classList.add('is-selected');
        hidden.value = btn.dataset.value;
      });
    });
  }

  wirePillGroup('typePillGrid', 'appointmentType');
  wirePillGroup('timeSlotGrid', 'preferredTime');
})();
