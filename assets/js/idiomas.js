/**
 * KIZUNA LANGUAGE SCHOOL — DEGUSTAÇÃO DE IDIOMAS
 * Controle de abas e áudio interativo nativo (Speech Synthesis)
 */

(function () {
  'use strict';

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ============================================================
     1. GERENCIADOR DE ABAS DE IDIOMAS
     ============================================================ */
  const tabBtns = document.querySelectorAll('[data-lang-tab]');
  const contentSections = {
    ingles: document.getElementById('content-lang-ingles'),
    japones: document.getElementById('content-lang-japones'),
    portugues: document.getElementById('content-lang-portugues')
  };

  function ativarAbaIdioma(langId) {
    const alvo = contentSections[langId] ? langId : 'ingles';

    // Atualiza botões
    tabBtns.forEach((btn) => {
      const isCurrent = btn.getAttribute('data-lang-tab') === alvo;
      btn.classList.toggle('is-active', isCurrent);
      btn.classList.toggle('bg-white', isCurrent);
      btn.classList.toggle('text-navy', isCurrent);
      btn.classList.toggle('bg-white/15', !isCurrent);
      btn.classList.toggle('text-white', !isCurrent);
    });

    // Atualiza seções de conteúdo
    Object.keys(contentSections).forEach((k) => {
      if (contentSections[k]) {
        contentSections[k].classList.toggle('hidden', k !== alvo);
      }
    });

    renderIcons();
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang-tab');
      ativarAbaIdioma(lang);
      
      // Atualiza URL sem recarregar a página
      if (window.history && window.history.replaceState) {
        const newUrl = window.location.pathname + '?lang=' + lang;
        window.history.replaceState(null, '', newUrl);
      }
    });
  });

  // Lê parâmetro da URL na carga inicial (ex: ?lang=japones)
  function verificarParametroUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && contentSections[langParam]) {
      ativarAbaIdioma(langParam);
    } else {
      ativarAbaIdioma('ingles');
    }
  }

  /* ============================================================
     2. REPRODUTOR DE ÁUDIO NATIVO FIDEDIGNO AO TEXTO (WEB SPEECH API)
     ============================================================ */
  let vozesCarregadas = [];

  function carregarVozes() {
    if ('speechSynthesis' in window) {
      vozesCarregadas = window.speechSynthesis.getVoices();
    }
  }

  if ('speechSynthesis' in window) {
    carregarVozes();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = carregarVozes;
    }
  }

  function falarTexto(textoExato, langCode) {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta reprodução de áudio nativa.');
      return;
    }

    if (!textoExato || !textoExato.trim()) return;

    // Cancela qualquer fala anterior em andamento para evitar sobreposição
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textoExato.trim());
    utterance.lang = langCode || 'en-US';
    utterance.rate = 0.90; // Velocidade didática e confortável
    utterance.pitch = 1.0;

    // Procura a melhor voz para o idioma especificado
    if (vozesCarregadas.length === 0) {
      vozesCarregadas = window.speechSynthesis.getVoices();
    }

    const vozCompativel = vozesCarregadas.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(langCode.substring(0, 2).toLowerCase()));
    if (vozCompativel) {
      utterance.voice = vozCompativel;
    }

    window.speechSynthesis.speak(utterance);
  }

  // Adiciona evento de clique em todos os cards de frases e alfabetos com áudio
  document.querySelectorAll('.audio-phrase-card').forEach((card) => {
    card.addEventListener('click', () => {
      // Pega o texto exato do data-phrase configurado no elemento
      let phrase = card.getAttribute('data-phrase');
      
      // Fallback: caso data-phrase não exista, pega o texto principal visível sem aspas
      if (!phrase) {
        const pElem = card.querySelector('p');
        phrase = pElem ? pElem.textContent.replace(/["“”]/g, '').trim() : '';
      }

      const lang = card.getAttribute('data-lang') || 'en-US';

      // Feedback visual momentâneo de reprodução
      card.classList.add('ring-2', 'ring-accent', 'scale-[1.02]');
      setTimeout(() => {
        card.classList.remove('ring-2', 'ring-accent', 'scale-[1.02]');
      }, 600);

      falarTexto(phrase, lang);
    });
  });

  // Inicialização
  verificarParametroUrl();
  renderIcons();
})();
