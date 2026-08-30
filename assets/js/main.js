/**
 * ============================================================
 * JAVASCRIPT PRINCIPAL — KIZUNA LANGUAGE SCHOOL
 * ============================================================
 * 1) Inicialização de Ícones Lucide
 * 2) Header Fixo Inteligente
 * 3) Menu Mobile (Hamburger) com Acessibilidade
 * 4) FAQ Accordion Interativo
 * 5) Animações de Entrada (Reveal on Scroll)
 * 6) Aplicação Dinâmica de KIZUNA_CONFIG
 * 7) Validação e Envio de Formulário (HTTP ou WhatsApp)
 */

(function () {
  'use strict';

  /* Utilitário: verifica se um valor foi configurado e não é um placeholder */
  const definido = (v) => typeof v === 'string' && v.trim() !== '' && !v.trim().startsWith('[');

  /* ---------- 1) Ícones Lucide ---------- */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Executa no carregamento e após atualizações dinâmicas
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderIcons);
  } else {
    renderIcons();
  }

  /* ---------- 2) Header: Fundo e sombra ao rolar ---------- */
  const header = document.getElementById('site-header');
  const HEADER_SOLID = ['bg-white/90', 'backdrop-blur-xl', 'border-navy/10', 'shadow-soft'];

  function atualizarHeader() {
    if (!header) return;
    const rolou = window.scrollY > 16;
    HEADER_SOLID.forEach((c) => header.classList.toggle(c, rolou));
    header.classList.toggle('border-transparent', !rolou);
  }

  atualizarHeader();
  window.addEventListener('scroll', atualizarHeader, { passive: true });

  /* ---------- 2.1) Ano Atual Dinâmico no Rodapé ---------- */
  const anoEl = document.getElementById('ano-atual');
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }

  /* ---------- 3) Menu Mobile (Hamburger) ---------- */
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');

  function setMenu(aberto) {
    if (!menu || !toggle) return;
    menu.classList.toggle('hidden', !aberto);
    toggle.setAttribute('aria-expanded', String(aberto));
    toggle.setAttribute('aria-label', aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    
    const icone = document.getElementById('menu-icon');
    if (icone) {
      icone.setAttribute('data-lucide', aberto ? 'x' : 'menu');
      renderIcons();
    }
    
    document.body.style.overflow = aberto ? 'hidden' : '';
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) setMenu(false);
    });
  }

  /* ---------- 4) FAQ Accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const botao = item.querySelector('.faq-trigger');
    const painel = item.querySelector('.faq-panel');
    const icone = item.querySelector('.faq-icon');

    if (!botao || !painel) return;

    botao.addEventListener('click', () => {
      const aberto = botao.getAttribute('aria-expanded') === 'true';

      // Fecha os demais itens (comportamento exclusivo de acordeão)
      document.querySelectorAll('.faq-item').forEach((outro) => {
        if (outro === item) return;
        const outroBotao = outro.querySelector('.faq-trigger');
        const outroPainel = outro.querySelector('.faq-panel');
        const outroIcone = outro.querySelector('.faq-icon');

        if (outroBotao) outroBotao.setAttribute('aria-expanded', 'false');
        if (outroPainel) outroPainel.style.maxHeight = null;
        if (outroIcone) outroIcone.style.transform = 'rotate(0deg)';
      });

      botao.setAttribute('aria-expanded', String(!aberto));
      painel.style.maxHeight = aberto ? null : painel.scrollHeight + 'px';
      if (icone) {
        icone.style.transform = aberto ? 'rotate(0deg)' : 'rotate(45deg)';
      }
    });
  });

  /* ---------- 5) Animações de Entrada (Reveal on Scroll) ---------- */
  const alvos = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada, i) => {
          if (!entrada.isIntersecting) return;
          setTimeout(() => {
            entrada.target.classList.add('is-visible');
          }, Math.min(i * 70, 280));
          obs.unobserve(entrada.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    alvos.forEach((el) => obs.observe(el));
  } else {
    alvos.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 6) Aplicar KIZUNA_CONFIG na página ---------- */
  const cfg = window.KIZUNA_CONFIG || {};

  // Gerador de link do WhatsApp
  const linkWhatsApp = (texto) => {
    if (!definido(cfg.whatsapp)) return null;
    const numero = cfg.whatsapp.replace(/\D/g, '');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto || cfg.mensagem || '');
  };

  // Botões de WhatsApp
  document.querySelectorAll('[data-whatsapp]').forEach((a) => {
    const url = linkWhatsApp();
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      a.href = '#contato';
      a.title = 'Configure o número de WhatsApp em assets/js/config.js';
    }
  });

  // Redes Sociais
  document.querySelectorAll('[data-social]').forEach((a) => {
    const url = cfg[a.dataset.social];
    if (definido(url)) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      a.href = '#';
      a.setAttribute('aria-disabled', 'true');
      a.title = 'Configure este link em assets/js/config.js';
    }
  });

  // Dados de texto (E-mail, telefone, endereço, horário)
  document.querySelectorAll('[data-cfg]').forEach((el) => {
    const chave = el.dataset.cfg;
    const valor = cfg[chave];
    if (!definido(valor)) return;
    
    el.textContent = valor;
    if (chave === 'email') {
      el.innerHTML = '<a class="underline underline-offset-4 hover:opacity-80 transition" href="mailto:' + valor + '">' + valor + '</a>';
    }
    if (chave === 'telefone') {
      el.innerHTML = '<a class="underline underline-offset-4 hover:opacity-80 transition" href="tel:' + valor.replace(/[^\d+]/g, '') + '">' + valor + '</a>';
    }
  });

  /* ---------- 7) Formulário de Contato e Matrícula ---------- */
  const form = document.getElementById('kizuna-form');
  const feedback = document.getElementById('form-feedback');

  const mostrarFeedback = (mensagem, tipo) => {
    if (!feedback) return;
    feedback.textContent = mensagem;
    feedback.classList.remove('hidden');
    feedback.className =
      'rounded-xl2 border px-4 py-3.5 text-[14.5px] transition duration-300 ' +
      (tipo === 'erro'
        ? 'border-accent/30 bg-accent/5 text-accent'
        : 'border-emerald-600/25 bg-emerald-50 text-emerald-800');
  };

  const marcarErro = (campo, erro) => {
    if (!campo) return;
    campo.classList.toggle('border-accent', erro);
    campo.classList.toggle('border-navy/15', !erro);
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const obrigatorios = [form.nome, form.email, form.idioma];
      let valido = true;

      obrigatorios.forEach((campo) => {
        if (!campo) return;
        const vazio = !campo.value.trim();
        const emailInvalido = campo.type === 'email' && campo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value);
        const erro = vazio || emailInvalido;
        marcarErro(campo, erro);
        if (erro && valido) {
          campo.focus();
          valido = false;
        }
      });

      if (!valido) {
        mostrarFeedback('Por favor, preencha os campos obrigatórios destacados.', 'erro');
        return;
      }

      const dados = {
        nome: form.nome.value.trim(),
        email: form.email.value.trim(),
        telefone: form.telefone ? form.telefone.value.trim() : '',
        idioma: form.idioma.value,
        nivel: form.nivel ? form.nivel.value : '',
        mensagem: form.mensagem ? form.mensagem.value.trim() : ''
      };

      // Opção A: Endpoint de API configurado (ex: Formspree)
      if (definido(cfg.formEndpoint)) {
        try {
          const btnSubmit = form.querySelector('button[type="submit"]');
          if (btnSubmit) btnSubmit.disabled = true;

          const resposta = await fetch(cfg.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(dados)
          });

          if (!resposta.ok) throw new Error('Falha no envio');
          form.reset();
          mostrarFeedback('Mensagem enviada com sucesso! Em breve entraremos em contato para agendar sua aula.', 'ok');
        } catch (erro) {
          mostrarFeedback('Não foi possível enviar no momento. Por favor, tente novamente ou fale conosco diretamente pelo WhatsApp.', 'erro');
        } finally {
          const btnSubmit = form.querySelector('button[type="submit"]');
          if (btnSubmit) btnSubmit.disabled = false;
        }
        return;
      }

      // Opção B: Redirecionamento com mensagem estruturada para o WhatsApp
      const texto =
        'Olá! Vim pelo site da Kizuna Language School.\n\n' +
        '👤 Nome: ' + dados.nome + '\n' +
        '✉️ E-mail: ' + dados.email + '\n' +
        (dados.telefone ? '📞 Telefone: ' + dados.telefone + '\n' : '') +
        '🌐 Idioma de interesse: ' + dados.idioma + '\n' +
        (dados.nivel ? '📊 Nível atual: ' + dados.nivel + '\n' : '') +
        (dados.mensagem ? '\n💬 Mensagem: ' + dados.mensagem : '');

      const url = linkWhatsApp(texto);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        mostrarFeedback('Abrimos o WhatsApp com suas informações prontas para envio. Até logo!', 'ok');
      } else {
        mostrarFeedback('Formulário pronto para envio! Defina o número de WhatsApp em assets/js/config.js para enviar instantaneamente.', 'erro');
      }
    });

    // Limpa erros ao digitar ou selecionar opções
    form.querySelectorAll('input, select, textarea').forEach((campo) => {
      campo.addEventListener('input', () => marcarErro(campo, false));
      campo.addEventListener('change', () => marcarErro(campo, false));
    });
  }

  /* ---------- 8) Modal de Apostilas & Sistema de Códigos de Uso Único ---------- */
  const modalApostila = document.getElementById('modal-apostila');
  const btnFecharModal = document.getElementById('fechar-modal-apostila');
  const modalTitulo = document.getElementById('modal-apostila-titulo');
  const modalBandeira = document.getElementById('modal-apostila-bandeira');
  const modalDescricao = document.getElementById('modal-apostila-descricao');
  const formCodigoAluno = document.getElementById('form-codigo-aluno');
  const inputCodigoAluno = document.getElementById('input-codigo-aluno');
  const feedbackAluno = document.getElementById('feedback-codigo-aluno');
  const btnSolicitarWhats = document.getElementById('btn-solicitar-apostila-whats');

  const dadosApostilas = {
    ingles: {
      nome: 'Apostila 1: Fundamentos (Nível Iniciante)',
      bandeira: '📘',
      cursoNome: 'Volume 1 (Fundamentos)',
      arquivo: 'assets/docs/apostila-vol1-fundamentos.pdf',
      descricao: 'Volume 1 completo: Alfabeto, Fonética Comparada, Saudações, Apresentações, Números e Estrutura SVO vs SOV (12 Páginas).'
    },
    japones: {
      nome: 'Apostila 2: Construção & Prática (Nível Básico)',
      bandeira: '📗',
      cursoNome: 'Volume 2 (Construção)',
      arquivo: 'assets/docs/apostila-vol2-construcao.pdf',
      descricao: 'Volume 2 completo: Vocabulário Temático em 4 Colunas (Família, Casa, Comida, Animais, Trabalho), Partículas e Diálogos Reais (16 Páginas).'
    },
    portugues: {
      nome: 'Apostila 3: Desenvolvimento & Fluência (Nível Intermediário)',
      bandeira: '📕',
      cursoNome: 'Volume 3 (Conversação)',
      arquivo: 'assets/docs/apostila-vol3-conversacao.pdf',
      descricao: 'Volume 3 completo: Silabários, 20+ Kanji Fundamentais, Gramática Avançada, Desafios, Teste Final e Certificado Oficial (14 Páginas).'
    }
  };

  let apostilaSelecionada = 'ingles';

  /* --- Gerenciador de Códigos de Uso Único e Específicos por Curso --- */
  function obterCodigosUsados() {
    try {
      const raw = localStorage.getItem('KIZUNA_CODIGOS_USADOS');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function marcarCodigoComoUsado(codigo) {
    try {
      const usados = obterCodigosUsados();
      const codNorm = codigo.trim().toUpperCase();
      if (!usados.includes(codNorm)) {
        usados.push(codNorm);
        localStorage.setItem('KIZUNA_CODIGOS_USADOS', JSON.stringify(usados));
      }
    } catch (e) {
      console.warn('Erro ao salvar código usado no storage', e);
    }
  }

  function obterCodigosGerados() {
    try {
      const raw = localStorage.getItem('KIZUNA_CODIGOS_GERADOS');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function registrarCodigoGerado(codigo, curso) {
    try {
      const gerados = obterCodigosGerados();
      gerados[codigo.trim().toUpperCase()] = {
        curso: curso,
        geradoEm: new Date().toISOString()
      };
      localStorage.setItem('KIZUNA_CODIGOS_GERADOS', JSON.stringify(gerados));
    } catch (e) {
      console.warn('Erro ao registrar código gerado no storage', e);
    }
  }

  // Gera código único que libera toda a coleção
  function gerarCodigoUnico(curso) {
    const sufixoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const codigo = 'KIZUNA-VIP-' + sufixoAleatorio;
    registrarCodigoGerado(codigo, 'combo');
    return codigo;
  }

  // Validação: Qualquer código válido ou conta de aluno libera TODOS os 3 volumes
  function validarEConsumirCodigo(codigoInput, cursoAlvo) {
    const rawInput = (codigoInput || '').trim();
    const cod = rawInput.toUpperCase();
    const rawLower = rawInput.toLowerCase();

    if (!rawInput) {
      return { valido: false, erro: 'vazio', mensagem: 'Por favor, insira o código de acesso ou senha de aluno / administrador.' };
    }

    // 1. RECONHECIMENTO AUTOMÁTICO DE ADMINISTRADOR OU CONTA MASTER
    if (cod === 'ADMIN' || cod === 'KIZUNA2026' || rawLower === 'admin@kizuna.com' || cod === 'KIZUNA-ADMIN') {
      const sessaoAdmin = {
        nome: 'Administrador (Acesso Total)',
        login: 'admin@kizuna.com',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      };
      localStorage.setItem('KIZUNA_SESSAO_ALUNO', JSON.stringify(sessaoAdmin));
      atualizarEstadoLoginUI();

      return {
        valido: true,
        cursoDoCodigo: 'combo',
        mensagem: '👑 <strong>Acesso Concedido!</strong> Todos os 3 volumes da Coleção Didática foram liberados.'
      };
    }

    // Reconhecimento de Senha de Aluno / VIP
    if (cod === 'SENHA123' || rawLower === 'aluno.vip@kizuna.com' || rawLower === 'aluno@kizuna.com' || cod === 'KIZUNA-VIP-2026') {
      const sessaoVip = {
        nome: 'Aluno Kizuna (Coleção Completa)',
        login: 'aluno@kizuna.com',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      };
      localStorage.setItem('KIZUNA_SESSAO_ALUNO', JSON.stringify(sessaoVip));
      atualizarEstadoLoginUI();

      return {
        valido: true,
        cursoDoCodigo: 'combo',
        mensagem: '🌟 <strong>Coleção Didática Completa Desbloqueada!</strong> Todos os 3 volumes estão disponíveis para download.'
      };
    }

    // 2. Verifica se o código já foi consumido anteriormente (uso único)
    const usados = obterCodigosUsados();
    if (usados.includes(cod)) {
      return {
        valido: false,
        erro: 'ja_usado',
        mensagem: '❌ Este código já foi utilizado e expirou. Cada código de acesso avulso é exclusivo e de uso único.'
      };
    }

    // 3. Identifica códigos gerados ou códigos mestres
    const mestres = cfg.apostilas?.codigosMestre || {
      ingles: 'KIZUNA-EN-2026',
      japones: 'KIZUNA-JP-2026',
      portugues: 'KIZUNA-PT-2026',
      combo: 'KIZUNA-VIP-2026'
    };

    const gerados = obterCodigosGerados();
    const codigoValido = gerados[cod] || cod === mestres.ingles?.toUpperCase() || cod === mestres.japones?.toUpperCase() || cod === mestres.portugues?.toUpperCase() || cod === mestres.combo?.toUpperCase() || cod.startsWith('KIZUNA-');

    if (!codigoValido) {
      return {
        valido: false,
        erro: 'invalido',
        mensagem: '❌ Código de acesso ou senha não encontrados. Digite <strong>kizuna2026</strong> ou seu código de compra.'
      };
    }

    // Marca como consumido caso a regra de uso único esteja ativa
    if (cfg.apostilas?.usoUnico !== false) {
      marcarCodigoComoUsado(cod);
    }

    // Cria sessão do aluno com todos os volumes liberados
    const sessaoAluno = {
      nome: 'Aluno Kizuna',
      login: 'aluno@kizuna.com',
      cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
    };
    localStorage.setItem('KIZUNA_SESSAO_ALUNO', JSON.stringify(sessaoAluno));
    atualizarEstadoLoginUI();

    return {
      valido: true,
      cursoDoCodigo: 'combo',
      mensagem: '✨ <strong>Parabéns!</strong> Sua compra liberou a <strong>Coleção Didática Completa (Todos os 3 Volumes)</strong>.'
    };
  }

  function abrirModalApostila(tipo) {
    if (!modalApostila) return;
    const info = dadosApostilas[tipo] || dadosApostilas.ingles;
    apostilaSelecionada = tipo;

    if (modalTitulo) modalTitulo.textContent = 'Coleção Didática Completa (3 Volumes)';
    if (modalBandeira) modalBandeira.textContent = '📚';
    if (modalDescricao) modalDescricao.textContent = 'Compre 1 apostila e leve todos os 3 volumes: Vol 1 (Fundamentos), Vol 2 (Construção) e Vol 3 (Conversação).';

    if (inputCodigoAluno) inputCodigoAluno.value = '';
    
    // Verifica se já está logado
    const sessao = obterSessaoAtual();
    const jaTemAcesso = sessao && sessao.cursos && sessao.cursos.length > 0;

    if (feedbackAluno) {
      if (jaTemAcesso) {
        feedbackAluno.innerHTML =
          '<div class="text-center">' +
          '  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold mb-2">🎉 Coleção Didática Completa Liberada</span>' +
          '  <p class="text-xs text-slateink mb-3">Você tem acesso total a todos os 3 volumes. Baixe cada um abaixo:</p>' +
          '  <div class="space-y-2 text-left">' +
          '    <a href="assets/docs/apostila-vol1-fundamentos.pdf" target="_blank" download class="flex items-center justify-between p-3 rounded-xl bg-navy text-white font-bold text-xs shadow-soft hover:bg-navy-700 transition">' +
          '      <span>📘 Volume 1: Fundamentos (12 Páginas)</span> <i data-lucide="download" class="h-4 w-4 text-accent-soft"></i>' +
          '    </a>' +
          '    <a href="assets/docs/apostila-vol2-construcao.pdf" target="_blank" download class="flex items-center justify-between p-3 rounded-xl bg-[#1d5939] text-white font-bold text-xs shadow-soft hover:bg-[#144229] transition">' +
          '      <span>📗 Volume 2: Construção & Prática (16 Páginas)</span> <i data-lucide="download" class="h-4 w-4 text-accent-soft"></i>' +
          '    </a>' +
          '    <a href="assets/docs/apostila-vol3-conversacao.pdf" target="_blank" download class="flex items-center justify-between p-3 rounded-xl bg-[#8c1d27] text-white font-bold text-xs shadow-soft hover:bg-[#6e151d] transition">' +
          '      <span>📕 Volume 3: Desenvolvimento & Fluência (14 Páginas)</span> <i data-lucide="download" class="h-4 w-4 text-accent-soft"></i>' +
          '    </a>' +
          '  </div>' +
          '</div>';
        feedbackAluno.className = 'mt-4 block rounded-2xl border border-emerald-600/30 bg-emerald-50/70 p-4 text-sm font-medium text-emerald-900';
        feedbackAluno.classList.remove('hidden');
      } else {
        feedbackAluno.classList.add('hidden');
        feedbackAluno.textContent = '';
      }
    }

    modalApostila.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (inputCodigoAluno && !jaTemAcesso) inputCodigoAluno.focus();
    renderIcons();
  }

  function fecharModalApostila() {
    if (!modalApostila) return;
    modalApostila.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Gatilhos de abertura das apostilas
  document.querySelectorAll('[data-abrir-apostila]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tipo = btn.getAttribute('data-abrir-apostila');
      const info = dadosApostilas[tipo] || dadosApostilas.ingles;
      const sessao = obterSessaoAtual();

      if (sessao && (sessao.cursos.includes(tipo) || sessao.cursos.includes('combo') || sessao.cursos.includes('todos'))) {
        // Se já está logado com acesso, baixa direto!
        const link = document.createElement('a');
        link.href = info.arquivo;
        link.setAttribute('download', '');
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      abrirModalApostila(tipo);
    });
  });

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', fecharModalApostila);
  }

  if (modalApostila) {
    modalApostila.addEventListener('click', (e) => {
      if (e.target === modalApostila) fecharModalApostila();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalApostila && !modalApostila.classList.contains('hidden')) {
      fecharModalApostila();
    }
  });

  // Alternância de Abas do Modal (Aluno vs Solicitar Acesso)
  const tabBtnAluno = document.getElementById('tab-btn-aluno');
  const tabBtnSolicitar = document.getElementById('tab-btn-solicitar');
  const tabConteudoAluno = document.getElementById('tab-conteudo-aluno');
  const tabConteudoSolicitar = document.getElementById('tab-conteudo-solicitar');

  function trocarAbaModal(aba) {
    if (!tabConteudoAluno || !tabConteudoSolicitar) return;
    if (aba === 'aluno') {
      tabConteudoAluno.classList.remove('hidden');
      tabConteudoSolicitar.classList.add('hidden');
      if (tabBtnAluno) tabBtnAluno.className = 'flex-1 rounded-xl py-2.5 text-sm font-bold bg-navy text-white shadow-soft transition';
      if (tabBtnSolicitar) tabBtnSolicitar.className = 'flex-1 rounded-xl py-2.5 text-sm font-semibold text-slateink hover:text-navy transition';
      if (inputCodigoAluno) inputCodigoAluno.focus();
    } else {
      tabConteudoAluno.classList.add('hidden');
      tabConteudoSolicitar.classList.remove('hidden');
      if (tabBtnSolicitar) tabBtnSolicitar.className = 'flex-1 rounded-xl py-2.5 text-sm font-bold bg-navy text-white shadow-soft transition';
      if (tabBtnAluno) tabBtnAluno.className = 'flex-1 rounded-xl py-2.5 text-sm font-semibold text-slateink hover:text-navy transition';
    }
  }

  if (tabBtnAluno) tabBtnAluno.addEventListener('click', () => trocarAbaModal('aluno'));
  if (tabBtnSolicitar) tabBtnSolicitar.addEventListener('click', () => trocarAbaModal('solicitar'));

  // Desbloqueio e Consumo de Código de Aluno
  if (formCodigoAluno) {
    formCodigoAluno.addEventListener('submit', (e) => {
      e.preventDefault();
      const resultado = validarEConsumirCodigo(inputCodigoAluno.value, apostilaSelecionada);

      if (!resultado.valido) {
        let estiloErro = 'border-accent/30 bg-accent/5 text-accent';
        if (resultado.erro === 'curso_incompativel') {
          estiloErro = 'border-amber-600/30 bg-amber-50 text-amber-900';
        }
        feedbackAluno.innerHTML = resultado.mensagem;
        feedbackAluno.className = 'mt-3 block rounded-xl border p-3 text-center text-sm font-medium ' + estiloErro;
        return;
      }

      // Sucesso na validação
      // Sucesso na validação - Mostra os 3 volumes para download
      feedbackAluno.innerHTML =
        '<div class="text-center">' +
        '  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold mb-2">🎉 Coleção Didática Completa Desbloqueada!</span>' +
        '  <p class="text-xs text-slateink mb-3">Seu código liberou todos os 3 volumes. Baixe cada um nos botões abaixo:</p>' +
        '  <div class="space-y-2 text-left">' +
        '    <a href="assets/docs/apostila-vol1-fundamentos.pdf" target="_blank" download class="flex items-center justify-between p-3 rounded-xl bg-navy text-white font-bold text-xs shadow-soft hover:bg-navy-700 transition">' +
        '      <span>📘 Volume 1: Fundamentos (12 Páginas)</span> <i data-lucide="download" class="h-4 w-4 text-accent-soft"></i>' +
        '    </a>' +
        '    <a href="assets/docs/apostila-vol2-construcao.pdf" target="_blank" download class="flex items-center justify-between p-3 rounded-xl bg-[#1d5939] text-white font-bold text-xs shadow-soft hover:bg-[#144229] transition">' +
        '      <span>📗 Volume 2: Construção & Prática (16 Páginas)</span> <i data-lucide="download" class="h-4 w-4 text-accent-soft"></i>' +
        '    </a>' +
        '    <a href="assets/docs/apostila-vol3-conversacao.pdf" target="_blank" download class="flex items-center justify-between p-3 rounded-xl bg-[#8c1d27] text-white font-bold text-xs shadow-soft hover:bg-[#6e151d] transition">' +
        '      <span>📕 Volume 3: Desenvolvimento & Fluência (14 Páginas)</span> <i data-lucide="download" class="h-4 w-4 text-accent-soft"></i>' +
        '    </a>' +
        '  </div>' +
        '</div>';
      feedbackAluno.className = 'mt-3 block rounded-2xl border border-emerald-600/30 bg-emerald-50/70 p-4 text-sm font-medium text-emerald-900';

      // Atualiza todos os cards para desbloqueados na página
      ['ingles', 'japones', 'portugues'].forEach((tipo) => {
        const card = document.getElementById('card-apostila-' + tipo);
        const itemInfo = dadosApostilas[tipo] || dadosApostilas.ingles;
        if (card) {
          card.classList.add('is-unlocked');
          const badgeLock = card.querySelector('.badge-lock-status');
          if (badgeLock) {
            badgeLock.innerHTML = '<i data-lucide="unlock" class="h-3.5 w-3.5 text-emerald-600"></i> Desbloqueado';
            badgeLock.className = 'badge-lock-status inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700 shadow-soft';
          }
          const btnAcao = card.querySelector('[data-abrir-apostila]');
          if (btnAcao) {
            btnAcao.href = itemInfo.arquivo;
            btnAcao.setAttribute('download', '');
            btnAcao.removeAttribute('data-abrir-apostila');
            btnAcao.innerHTML = 'Baixar Volume em PDF <i data-lucide="download" class="h-4 w-4"></i>';
            btnAcao.className = 'mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 bg-emerald-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-soft transition hover:bg-emerald-700';
          }
        }
      });

      renderIcons();
    });
  }

  // Solicitação de Desbloqueio via WhatsApp
  if (btnSolicitarWhats) {
    btnSolicitarWhats.addEventListener('click', (e) => {
      e.preventDefault();
      const info = dadosApostilas[apostilaSelecionada] || dadosApostilas.ingles;
      const texto =
        'Olá! Gostaria de receber o código de acesso para a apostila exclusiva:\n\n' +
        '📚 ' + info.nome + '\n\n' +
        'Poderiam me liberar o material?';
      const url = linkWhatsApp(texto);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        fecharModalApostila();
      } else {
        alert('Configure o número do WhatsApp em assets/js/config.js para enviar a solicitação.');
      }
    });
  }

  /* ============================================================
     SISTEMA DE AUTENTICAÇÃO DE ALUNOS (LOGIN & SENHA)
     ============================================================ */
  const modalLogin = document.getElementById('modal-login-aluno');
  const btnFecharLogin = document.getElementById('fechar-modal-login');
  const formLogin = document.getElementById('form-login-aluno');
  const inputLoginEmail = document.getElementById('input-login-email');
  const inputLoginSenha = document.getElementById('input-login-senha');
  const feedbackLogin = document.getElementById('feedback-login-aluno');

  function obterTodosUsuarios() {
    const padrao = cfg.alunos?.usuariosPadrao || [
      { nome: 'Aluno de Inglês', login: 'aluno.ingles@kizuna.com', senha: 'senha123', cursos: ['ingles'] },
      { nome: 'Aluno de Japonês', login: 'aluno.japones@kizuna.com', senha: 'senha123', cursos: ['japones'] },
      { nome: 'Aluno de Português', login: 'aluno.portugues@kizuna.com', senha: 'senha123', cursos: ['portugues'] },
      { nome: 'Aluno VIP', login: 'aluno.vip@kizuna.com', senha: 'senha123', cursos: ['ingles', 'japones', 'portugues'] },
      { nome: 'Admin', login: 'admin@kizuna.com', senha: 'kizuna2026', cursos: ['ingles', 'japones', 'portugues'] }
    ];

    try {
      const cadastrados = JSON.parse(localStorage.getItem('KIZUNA_USUARIOS_CADASTRADOS') || '[]');
      return [...padrao, ...cadastrados];
    } catch (e) {
      return padrao;
    }
  }

  function salvarNovoUsuario(usuario) {
    try {
      const cadastrados = JSON.parse(localStorage.getItem('KIZUNA_USUARIOS_CADASTRADOS') || '[]');
      // Evita duplicar se já existir
      const index = cadastrados.findIndex((u) => u.login.toLowerCase() === usuario.login.toLowerCase());
      if (index >= 0) {
        cadastrados[index] = usuario;
      } else {
        cadastrados.push(usuario);
      }
      localStorage.setItem('KIZUNA_USUARIOS_CADASTRADOS', JSON.stringify(cadastrados));
    } catch (e) {
      console.warn('Erro ao salvar usuário no storage', e);
    }
  }

  function obterSessaoAtual() {
    try {
      const raw = localStorage.getItem('KIZUNA_SESSAO_ALUNO');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function fazerLogin(login, senha) {
    const logNorm = (login || '').trim().toLowerCase();
    const senNorm = (senha || '').trim();

    if (!logNorm || !senNorm) {
      return { sucesso: false, mensagem: 'Por favor, preencha o login (e-mail) e a senha.' };
    }

    const todos = obterTodosUsuarios();
    const usuario = todos.find((u) => u.login.toLowerCase() === logNorm && u.senha === senNorm);

    if (usuario) {
      const sessao = {
        nome: usuario.nome,
        login: usuario.login,
        cursos: usuario.cursos || []
      };
      localStorage.setItem('KIZUNA_SESSAO_ALUNO', JSON.stringify(sessao));
      atualizarEstadoLoginUI();
      return { sucesso: true, usuario: sessao };
    }

    return {
      sucesso: false,
      mensagem: '❌ Login ou senha incorretos. Verifique suas credenciais ou use uma conta de teste abaixo.'
    };
  }

  function fazerLogout() {
    localStorage.removeItem('KIZUNA_SESSAO_ALUNO');
    atualizarEstadoLoginUI();
  }

  function atualizarEstadoLoginUI() {
    const sessao = obterSessaoAtual();
    const btnsLogin = document.querySelectorAll('[data-login-area]');
    const todasApostilas = ['ingles', 'japones', 'portugues'];

    if (sessao) {
      // Usuário está LOGADO
      btnsLogin.forEach((container) => {
        container.innerHTML =
          '<div class="flex items-center gap-2">' +
          '  <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-600/20 px-3 py-1 text-xs font-bold text-emerald-800">' +
          '    <i data-lucide="user-check" class="h-3.5 w-3.5 text-emerald-600"></i> ' +
          sessao.nome +
          '  </span>' +
          '  <button type="button" data-logout-btn class="rounded-lg bg-navy/5 hover:bg-navy/10 px-2.5 py-1 text-xs font-semibold text-slateink hover:text-navy transition">Sair</button>' +
          '</div>';
      });

      // Atualiza os cards das apostilas de acordo com os cursos liberados
      todasApostilas.forEach((tipo) => {
        const card = document.getElementById('card-apostila-' + tipo);
        const info = dadosApostilas[tipo] || dadosApostilas.ingles;
        const temAcesso = sessao.cursos.includes(tipo) || sessao.cursos.includes('combo') || sessao.cursos.includes('todos');

        if (card) {
          if (temAcesso) {
            card.classList.add('is-unlocked');
            const badgeLock = card.querySelector('.badge-lock-status');
            if (badgeLock) {
              badgeLock.innerHTML = '<i data-lucide="unlock" class="h-3.5 w-3.5 text-emerald-600"></i> Aluno Matriculado';
              badgeLock.className = 'badge-lock-status inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700 shadow-soft';
            }
            const btnAcao = card.querySelector('[data-abrir-apostila], [data-abrir-login], a[download]');
            if (btnAcao) {
              btnAcao.href = info.arquivo;
              btnAcao.setAttribute('download', '');
              btnAcao.removeAttribute('data-abrir-apostila');
              btnAcao.removeAttribute('data-abrir-login');
              btnAcao.innerHTML = 'Baixar Volume em PDF <i data-lucide="download" class="h-4 w-4"></i>';
              btnAcao.className = 'mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 bg-emerald-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-soft transition hover:bg-emerald-700';
            }
          } else {
            // Não tem acesso a este idioma
            card.classList.remove('is-unlocked');
            const badgeLock = card.querySelector('.badge-lock-status');
            if (badgeLock) {
              badgeLock.innerHTML = '<i data-lucide="lock" class="h-3.5 w-3.5 text-accent"></i> Não Matriculado';
              badgeLock.className = 'badge-lock-status inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[12px] font-bold text-accent shadow-soft';
            }
            const btnAcao = card.querySelector('[data-abrir-apostila], [data-abrir-login], a[download]');
            if (btnAcao) {
              btnAcao.href = '#';
              btnAcao.removeAttribute('download');
              btnAcao.setAttribute('data-abrir-compras', tipo);
              btnAcao.innerHTML = 'Adquirir Matrícula deste Idioma <i data-lucide="shopping-bag" class="h-4 w-4"></i>';
              btnAcao.className = 'mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 bg-navy px-5 py-3.5 text-[15px] font-semibold text-white shadow-soft transition hover:bg-navy-700';
              btnAcao.onclick = (e) => {
                e.preventDefault();
                abrirModalCompras(tipo);
              };
            }
          }
        }
      });
    } else {
      // Usuário DESLOGADO
      btnsLogin.forEach((container) => {
        container.innerHTML =
          '<button type="button" data-abrir-login class="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13.5px] font-bold text-navy shadow-soft transition hover:bg-navy/5">' +
          '  <i data-lucide="user" class="h-4 w-4 text-accent"></i> Área do Aluno' +
          '</button>';
      });

      // Reseta cards para bloqueados
      todasApostilas.forEach((tipo) => {
        const card = document.getElementById('card-apostila-' + tipo);
        if (card) {
          card.classList.remove('is-unlocked');
          const badgeLock = card.querySelector('.badge-lock-status');
          if (badgeLock) {
            badgeLock.innerHTML = '<i data-lucide="lock" class="h-3.5 w-3.5 text-accent"></i> Bloqueado';
            badgeLock.className = 'badge-lock-status inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[12px] font-bold text-accent shadow-soft';
          }
          const btnAcao = card.querySelector('[data-abrir-apostila], [data-abrir-login], [data-abrir-compras], a[download]');
          if (btnAcao) {
            btnAcao.href = '#';
            btnAcao.removeAttribute('download');
            btnAcao.removeAttribute('data-abrir-compras');
            btnAcao.setAttribute('data-abrir-login', '');
            btnAcao.innerHTML = '<i data-lucide="lock" class="h-4 w-4 text-accent-soft"></i> Fazer Login para Acessar';
            btnAcao.className = 'mt-6 flex w-full items-center justify-center gap-2 rounded-xl2 bg-navy px-5 py-3.5 text-[15px] font-semibold text-white shadow-soft transition hover:bg-navy-700 hover:shadow-lift';
            btnAcao.onclick = (e) => {
              e.preventDefault();
              abrirModalLogin(tipo);
            };
          }
        }
      });
    }

    // Reanexa eventos de logout e login
    document.querySelectorAll('[data-logout-btn]').forEach((btn) => {
      btn.onclick = () => fazerLogout();
    });

    document.querySelectorAll('[data-abrir-login]').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        abrirModalLogin();
      };
    });

    renderIcons();
  }

  function abrirModalLogin(cursoAlvo) {
    if (!modalLogin) return;
    if (feedbackLogin) {
      feedbackLogin.classList.add('hidden');
      feedbackLogin.textContent = '';
    }
    if (inputLoginEmail) inputLoginEmail.value = '';
    if (inputLoginSenha) inputLoginSenha.value = '';

    modalLogin.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (inputLoginEmail) inputLoginEmail.focus();
  }

  function fecharModalLogin() {
    if (!modalLogin) return;
    modalLogin.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (btnFecharLogin) {
    btnFecharLogin.addEventListener('click', fecharModalLogin);
  }

  if (modalLogin) {
    modalLogin.addEventListener('click', (e) => {
      if (e.target === modalLogin) fecharModalLogin();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalLogin && !modalLogin.classList.contains('hidden')) {
      fecharModalLogin();
    }
  });

  // Clique em chips de contas de teste de login
  document.querySelectorAll('.demo-account-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const email = chip.getAttribute('data-email');
      const pass = chip.getAttribute('data-pass');
      if (inputLoginEmail) inputLoginEmail.value = email;
      if (inputLoginSenha) inputLoginSenha.value = pass;
      if (feedbackLogin) {
        feedbackLogin.classList.add('hidden');
      }
    });
  });

  // Clique em chips de código de acesso / admin no modal de apostila
  document.querySelectorAll('.demo-code-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const code = chip.getAttribute('data-code');
      if (inputCodigoAluno) {
        inputCodigoAluno.value = code;
        if (formCodigoAluno) {
          formCodigoAluno.dispatchEvent(new Event('submit'));
        }
      }
    });
  });

  // Formulário de Login
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = fazerLogin(inputLoginEmail.value, inputLoginSenha.value);

      if (res.sucesso) {
        if (feedbackLogin) {
          feedbackLogin.innerHTML = '✨ <strong>Login realizado com sucesso!</strong> Bem-vindo(a), ' + res.usuario.nome + '.';
          feedbackLogin.className = 'mt-3 block rounded-xl border border-emerald-600/30 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-800';
        }
        setTimeout(() => {
          fecharModalLogin();
          window.location.href = 'aluno.html';
        }, 600);
      } else {
        if (feedbackLogin) {
          feedbackLogin.innerHTML = res.mensagem;
          feedbackLogin.className = 'mt-3 block rounded-xl border border-accent/30 bg-accent/5 p-3 text-center text-sm font-medium text-accent';
        }
      }
    });
  }

  /* ---------- 9) Painel / Modal de Compras & Checkout com Criação de Login & Senha ---------- */
  const modalCompras = document.getElementById('modal-compras');
  const btnFecharCompras = document.getElementById('fechar-modal-compras');
  const stepCheckout = document.getElementById('compras-step-checkout');
  const stepSucesso = document.getElementById('compras-step-sucesso');
  const formCheckout = document.getElementById('form-checkout-compras');
  const totalDisplay = document.getElementById('compras-total-display');
  const btnDesbloquearDireto = document.getElementById('btn-desbloquear-direto-compras');
  const sucessoProdutoNome = document.getElementById('compras-sucesso-produto');
  const pixChaveDisplay = document.getElementById('compras-pix-chave');
  const btnCopiarPix = document.getElementById('btn-copiar-pix');

  const comprasLoginDisplay = document.getElementById('compras-login-liberado');
  const comprasSenhaDisplay = document.getElementById('compras-senha-liberada');
  const btnCopiarCredenciais = document.getElementById('btn-copiar-credenciais-compradas');

  let produtoSelecionado = 'combo';
  let ultimoUsuarioCriado = null;

  const todosOsCursos = ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo'];

  const produtosInfo = {
    colecao: { nome: 'Coleção Didática Completa (3 Volumes Inclusos)', preco: 'R$ 47,00', valor: 47, bandeira: '📚', rotulo: 'Todos os 3 Volumes', cursos: todosOsCursos },
    ingles: { nome: 'Coleção Completa (Vol 1, 2 e 3 Inclusos)', preco: 'R$ 47,00', valor: 47, bandeira: '📘', rotulo: 'Todos os 3 Volumes', cursos: todosOsCursos },
    japones: { nome: 'Coleção Completa (Vol 1, 2 e 3 Inclusos)', preco: 'R$ 47,00', valor: 47, bandeira: '📗', rotulo: 'Todos os 3 Volumes', cursos: todosOsCursos },
    portugues: { nome: 'Coleção Completa (Vol 1, 2 e 3 Inclusos)', preco: 'R$ 47,00', valor: 47, bandeira: '📕', rotulo: 'Todos os 3 Volumes', cursos: todosOsCursos },
    combo: { nome: 'Coleção Didática Completa (3 Volumes)', preco: 'R$ 47,00', valor: 47, bandeira: '🌟', rotulo: 'Todos os 3 Volumes', cursos: todosOsCursos }
  };

  function atualizarPrecoTotal() {
    const prod = produtosInfo[produtoSelecionado] || produtosInfo.combo;
    if (totalDisplay) totalDisplay.textContent = prod.preco;
  }

  function abrirModalCompras(prodId) {
    if (!modalCompras) return;
    produtoSelecionado = prodId || 'combo';

    // Reseta visualização para etapa de checkout
    if (stepCheckout) stepCheckout.classList.remove('hidden');
    if (stepSucesso) stepSucesso.classList.add('hidden');

    // Marca item selecionado
    document.querySelectorAll('.compra-item-card').forEach((card) => {
      const id = card.getAttribute('data-produto-id');
      const isSel = id === produtoSelecionado;
      card.classList.toggle('is-selected', isSel);
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = isSel;
    });

    atualizarPrecoTotal();

    // Atualiza chave Pix configurada
    const chavePix = cfg.compras?.chavePix || 'pix@kizunalanguageschool.com';
    if (pixChaveDisplay) pixChaveDisplay.textContent = chavePix;

    modalCompras.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderIcons();
  }

  function fecharModalCompras() {
    if (!modalCompras) return;
    modalCompras.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Gatilhos de abertura da área de compras
  document.querySelectorAll('[data-abrir-compras]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const prodId = el.getAttribute('data-abrir-compras') || 'combo';
      abrirModalCompras(prodId);
    });
  });

  if (btnFecharCompras) {
    btnFecharCompras.addEventListener('click', fecharModalCompras);
  }

  if (modalCompras) {
    modalCompras.addEventListener('click', (e) => {
      if (e.target === modalCompras) fecharModalCompras();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCompras && !modalCompras.classList.contains('hidden')) {
      fecharModalCompras();
    }
  });

  // Seleção de itens de compra
  document.querySelectorAll('.compra-item-card').forEach((card) => {
    card.addEventListener('click', () => {
      produtoSelecionado = card.getAttribute('data-produto-id');
      document.querySelectorAll('.compra-item-card').forEach((c) => {
        const isSel = c === card;
        c.classList.toggle('is-selected', isSel);
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = isSel;
      });
      atualizarPrecoTotal();
    });
  });

  // Formas de Pagamento no Checkout (Pix vs Cartão vs WhatsApp)
  const metodoBtns = document.querySelectorAll('[data-metodo-pagto]');
  const metodoPanels = {
    pix: document.getElementById('painel-pagto-pix'),
    cartao: document.getElementById('painel-pagto-cartao'),
    whatsapp: document.getElementById('painel-pagto-whatsapp')
  };

  metodoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const metodo = btn.getAttribute('data-metodo-pagto');
      metodoBtns.forEach((b) => {
        const ativo = b === btn;
        b.classList.toggle('bg-navy', ativo);
        b.classList.toggle('text-white', ativo);
        b.classList.toggle('bg-sand-100', !ativo);
        b.classList.toggle('text-slateink', !ativo);
      });

      Object.keys(metodoPanels).forEach((k) => {
        if (metodoPanels[k]) {
          metodoPanels[k].classList.toggle('hidden', k !== metodo);
        }
      });
    });
  });

  // Copiar Chave Pix
  if (btnCopiarPix) {
    btnCopiarPix.addEventListener('click', () => {
      const chavePix = cfg.compras?.chavePix || 'pix@kizunalanguageschool.com';
      navigator.clipboard.writeText(chavePix).then(() => {
        const textoOriginal = btnCopiarPix.innerHTML;
        btnCopiarPix.innerHTML = '<i data-lucide="check" class="h-4 w-4 text-emerald-600"></i> Chave Copiada!';
        renderIcons();
        setTimeout(() => {
          btnCopiarPix.innerHTML = textoOriginal;
          renderIcons();
        }, 2500);
      });
    });
  }

  // Finalização do Checkout & Geração Automática de Login e Senha
  if (formCheckout) {
    formCheckout.addEventListener('submit', (e) => {
      e.preventDefault();

      const prod = produtosInfo[produtoSelecionado] || produtosInfo.combo;
      const nomeComprador = (formCheckout.elements['comprador_nome']?.value || 'Aluno Kizuna').trim();
      const emailComprador = (formCheckout.elements['comprador_email']?.value || 'aluno@kizuna.com').trim().toLowerCase();

      // Gera senha segura de 4 dígitos para o aluno (ex: KZ-4819)
      const senhaGerada = 'KZ-' + Math.floor(1000 + Math.random() * 9000);

      // Registra a nova conta de aluno
      ultimoUsuarioCriado = {
        nome: nomeComprador,
        login: emailComprador,
        senha: senhaGerada,
        cursos: prod.cursos
      };
      salvarNovoUsuario(ultimoUsuarioCriado);

      // Transição para a tela de sucesso
      if (stepCheckout) stepCheckout.classList.add('hidden');
      if (stepSucesso) stepSucesso.classList.remove('hidden');

      if (sucessoProdutoNome) sucessoProdutoNome.textContent = prod.nome + ' (' + prod.rotulo + ')';
      if (comprasLoginDisplay) comprasLoginDisplay.textContent = emailComprador;
      if (comprasSenhaDisplay) comprasSenhaDisplay.textContent = senhaGerada;

      renderIcons();
    });
  }

  // Copiar Credenciais (Login e Senha)
  if (btnCopiarCredenciais) {
    btnCopiarCredenciais.addEventListener('click', () => {
      if (!ultimoUsuarioCriado) return;
      const texto = 'Acesso Aluno Kizuna:\nLogin: ' + ultimoUsuarioCriado.login + '\nSenha: ' + ultimoUsuarioCriado.senha;
      navigator.clipboard.writeText(texto).then(() => {
        const span = btnCopiarCredenciais.querySelector('span') || btnCopiarCredenciais;
        const textoOriginal = span.textContent;
        span.textContent = 'Credenciais Copiadas! ✓';
        setTimeout(() => {
          span.textContent = textoOriginal;
        }, 2500);
      });
    });
  }

  /* ============================================================
     10) MODAL DE AGENDAMENTO DE AULA EXPERIMENTAL (SINCRONIZADO COM PROFESSORES)
     ============================================================ */
  const modalAula = document.getElementById('modal-aula-experimental');
  const btnFecharAula = document.getElementById('fechar-modal-aula');
  const formAula = document.getElementById('form-aula-experimental');
  const stepAulaForm = document.getElementById('aula-step-form');
  const stepAulaSucesso = document.getElementById('aula-step-sucesso');
  const resumoAulaNome = document.getElementById('resumo-aula-nome');
  const resumoAulaIdioma = document.getElementById('resumo-aula-idioma');
  const resumoAulaHorario = document.getElementById('resumo-aula-horario');
  const btnWhatsConfirmarAula = document.getElementById('btn-whats-confirmar-aula');
  const containerAulasModal = document.getElementById('container-aulas-disponiveis-modal');

  const AULAS_BASE_PADRAO = [
    {
      id: 'aula-1',
      idioma: 'Inglês',
      bandeira: '🇺🇸',
      tema: 'Conversação Prática & Inglês para Viagens',
      professor: 'Prof. Lucas Miller',
      data: '2026-09-02',
      dataExtenso: 'Terça-feira, 02 de Setembro',
      horario: '19:30 às 20:30',
      vagasTotais: 8,
      vagasOcupadas: 4,
      meetLink: 'https://meet.google.com'
    },
    {
      id: 'aula-2',
      idioma: 'Japonês',
      bandeira: '🇯🇵',
      tema: 'Primeiros Passos no Nihongo & Hiragana Básico',
      professor: 'Profª. Sayuri Tanaka',
      data: '2026-09-04',
      dataExtenso: 'Quinta-feira, 04 de Setembro',
      horario: '20:00 às 21:00',
      vagasTotais: 8,
      vagasOcupadas: 5,
      meetLink: 'https://meet.google.com'
    },
    {
      id: 'aula-3',
      idioma: 'Português',
      bandeira: '🇧🇷',
      tema: 'Português do Dia a Dia & Expressões Brasileiras',
      professor: 'Prof. Rafael Silva',
      data: '2026-09-06',
      dataExtenso: 'Sábado, 06 de Setembro',
      horario: '10:00 às 11:00',
      vagasTotais: 8,
      vagasOcupadas: 3,
      meetLink: 'https://meet.google.com'
    }
  ];

  function obterAulasDisponiveis() {
    try {
      const salvo = localStorage.getItem('KIZUNA_AULAS_DISPONIVEIS');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem('KIZUNA_AULAS_DISPONIVEIS', JSON.stringify(AULAS_BASE_PADRAO));
    return AULAS_BASE_PADRAO;
  }

  function renderizarHorariosNoModal(idiomaEscolhido) {
    if (!containerAulasModal) return;
    const aulas = obterAulasDisponiveis();
    const filtradas = aulas.filter((a) => !idiomaEscolhido || a.idioma === idiomaEscolhido);
    const listaFinal = filtradas.length > 0 ? filtradas : aulas;

    containerAulasModal.innerHTML = listaFinal
      .map((aula, idx) => {
        const isChecked = idx === 0 ? 'checked' : '';
        const vagasLivres = Math.max(0, aula.vagasTotais - aula.vagasOcupadas);
        const cardStyle = idx === 0
          ? 'aula-time-option flex flex-col justify-between p-3 rounded-xl border-2 border-accent bg-accent/5 cursor-pointer transition'
          : 'aula-time-option flex flex-col justify-between p-3 rounded-xl border-2 border-navy/10 bg-white cursor-pointer transition hover:border-navy/30';

        return (
          '<label class="' + cardStyle + '" data-aula-id="' + aula.id + '">' +
          '  <input type="radio" name="aula_horario" value="' + aula.dataExtenso + ' • ' + aula.horario + '" data-meet="' + (aula.meetLink || 'https://meet.google.com') + '" data-aula-id="' + aula.id + '" ' + isChecked + ' class="sr-only">' +
          '  <div>' +
          '    <div class="flex items-center justify-between mb-1">' +
          '      <span class="font-bold text-navy text-[13px]">' + aula.dataExtenso + '</span>' +
          '      <span class="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 font-extrabold text-[10px]">' + vagasLivres + ' vagas</span>' +
          '    </div>' +
          '    <p class="text-xs text-accent font-semibold">⏰ ' + aula.horario + '</p>' +
          '    <p class="text-[11px] text-slateink mt-0.5">👨‍🏫 ' + aula.professor + '</p>' +
          '  </div>' +
          '</label>'
        );
      })
      .join('');

    // Adiciona opção flexível a combinar
    containerAulasModal.insertAdjacentHTML(
      'beforeend',
      '<label class="aula-time-option flex items-center gap-2.5 p-3 rounded-xl border-2 border-navy/10 bg-white cursor-pointer transition hover:border-navy/30 sm:col-span-2">' +
      '  <input type="radio" name="aula_horario" value="Horário flexível a combinar no WhatsApp" data-meet="https://meet.google.com/kizuna-live-room" class="sr-only">' +
      '  <i data-lucide="clock" class="h-4 w-4 text-slateink shrink-0"></i>' +
      '  <div>' +
      '    <span class="font-bold text-navy block text-xs">Outro dia ou horário personalizado</span>' +
      '    <span class="text-[11px] text-slateink">Alinhamos diretamente pelo WhatsApp de acordo com sua rotina</span>' +
      '  </div>' +
      '</label>'
    );

    // Eventos de clique nas opções de horário
    containerAulasModal.querySelectorAll('.aula-time-option').forEach((lbl) => {
      lbl.addEventListener('click', () => {
        containerAulasModal.querySelectorAll('.aula-time-option').forEach((l) => {
          l.className = 'aula-time-option flex flex-col justify-between p-3 rounded-xl border-2 border-navy/10 bg-white cursor-pointer transition hover:border-navy/30';
        });
        lbl.className = 'aula-time-option flex flex-col justify-between p-3 rounded-xl border-2 border-accent bg-accent/5 cursor-pointer transition';
      });
    });

    renderIcons();
  }

  function abrirModalAula(idiomaPadrao) {
    if (!modalAula) return;
    if (stepAulaForm) stepAulaForm.classList.remove('hidden');
    if (stepAulaSucesso) stepAulaSucesso.classList.add('hidden');

    const idiomaInicial = idiomaPadrao || 'Inglês';
    const radio = modalAula.querySelector('input[name="aula_idioma"][value="' + idiomaInicial + '"]');
    if (radio) {
      radio.checked = true;
    }
    atualizarEstiloRadiosAula();
    renderizarHorariosNoModal(idiomaInicial);

    modalAula.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderIcons();
  }

  function fecharModalAula() {
    if (!modalAula) return;
    modalAula.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (btnFecharAula) {
    btnFecharAula.addEventListener('click', fecharModalAula);
  }

  if (modalAula) {
    modalAula.addEventListener('click', (e) => {
      if (e.target === modalAula) fecharModalAula();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalAula && !modalAula.classList.contains('hidden')) {
      fecharModalAula();
    }
  });

  // Interação visual dos Radio Buttons do Modal de Aula
  function atualizarEstiloRadiosAula() {
    if (!modalAula) return;
    modalAula.querySelectorAll('.aula-lang-option').forEach((lbl) => {
      const inp = lbl.querySelector('input');
      if (inp && inp.checked) {
        lbl.className = 'aula-lang-option flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-navy bg-sand-100 text-center cursor-pointer transition';
      } else {
        lbl.className = 'aula-lang-option flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-navy/10 bg-white text-center cursor-pointer transition hover:border-navy/30';
      }
    });
  }

  if (modalAula) {
    modalAula.querySelectorAll('input[name="aula_idioma"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        atualizarEstiloRadiosAula();
        renderizarHorariosNoModal(inp.value);
      });
    });
  }

  // Submissão do Agendamento
  if (formAula) {
    formAula.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputNome = document.getElementById('aula-nome');
      const inputWhats = document.getElementById('aula-whatsapp');
      const inputEmail = document.getElementById('aula-email');

      const nome = inputNome ? inputNome.value.trim() : 'Aluno';
      const whatsapp = inputWhats ? inputWhats.value.trim() : '';
      const email = inputEmail ? inputEmail.value.trim() : '';
      const radioIdioma = modalAula.querySelector('input[name="aula_idioma"]:checked');
      const radioHorario = modalAula.querySelector('input[name="aula_horario"]:checked');
      const idioma = radioIdioma ? radioIdioma.value : 'Inglês';
      const horario = radioHorario ? radioHorario.value : 'Terça-feira às 19:30';
      const aulaId = radioHorario ? radioHorario.getAttribute('data-aula-id') : null;
      const meetLink = (radioHorario && radioHorario.getAttribute('data-meet')) || 'https://meet.google.com/kizuna-live-room';

      // Atualiza banco de dados de aulas (incrementa vagas ocupadas)
      const aulas = obterAulasDisponiveis();
      const aulaEncontrada = aulas.find((a) => a.id === aulaId || (a.idioma === idioma && horario.includes(a.horario)));
      if (aulaEncontrada) {
        aulaEncontrada.vagasOcupadas = Math.min(aulaEncontrada.vagasTotais, (aulaEncontrada.vagasOcupadas || 0) + 1);
        localStorage.setItem('KIZUNA_AULAS_DISPONIVEIS', JSON.stringify(aulas));
      }

      // Registra inscrição para o painel do professor
      let inscricoes = [];
      try {
        const salvo = localStorage.getItem('KIZUNA_INSCRICOES_ALUNOS');
        if (salvo) inscricoes = JSON.parse(salvo);
      } catch (err) {
        console.warn(err);
      }

      const novaInscricao = {
        id: 'ins-' + Date.now(),
        aulaId: aulaId || 'aula-custom',
        idioma: idioma,
        aulaTema: (aulaEncontrada && aulaEncontrada.tema) || 'Aula Experimental',
        horario: horario,
        nome: nome,
        whatsapp: whatsapp,
        email: email,
        dataInscricao: new Date().toISOString().split('T')[0]
      };
      inscricoes.unshift(novaInscricao);
      localStorage.setItem('KIZUNA_INSCRICOES_ALUNOS', JSON.stringify(inscricoes));

      if (resumoAulaNome) resumoAulaNome.textContent = nome;
      if (resumoAulaIdioma) resumoAulaIdioma.textContent = idioma;
      if (resumoAulaHorario) resumoAulaHorario.textContent = horario;

      const btnMeetAula = document.getElementById('btn-entrar-meet-aula');
      if (btnMeetAula) btnMeetAula.href = meetLink;

      // Link do WhatsApp com mensagem pré-montada
      if (btnWhatsConfirmarAula) {
        const msg = encodeURIComponent('Olá, equipe Kizuna! Acabei de agendar minha Aula Experimental Gratuita de ' + idioma + ' para ' + horario + '.\n\nNome: ' + nome + '\nEmail: ' + email + '\nWhatsApp: ' + whatsapp);
        const tel = (window.KIZUNA_CONFIG && window.KIZUNA_CONFIG.escola && window.KIZUNA_CONFIG.escola.whatsapp) || '5511999999999';
        btnWhatsConfirmarAula.href = 'https://wa.me/' + tel + '?text=' + msg;
      }

      if (stepAulaForm) stepAulaForm.classList.add('hidden');
      if (stepAulaSucesso) stepAulaSucesso.classList.remove('hidden');
      renderIcons();
    });
  }

  // Associa todos os botões de "Agendar aula experimental" ao modal
  document.querySelectorAll('a, button').forEach((elem) => {
    const texto = elem.textContent.trim().toLowerCase();
    if (texto.includes('agendar aula') || texto.includes('aula experimental') || elem.hasAttribute('data-abrir-agendamento')) {
      elem.addEventListener('click', (e) => {
        if (elem.closest('#kizuna-form') || elem.closest('#form-aula-experimental') || elem.closest('#modal-criar-aula')) return;
        e.preventDefault();
        abrirModalAula();
      });
    }
  });

  // Inicializa o estado de login na carga da página
  atualizarEstadoLoginUI();

  /* ---------- Filtro Interativo: Para Quem é a Kizuna ---------- */
  const filtroTabs = document.querySelectorAll('.para-quem-tab');
  const cardsParaQuem = document.querySelectorAll('.para-quem-card');

  if (filtroTabs.length && cardsParaQuem.length) {
    filtroTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filterVal = tab.getAttribute('data-filter') || 'all';

        // Atualiza estado ativo dos botões
        filtroTabs.forEach((t) => {
          const isActive = t === tab;
          t.classList.toggle('is-active', isActive);
          t.setAttribute('aria-selected', String(isActive));
        });

        // Filtra ou destaca os cards com efeito suave
        cardsParaQuem.forEach((card) => {
          const categories = (card.getAttribute('data-category') || '').split(' ');
          if (filterVal === 'all' || categories.includes(filterVal)) {
            card.classList.remove('is-dimmed');
          } else {
            card.classList.add('is-dimmed');
          }
        });
      });
    });
  }
})();


