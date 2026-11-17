/* =========================================================
   contact.js — 견적 문의 폼 (유효성 검사 + 메일 전송)
   ---------------------------------------------------------
   * 서버 없이 Web3Forms(https://web3forms.com) 를 통해
     config.js 에 등록한 Access Key 의 이메일(네이버 메일)로 바로 전송됩니다.
   * 입력 항목을 추가하려면 index.html 폼에 name 속성이 있는 input 만 추가하면
     자동으로 메일 본문에 포함됩니다. (name 값이 메일의 항목명이 됩니다)
   ========================================================= */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var CONFIG = window.SITE_CONFIG || {};
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var statusEl = document.getElementById('formStatus');
  var submitBtn = form.querySelector('.contact-form__submit');

  var MESSAGES = {
    required: '필수 입력 항목입니다.',
    email: '올바른 이메일 주소를 입력해 주세요.',
    phone: '올바른 연락처를 입력해 주세요.',
    agree: '개인정보 수집 및 이용에 동의해 주세요.',
    sending: '전송 중입니다...',
    success: '문의가 정상적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
    fail: '전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.',
    noKey: '메일 전송 설정이 완료되지 않았습니다. (config.js 의 Access Key 를 입력해 주세요)'
  };

  /* ---------- 유효성 검사 ---------- */
  function setError(input, msg) {
    var wrap = input.type === 'checkbox' ? input.closest('.agree') : input.closest('.field');
    if (!wrap) return;
    var old = wrap.querySelector('.field__error');
    if (old) old.parentNode.removeChild(old);
    wrap.classList.toggle('is-error', !!msg);
    if (msg && input.type !== 'checkbox') {
      var p = document.createElement('span');
      p.className = 'field__error';
      p.textContent = msg;
      wrap.appendChild(p);
    }
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validateField(input) {
    var v = (input.value || '').trim();
    var msg = '';
    if (input.type === 'checkbox') {
      if (input.required && !input.checked) msg = MESSAGES.agree;
    } else if (input.required && !v) {
      msg = MESSAGES.required;
    } else if (v && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg = MESSAGES.email;
    } else if (v && input.type === 'tel' && !/^[0-9\-+\s()]{9,20}$/.test(v)) {
      msg = MESSAGES.phone;
    }
    setError(input, msg);
    return !msg;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll('input:not(.hp-field), select, textarea'));

  fields.forEach(function (input) {
    var evt = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'blur';
    input.addEventListener(evt, function () { validateField(input); });
    // 에러 상태에서 다시 입력하면 바로 재검사
    input.addEventListener('input', function () {
      var wrap = input.closest('.field') || input.closest('.agree');
      if (wrap && wrap.classList.contains('is-error')) validateField(input);
    });
  });

  // 연락처 자동 하이픈 (010-1234-5678)
  var phone = form.querySelector('input[type="tel"]');
  if (phone) {
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/[^0-9]/g, '').slice(0, 11);
      if (d.length < 4) phone.value = d;
      else if (d.length < 8) phone.value = d.slice(0, 3) + '-' + d.slice(3);
      else if (d.length < 11) phone.value = d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
      else phone.value = d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
    });
  }

  /* ---------- 상태 표시 ---------- */
  function setStatus(type, msg) {
    if (!statusEl) return;
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
    statusEl.textContent = msg || '';
  }
  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.classList.toggle('is-loading', on);
    submitBtn.disabled = on;
  }

  /* ---------- 전송 ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // 스팸봇 차단 (숨김 필드가 체크되어 있으면 무시)
    var hp = form.querySelector('.hp-field');
    if (hp && hp.checked) return;

    var firstInvalid = null;
    fields.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus('error', '입력 내용을 다시 확인해 주세요.');
      return;
    }

    var key = CONFIG.WEB3FORMS_ACCESS_KEY;
    if (!key || key.indexOf('YOUR_') === 0) {
      setStatus('error', MESSAGES.noKey);
      return;
    }

    // 폼 데이터 → JSON
    var data = {
      access_key: key,
      subject: CONFIG.MAIL_SUBJECT || '홈페이지 견적 문의',
      from_name: CONFIG.FROM_NAME || '홈페이지',
      botcheck: false
    };
    fields.forEach(function (input) {
      if (!input.name) return;
      data[input.name] = input.type === 'checkbox' ? (input.checked ? '동의함' : '미동의') : input.value.trim();
    });
    // 메일에서 '답장' 누르면 문의자에게 바로 회신되도록
    data.replyto = data.email;

    setLoading(true);
    setStatus('', MESSAGES.sending);

    sendJSON(ENDPOINT, data, function (ok) {
      setLoading(false);
      if (ok) {
        form.reset();
        fields.forEach(function (input) { setError(input, ''); });
        setStatus('success', MESSAGES.success);
      } else {
        setStatus('error', MESSAGES.fail);
      }
    });
  });

  // fetch 가 없는 구형 브라우저는 XMLHttpRequest 로 전송
  function sendJSON(url, payload, done) {
    var body = JSON.stringify(payload);
    if (window.fetch) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return res.ok && j.success !== false; }); })
        .then(done)
        .catch(function () { done(false); });
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) done(xhr.status >= 200 && xhr.status < 300);
      };
      xhr.send(body);
    }
  }
})();
