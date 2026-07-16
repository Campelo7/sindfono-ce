// Footer year
const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (!header) return;
  header.style.boxShadow = window.scrollY > 10
    ? '0 2px 20px rgba(30,64,175,.12)'
    : '0 1px 12px rgba(30,64,175,.06)';
});

// Masks
const cpfInput = document.getElementById('cpf');
if (cpfInput) {
  cpfInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
  });
}

const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v.length <= 10) {
      v = v.replace(/(\d{2})(\d)/, '$1 $2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      v = v.replace(/(\d{2})(\d)/, '$1 $2');
      v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }
    this.value = v;
  });
}

// CEP mask + ViaCEP auto-fill
const cepInput = document.getElementById('cep');
const cepLoading = document.getElementById('cepLoading');

if (cepInput) {
  cepInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    this.value = v;

    if (v.replace('-', '').length === 8) {
      fetchCEP(v.replace('-', ''));
    }
  });
}

async function fetchCEP(cep) {
  if (!cepLoading) return;
  cepLoading.style.display = 'inline-flex';
  cepLoading.classList.add('spinning');
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setFieldIfEmpty('endereco', data.logradouro);
      setFieldIfEmpty('bairro', data.bairro);
      setFieldIfEmpty('cidade', data.localidade);
      const estadoSel = document.getElementById('estado');
      if (estadoSel && data.uf) {
        estadoSel.value = data.uf;
        validateField(estadoSel);
      }
      const complementoField = document.getElementById('complemento');
      if (complementoField && !complementoField.value) complementoField.focus();
    }
  } catch (_) {
    // silently fail – user fills manually
  } finally {
    cepLoading.style.display = 'none';
    cepLoading.classList.remove('spinning');
  }
}

function setFieldIfEmpty(id, value) {
  const el = document.getElementById(id);
  if (el && value) {
    el.value = value;
    validateField(el);
  }
}

// File upload: click + drag & drop
function setupFileUpload(inputId, nameId, areaId) {
  const input = document.getElementById(inputId);
  const nameEl = document.getElementById(nameId);
  const area = document.getElementById(areaId);

  if (!input || !nameEl || !area) return;

  function showFiles(files) {
    if (files.length > 0) {
      const names = Array.from(files).map(f => f.name).join(', ');
      nameEl.textContent = '✓ ' + names;
      area.classList.add('has-file');
      area.classList.remove('drag-over');
    } else {
      nameEl.textContent = '';
      area.classList.remove('has-file');
    }
  }

  input.addEventListener('change', () => showFiles(input.files));

  area.addEventListener('click', (e) => {
    if (e.target !== input) input.click();
  });

  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('drag-over');
  });

  area.addEventListener('dragleave', (e) => {
    if (!area.contains(e.relatedTarget)) area.classList.remove('drag-over');
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const dt = e.dataTransfer;
    if (dt.files.length > 0) {
      try {
        input.files = dt.files;
      } catch (_) {
        // some browsers don't allow direct assignment; show name anyway
      }
      showFiles(dt.files);
      if (input.classList.contains('error')) validateField(input);
    }
  });
}

setupFileUpload('foto_3x4', 'name-foto-3x4', 'area-foto-3x4');
setupFileUpload('comprovante_endereco', 'name-comprovante-endereco', 'area-comprovante-endereco');
setupFileUpload('documento_identidade', 'name-documento-identidade', 'area-documento-identidade');
setupFileUpload('comprovante_crefono', 'name-comprovante-crefono', 'area-comprovante-crefono');

// Validation
function setError(field, show) {
  const group = field.closest('.form-group');
  if (!group) return;
  const errorEl = group.querySelector('.error-msg');
  if (show) {
    field.classList.add('error');
    if (errorEl) errorEl.classList.add('show');
  } else {
    field.classList.remove('error');
    if (errorEl) errorEl.classList.remove('show');
  }
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
}

function validateField(field) {
  if (field.type === 'file') {
    const valid = field.files && field.files.length > 0;
    setError(field, !valid);
    return valid;
  }
  if (field.type === 'email') {
    const valid = isValidEmail(field.value);
    setError(field, !valid);
    return valid;
  }
  if (field.type === 'checkbox') {
    const valid = field.checked;
    setError(field, !valid);
    return valid;
  }
  const valid = field.value.trim() !== '';
  setError(field, !valid);
  return valid;
}

document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
  field.addEventListener('change', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

// Form submit
const form = document.getElementById('formSindicalizacao');
const successMessage = document.getElementById('successMessage');
const btnSubmit = document.getElementById('btnSubmit');

if (form && successMessage && btnSubmit) {
  const btnText = btnSubmit.querySelector('.btn-text');
  const btnLoading = btnSubmit.querySelector('.btn-loading');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    form.querySelectorAll('[required]').forEach(field => {
      if (!validateField(field)) isValid = false;
    });

    const radioGroup = form.querySelectorAll('[name="relacao_trabalhista"]');
    const radioChecked = [...radioGroup].some(r => r.checked);
    const radioError = document.getElementById('error-relacao');
    if (!radioChecked) {
      isValid = false;
      if (radioError) radioError.classList.add('show');
    } else if (radioError) {
      radioError.classList.remove('show');
    }

    const lgpdCheck = document.getElementById('lgpd');
    const lgpdError = document.getElementById('error-lgpd');
    if (!lgpdCheck || !lgpdCheck.checked) {
      isValid = false;
      if (lgpdError) lgpdError.classList.add('show');
    } else if (lgpdError) {
      lgpdError.classList.remove('show');
    }

    if (!isValid) {
      const firstError = form.querySelector('.error, .error-msg.show');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btnSubmit.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1800);
  });
}

function resetForm() {
  if (!form || !successMessage || !btnSubmit) return;
  const btnText = btnSubmit.querySelector('.btn-text');
  const btnLoading = btnSubmit.querySelector('.btn-loading');

  form.reset();
  form.style.display = 'block';
  successMessage.style.display = 'none';
  btnText.style.display = 'inline';
  btnLoading.style.display = 'none';
  btnSubmit.disabled = false;

  ['name-foto-3x4', 'name-comprovante-endereco', 'name-documento-identidade', 'name-comprovante-crefono'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['area-foto-3x4', 'area-comprovante-endereco', 'area-documento-identidade', 'area-comprovante-crefono'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('has-file', 'drag-over');
  });

  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg.show').forEach(el => el.classList.remove('show'));

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Scroll reveal ──────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

// Items individuais (headers de seção, caixas únicas)
document.querySelectorAll(
  '.section-header, .contribuicao-box, .form-section, .pagamento-obs, .diretoria-grupo-title'
).forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// Grids com stagger por filho
document.querySelectorAll(
  '.sobre-cards, .cards-grid, .beneficios-list, .diretoria-grid, .pagamento-grid'
).forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.classList.add('reveal');
    child.style.transitionDelay = `${i * 75}ms`;
    revealObs.observe(child);
  });
});

// Membro cards: stagger mais suave (cada linha redefine)
document.querySelectorAll('.membro-card').forEach((card, i) => {
  if (!card.classList.contains('reveal')) {
    card.classList.add('reveal');
    card.style.transitionDelay = `${(i % 6) * 65}ms`;
    revealObs.observe(card);
  }
});
