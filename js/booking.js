/* ==========================================================================
   JYGA ARCHITECTS — booking.js
   Handles the appointment-type pills and time-slot picker on booking.html.
   Actual form submission (the fake "request noted" confirmation) is already
   handled generically by main.js via the [data-contact-form] attribute —
   no duplicate logic needed here.
   ========================================================================== */

/* ==========================================================
   JYGA ARCHITECTS — booking.js
   Appointment selection and Web3Forms submission
   ========================================================== */

(function () {
  "use strict";

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var dateInput = document.getElementById("preferredDate");
  var typeInput = document.getElementById("appointmentType");
  var timeInput = document.getElementById("preferredTime");
  var note = form.querySelector("[data-form-note]");
  var submitBtn = form.querySelector('button[type="submit"]');

  /* ---------- Minimum selectable date ---------- */

  function getToday() {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");

    return yyyy + "-" + mm + "-" + dd;
  }

  if (dateInput) {
    dateInput.min = getToday();
  }

  /* ---------- Appointment type and time selection ---------- */

  function wirePillGroup(gridId, hiddenInput) {
    var grid = document.getElementById(gridId);
    if (!grid || !hiddenInput) return;

    grid.querySelectorAll("button").forEach(function (btn) {
      if (btn.classList.contains("is-unavailable")) {
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
        return;
      }

      btn.setAttribute("aria-pressed", "false");

      btn.addEventListener("click", function () {
        grid.querySelectorAll("button").forEach(function (b) {
          b.classList.remove("is-selected");
          b.setAttribute("aria-pressed", "false");
        });

        btn.classList.add("is-selected");
        btn.setAttribute("aria-pressed", "true");

        hiddenInput.value = btn.dataset.value;
      });
    });
  }

  wirePillGroup("typePillGrid", typeInput);
  wirePillGroup("timeSlotGrid", timeInput);

  /* ---------- Status message ---------- */

  function showMessage(message, isError) {
    if (!note) return;

    note.textContent = message;
    note.hidden = false;
    note.setAttribute("role", isError ? "alert" : "status");
  }

  /* ---------- Reset selected pills ---------- */

  function resetSelections() {
    ["typePillGrid", "timeSlotGrid"].forEach(function (id) {
      var grid = document.getElementById(id);
      if (!grid) return;

      grid.querySelectorAll("button").forEach(function (btn) {
        btn.classList.remove("is-selected");
        btn.setAttribute("aria-pressed", "false");
      });
    });
  }

  /* ---------- Submit appointment request ---------- */

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (submitBtn.disabled) return;

    // Validate standard HTML fields
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Validate appointment type
    if (!typeInput.value) {
      showMessage("Please select an appointment type.", true);
      return;
    }

    // Validate preferred time
    if (!timeInput.value) {
      showMessage("Please select your preferred time.", true);
      return;
    }

    // Validate selected date
    if (!dateInput.value || dateInput.value < getToday()) {
      showMessage("Please select a valid future date.", true);
      return;
    }

    // Prevent duplicate submission
    submitBtn.disabled = true;

    showMessage("Sending your appointment request...", false);

    try {
      var formData = new FormData(form);

      var response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      var result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Appointment request failed.");
      }

      // Reset only after successful submission
      form.reset();
      resetSelections();

      showMessage(
        "Thank you! Your appointment request has been sent successfully. Our team will review your preferred date and time and contact you to confirm the appointment.",
        false,
      );
    } catch (error) {
      console.error("Booking form error:", error);

      showMessage(
        "Sorry, we couldn't send your appointment request. Please try again or contact jyga@jyga-architects.com.",
        true,
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
