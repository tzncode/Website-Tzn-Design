/**
 * TZN Design Studio - Contact Form & Toast Notification System
 * Handles form validation, honeypot spam protection, API submission,
 * and unified native submit button interactions across both direct and SPA navigation.
 */
(function () {
  'use strict';

  // Inject Toast & Button Styles
  const styleId = 'tzn-contact-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Native Framer Button Hover & Active States */
      .framer-GHDMY.framer-f9rvbl,
      .framer-1bhzcsz-container button,
      form.framer-1pi1jlt button[type="submit"] {
        cursor: pointer !important;
        transition: background-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease, opacity 0.2s ease !important;
        pointer-events: auto !important;
      }
      .framer-GHDMY.framer-f9rvbl:hover,
      .framer-1bhzcsz-container button:hover,
      form.framer-1pi1jlt button[type="submit"]:hover {
        background-color: rgba(51, 51, 51, 0.95) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35) !important;
      }
      .framer-GHDMY.framer-f9rvbl:active,
      .framer-1bhzcsz-container button:active,
      form.framer-1pi1jlt button[type="submit"]:active {
        transform: translateY(0px) !important;
        background-color: rgba(35, 35, 35, 1) !important;
      }
      .framer-GHDMY.framer-f9rvbl[disabled],
      form.framer-1pi1jlt button[disabled] {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        transform: none !important;
        box-shadow: none !important;
      }

      /* Hide any external framer Live Preview button */
      .framer-1i9bc6d-container {
        display: none !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }

      /* Field Error Styles */
      .tzn-field-error {
        border-bottom-color: #ff4d4f !important;
      }
      .tzn-field-error-msg {
        color: #ff4d4f;
        font-size: 11px;
        font-family: 'Inter', sans-serif;
        margin-top: 4px;
        opacity: 0;
        transform: translateY(-2px);
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .tzn-field-error-msg.visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Toast Notification Container */
      .tzn-toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column-reverse;
        gap: 10px;
        max-width: calc(100vw - 48px);
        width: 380px;
        pointer-events: none;
      }

      .tzn-toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border-radius: 12px;
        background-color: #1a1a1a;
        color: #fff;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transform: translateY(20px) scale(0.95);
        opacity: 0;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
        position: relative;
        overflow: hidden;
      }

      .tzn-toast--visible {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .tzn-toast--leaving {
        transform: translateY(10px) scale(0.95);
        opacity: 0;
        transition: transform 0.25s ease, opacity 0.25s ease;
      }

      .tzn-toast__icon {
        font-size: 16px;
        line-height: 1;
        flex-shrink: 0;
        margin-top: 2px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tzn-toast--success .tzn-toast__icon { background: rgba(76, 217, 100, 0.2); color: #4cd964; }
      .tzn-toast--error .tzn-toast__icon { background: rgba(255, 59, 48, 0.2); color: #ff3b30; }
      .tzn-toast--info .tzn-toast__icon { background: rgba(0, 153, 255, 0.2); color: #0099ff; }
      .tzn-toast--warning .tzn-toast__icon { background: rgba(255, 204, 0, 0.2); color: #ffcc00; }

      .tzn-toast__body {
        flex: 1;
        min-width: 0;
      }

      .tzn-toast__title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
        color: #fff;
      }

      .tzn-toast__message {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.4;
        word-break: break-word;
      }

      .tzn-toast__close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0 4px;
        margin-left: -4px;
        margin-top: -2px;
        transition: color 0.15s ease;
      }
      .tzn-toast__close:hover { color: #fff; }

      .tzn-toast__progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.25);
        transition: width linear;
      }
      .tzn-toast--success .tzn-toast__progress { background: #4cd964; }
      .tzn-toast--error .tzn-toast__progress { background: #ff3b30; }
      .tzn-toast--info .tzn-toast__progress { background: #0099ff; }
      .tzn-toast--warning .tzn-toast__progress { background: #ffcc00; }

      @media (max-width: 480px) {
        .tzn-toast-container {
          right: 12px;
          bottom: 12px;
          left: 12px;
          width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Toast Container & API
  let toastContainer = null;
  function ensureToastContainer() {
    if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.className = 'tzn-toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('role', 'status');
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  const TOAST_ICONS = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  function showToast({ type = 'info', title = '', message = '', duration = 5000 } = {}) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `tzn-toast tzn-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="tzn-toast__icon">${TOAST_ICONS[type] || ''}</div>
      <div class="tzn-toast__body">
        <div class="tzn-toast__title">${title}</div>
        ${message ? `<div class="tzn-toast__message">${message}</div>` : ''}
      </div>
      <button class="tzn-toast__close" aria-label="Cerrar notificación">&times;</button>
      <div class="tzn-toast__progress" style="width: 100%;"></div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('tzn-toast--visible');
      });
    });

    const progressBar = toast.querySelector('.tzn-toast__progress');
    if (progressBar && duration > 0) {
      progressBar.style.transitionDuration = duration + 'ms';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.width = '0%';
        });
      });
    }

    function dismissToast() {
      toast.classList.remove('tzn-toast--visible');
      toast.classList.add('tzn-toast--leaving');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }

    toast.querySelector('.tzn-toast__close').addEventListener('click', dismissToast);
    if (duration > 0) {
      setTimeout(dismissToast, duration);
    }

    return { dismiss: dismissToast };
  }

  // Submission State & Anti-Spam Cooldown
  let isSubmitting = false;
  let cooldownTimeRemaining = 0;
  let cooldownInterval = null;
  const pageLoadTime = Date.now();

  function clearFieldErrors(form) {
    form.querySelectorAll('.tzn-field-error').forEach(el => el.classList.remove('tzn-field-error'));
    form.querySelectorAll('.tzn-field-error-msg').forEach(el => el.remove());
  }

  function showFieldError(input, msg) {
    if (!input) return;
    input.classList.add('tzn-field-error');
    const parent = input.parentNode || input;
    const existing = parent.querySelector('.tzn-field-error-msg');
    if (existing) existing.remove();
    const errorEl = document.createElement('div');
    errorEl.className = 'tzn-field-error-msg';
    errorEl.textContent = msg;
    parent.appendChild(errorEl);
    requestAnimationFrame(() => errorEl.classList.add('visible'));
  }

  function getButtonTextElement(btn) {
    return btn.querySelector('p') || btn;
  }

  function updateButtonState(btn, text, disabled) {
    if (!btn) return;
    btn.disabled = disabled;
    const textEl = getButtonTextElement(btn);
    if (textEl) {
      textEl.textContent = text;
    }
  }

  function startCooldown(btn, seconds) {
    cooldownTimeRemaining = seconds;
    if (!btn) return;
    updateButtonState(btn, `Esperar ${cooldownTimeRemaining}s...`, true);

    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
      cooldownTimeRemaining--;
      if (cooldownTimeRemaining <= 0) {
        clearInterval(cooldownInterval);
        updateButtonState(btn, 'Submit', false);
      } else {
        updateButtonState(btn, `Esperar ${cooldownTimeRemaining}s...`, true);
      }
    }, 1000);
  }

  async function handleContactSubmit(form) {
    if (isSubmitting || cooldownTimeRemaining > 0) return;

    const submitBtn = form.querySelector('button[type="submit"]') ||
                      form.querySelector('.framer-f9rvbl') ||
                      document.querySelector('.framer-1bhzcsz-container button');

    clearFieldErrors(form);

    // 1. Bot Honeypot Validation
    const honeypotNames = ['website', 'company', 'title', 'description', 'feedback', 'notes', 'details', 'remarks', 'comments'];
    const honeypotData = {};
    let isBot = false;

    honeypotNames.forEach(fieldName => {
      const field = form.querySelector(`input[type="text"][name="${fieldName}"][tabindex="-1"]`);
      const val = field ? field.value : '';
      honeypotData[fieldName] = val;
      if (val) isBot = true;
    });

    const hpMessage = form.querySelector('input[type="text"][name="message"][tabindex="-1"]');
    const hpMessageVal = hpMessage ? hpMessage.value : '';
    honeypotData['message'] = hpMessageVal;
    if (hpMessageVal) isBot = true;

    const hpSubject = form.querySelector('input[type="text"][name="subject"][tabindex="-1"]');
    const hpSubjectVal = hpSubject ? hpSubject.value : '';
    honeypotData['subject'] = hpSubjectVal;
    if (hpSubjectVal) isBot = true;

    if (isBot) {
      console.warn('[TZN] Honeypot triggered');
      form.reset();
      return;
    }

    // 2. Field Data Extraction
    const nameInputs = form.querySelectorAll('input[name="Name"]');
    const firstName = nameInputs[0] ? nameInputs[0].value.trim() : '';
    const lastName = nameInputs[1] ? nameInputs[1].value.trim() : '';
    const name = (firstName + ' ' + lastName).trim();

    const emailInput = form.querySelector('input[type="email"]') || form.querySelector('input[name="Email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    const categorySelect = form.querySelector('select[name="Category"]') || form.querySelector('select');
    const category = categorySelect ? categorySelect.value : '';

    const messageTextarea = form.querySelector('textarea[name="Message"]') || form.querySelector('textarea');
    const message = messageTextarea ? messageTextarea.value.trim() : '';

    // 3. Validation
    let hasErrors = false;
    if (!firstName) {
      showFieldError(nameInputs[0], 'Ingresá tu nombre');
      hasErrors = true;
    }
    if (!email) {
      showFieldError(emailInput, 'Ingresá tu email');
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(emailInput, 'El email no es válido');
      hasErrors = true;
    }
    if (!message) {
      showFieldError(messageTextarea, 'Escribí tu mensaje');
      hasErrors = true;
    }

    if (hasErrors) {
      showToast({
        type: 'warning',
        title: 'Campos incompletos',
        message: 'Por favor completá los campos requeridos antes de enviar.',
        duration: 4000
      });
      return;
    }

    // 4. Submit to /api/send-email
    isSubmitting = true;
    updateButtonState(submitBtn, 'Enviando...', true);

    showToast({
      type: 'info',
      title: 'Enviando mensaje...',
      message: 'Estamos procesando tu solicitud, por favor espera.',
      duration: 3000
    });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: category ? ('Categoría: ' + category) : 'Consulta de contacto',
          message: message,
          _loadedAt: pageLoadTime,
          _submissionDuration: Date.now() - pageLoadTime,
          honeypots: honeypotData
        })
      });

      let result;
      try {
        result = await response.json();
      } catch (_) {
        result = {};
      }

      if (response.ok && (result.success || response.status === 200)) {
        form.reset();

        showToast({
          type: 'success',
          title: '¡Mensaje enviado con éxito!',
          message: 'Nos pondremos en contacto a la brevedad. ¡Gracias por escribirnos!',
          duration: 6000
        });

        startCooldown(submitBtn, 60);
      } else {
        throw new Error(result.error || 'Error al enviar el correo');
      }
    } catch (error) {
      console.error('[TZN] Error enviando formulario:', error);
      showToast({
        type: 'error',
        title: 'No se pudo enviar el mensaje',
        message: error.message || 'Ocurrió un error. Por favor intentá de nuevo o escribinos a tescuchamos@tzndesign.com',
        duration: 7000
      });
      updateButtonState(submitBtn, 'Submit', false);
    } finally {
      isSubmitting = false;
    }
  }

  // Intercept submit on document in capture phase (before React/Framer no-op handlers)
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form && (form.classList.contains('framer-1pi1jlt') || form.closest('form.framer-1pi1jlt') || form.querySelector('textarea[name="Message"]'))) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      handleContactSubmit(form.tagName === 'FORM' ? form : form.closest('form'));
    }
  }, true);

  // Intercept direct clicks on the Submit button inside the contact form
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const form = btn.closest('form.framer-1pi1jlt') || btn.closest('.framer-d372oe')?.querySelector('form') || document.querySelector('form.framer-1pi1jlt');
    if (form && (btn.type === 'submit' || btn.classList.contains('framer-f9rvbl') || btn.closest('.framer-1bhzcsz-container'))) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      handleContactSubmit(form);
    }
  }, true);

  // Expose showToast globally
  window.showToast = showToast;
})();
