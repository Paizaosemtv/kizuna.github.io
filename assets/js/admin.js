/**
 * KIZUNA LANGUAGE SCHOOL — PAINEL MASTER DO ADMINISTRADOR
 * Gestão de Professores, Criação de Logins/Senhas e Controle de Alunos
 */

(function () {
  'use strict';

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ============================================================
     1. BANCO DE DADOS DE PROFESSORES (LOCALSTORAGE)
     ============================================================ */
  const CHAVE_PROFESSORES = 'KIZUNA_PROFESSORES';
  const CHAVE_ADMIN_SESSAO = 'KIZUNA_ADMIN_SESSAO';
  const CHAVE_INSCRICOES = 'KIZUNA_INSCRICOES_ALUNOS';
  const CHAVE_AULAS = 'KIZUNA_AULAS_DISPONIVEIS';

  const PROFESSORES_PADRAO = [
    {
      id: 'prof-1',
      nome: 'Prof. Lucas Miller',
      email: 'lucas.miller@kizuna.com',
      senha: 'prof-lucas-2026',
      idioma: 'Inglês',
      status: 'Ativo',
      criadoEm: '2026-08-30'
    },
    {
      id: 'prof-2',
      nome: 'Profª. Sayuri Tanaka',
      email: 'sayuri.tanaka@kizuna.com',
      senha: 'prof-sayuri-2026',
      idioma: 'Japonês',
      status: 'Ativo',
      criadoEm: '2026-08-30'
    },
    {
      id: 'prof-3',
      nome: 'Prof. Rafael Silva',
      email: 'rafael.silva@kizuna.com',
      senha: 'prof-rafael-2026',
      idioma: 'Português',
      status: 'Ativo',
      criadoEm: '2026-08-30'
    }
  ];

  function obterProfessores() {
    try {
      const salvo = localStorage.getItem(CHAVE_PROFESSORES);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(CHAVE_PROFESSORES, JSON.stringify(PROFESSORES_PADRAO));
    return PROFESSORES_PADRAO;
  }

  function salvarProfessores(lista) {
    localStorage.setItem(CHAVE_PROFESSORES, JSON.stringify(lista));
  }

  /* ============================================================
     2. AUTENTICAÇÃO DO ADMINISTRADOR
     ============================================================ */
  const gateLogin = document.getElementById('admin-login-gate');
  const viewDashboard = document.getElementById('admin-dashboard-view');
  const formLoginAdmin = document.getElementById('form-admin-login');
  const erroLoginAdmin = document.getElementById('admin-login-erro');
  const btnLogoutAdmin = document.getElementById('btn-admin-logout');
  const chkLembrarAdmin = document.getElementById('admin-lembrar');

  function estaLogadoAdmin() {
    return (
      localStorage.getItem(CHAVE_ADMIN_SESSAO) === 'logado' ||
      sessionStorage.getItem(CHAVE_ADMIN_SESSAO) === 'logado'
    );
  }

  function atualizarEstadoAdmin() {
    if (estaLogadoAdmin()) {
      if (gateLogin) gateLogin.classList.add('hidden');
      if (viewDashboard) viewDashboard.classList.remove('hidden');
      renderizarAdmin();
    } else {
      if (gateLogin) gateLogin.classList.remove('hidden');
      if (viewDashboard) viewDashboard.classList.add('hidden');
    }
    renderIcons();
  }

  if (formLoginAdmin) {
    formLoginAdmin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const senha = document.getElementById('admin-senha').value.trim();
      const lembrar = chkLembrarAdmin ? chkLembrarAdmin.checked : false;

      // Credenciais Master do Administrador
      if ((email === 'admin@kizuna.com' || email === 'admin') && (senha === 'kizuna2026' || senha === 'admin')) {
        if (lembrar) {
          localStorage.setItem(CHAVE_ADMIN_SESSAO, 'logado');
        } else {
          sessionStorage.setItem(CHAVE_ADMIN_SESSAO, 'logado');
        }
        if (erroLoginAdmin) erroLoginAdmin.classList.add('hidden');
        atualizarEstadoAdmin();
      } else {
        if (erroLoginAdmin) {
          erroLoginAdmin.textContent = 'Credenciais de administrador incorretas. Verifique seu e-mail e senha.';
          erroLoginAdmin.classList.remove('hidden');
        }
      }
    });
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.addEventListener('click', () => {
      localStorage.removeItem(CHAVE_ADMIN_SESSAO);
      sessionStorage.removeItem(CHAVE_ADMIN_SESSAO);
      atualizarEstadoAdmin();
    });
  }

  /* ============================================================
     3. RENDERIZAÇÃO DO DASHBOARD DO ADMINISTRADOR
     ============================================================ */
  const elStatProfs = document.getElementById('stat-admin-total-professores');
  const elStatAlunos = document.getElementById('stat-admin-total-alunos');
  const elStatAulas = document.getElementById('stat-admin-total-aulas');
  const elTabelaProfs = document.getElementById('tabela-professores-corpo');
  const elTabelaAlunos = document.getElementById('tabela-alunos-admin-corpo');

  function renderizarAdmin() {
    const profs = obterProfessores();
    let inscricoes = [];
    try {
      const salvo = localStorage.getItem(CHAVE_INSCRICOES);
      if (salvo) inscricoes = JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }

    let aulas = [];
    try {
      const salvo = localStorage.getItem(CHAVE_AULAS);
      if (salvo) aulas = JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }

    if (elStatProfs) elStatProfs.textContent = profs.length;
    if (elStatAlunos) elStatAlunos.textContent = inscricoes.length;
    if (elStatAulas) elStatAulas.textContent = aulas.length;

    // Renderiza Professores
    if (elTabelaProfs) {
      if (profs.length === 0) {
        elTabelaProfs.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slateink">Nenhum professor cadastrado ainda.</td></tr>';
      } else {
        elTabelaProfs.innerHTML = profs
          .map((prof) => {
            const isAtivo = (prof.status || 'Ativo') === 'Ativo';
            const dadosCopiar = 'Acesso Professor Kizuna:\nLogin: ' + prof.email + '\nSenha: ' + prof.senha + '\nLink: ' + window.location.origin + '/professor.html';
            
            const badgeStatus = isAtivo
              ? '<span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">🟢 Ativo</span>'
              : '<span class="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-800">🔴 Desligado</span>';

            const btnToggle = isAtivo
              ? '<button type="button" class="btn-toggle-status-prof rounded-lg border border-amber-600/30 bg-amber-50 text-amber-900 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-100 transition" data-toggle-prof="' + prof.id + '" title="Desligar/Demitir professor da escola">⛔ Desligar</button>'
              : '<button type="button" class="btn-toggle-status-prof rounded-lg border border-emerald-600/30 bg-emerald-50 text-emerald-900 px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-100 transition" data-toggle-prof="' + prof.id + '" title="Reativar professor">🟢 Reativar</button>';

            return (
              '<tr class="hover:bg-sand-100 transition ' + (isAtivo ? '' : 'opacity-70 bg-red-50/20') + '">' +
              '  <td class="p-3.5 font-bold text-navy">' +
              '    <div class="flex items-center gap-2">' +
              '      <span class="grid h-7 w-7 place-items-center rounded-lg ' + (isAtivo ? 'bg-navy/5 text-navy' : 'bg-red-100 text-red-800') + ' font-bold text-xs">' + prof.nome.charAt(0) + '</span>' +
              '      <div>' +
              '        <span>' + prof.nome + '</span>' +
              '        ' + (!isAtivo ? '<span class="block text-[10px] text-red-700 font-bold">Acesso Bloqueado</span>' : '') +
              '      </div>' +
              '    </div>' +
              '  </td>' +
              '  <td class="p-3.5 font-mono text-slateink">' + prof.email + '</td>' +
              '  <td class="p-3.5 font-mono font-bold text-accent">' + prof.senha + '</td>' +
              '  <td class="p-3.5"><span class="rounded bg-navy/10 px-2 py-0.5 font-bold text-navy">' + prof.idioma + '</span></td>' +
              '  <td class="p-3.5">' + badgeStatus + '</td>' +
              '  <td class="p-3.5 text-right space-x-1.5 whitespace-nowrap">' +
              '    <button type="button" class="btn-copiar-cred-prof rounded-lg bg-navy/5 px-2.5 py-1 text-[11px] font-bold text-navy hover:bg-navy/10 transition" data-copy="' + encodeURIComponent(dadosCopiar) + '" title="Copiar Login e Senha">' +
              '      <i data-lucide="copy" class="inline h-3 w-3"></i> Copiar' +
              '    </button>' +
              '    ' + btnToggle +
              '    <button type="button" class="rounded-lg bg-red-50 text-accent px-2 py-1 text-[11px] font-bold hover:bg-red-100 transition" data-excluir-prof="' + prof.id + '" title="Excluir Definitivo">' +
              '      <i data-lucide="trash-2" class="inline h-3 w-3"></i>' +
              '    </button>' +
              '  </td>' +
              '</tr>'
            );
          })
          .join('');
      }
    }

    // Renderiza Alunos
    if (elTabelaAlunos) {
      if (inscricoes.length === 0) {
        elTabelaAlunos.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slateink">Nenhum aluno registrado.</td></tr>';
      } else {
        elTabelaAlunos.innerHTML = inscricoes
          .map((ins) => {
            const numWhats = (ins.whatsapp || '').replace(/\D/g, '');
            const msg = encodeURIComponent('Olá, ' + ins.nome + '! Entramos em contato da Kizuna sobre sua aula experimental de ' + ins.idioma + '.');
            return (
              '<tr class="hover:bg-sand-100 transition">' +
              '  <td class="p-3.5 font-bold text-navy">' + ins.nome + '</td>' +
              '  <td class="p-3.5 text-slateink">' + ins.email + '</td>' +
              '  <td class="p-3.5 font-mono text-slateink">' + (ins.whatsapp || '-') + '</td>' +
              '  <td class="p-3.5 font-bold text-navy">' + ins.idioma + '</td>' +
              '  <td class="p-3.5 text-xs text-slateink">' + ins.horario + '</td>' +
              '  <td class="p-3.5 text-right">' +
              '    <a href="https://wa.me/' + (numWhats.startsWith('55') ? numWhats : '55' + numWhats) + '?text=' + msg + '" target="_blank" class="inline-flex items-center gap-1 rounded-lg bg-[#1FAF54] px-2.5 py-1 text-[11px] font-bold text-white shadow-soft hover:bg-[#189646] transition">' +
              '      <i data-lucide="message-circle" class="h-3 w-3"></i> WhatsApp' +
              '    </a>' +
              '  </td>' +
              '</tr>'
            );
          })
          .join('');
      }
    }

    renderIcons();
  }

  // Copiar Credenciais do Professor
  document.addEventListener('click', (e) => {
    const btnCopy = e.target.closest('.btn-copiar-cred-prof');
    if (btnCopy) {
      const texto = decodeURIComponent(btnCopy.getAttribute('data-copy'));
      navigator.clipboard.writeText(texto).then(() => {
        const txtOriginal = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i data-lucide="check" class="inline h-3 w-3"></i> Copiado!';
        setTimeout(() => {
          btnCopy.innerHTML = txtOriginal;
          renderIcons();
        }, 2000);
      });
    }

    // Alternar Status: Desligar (Demitir) ou Reativar Professor
    const btnToggle = e.target.closest('.btn-toggle-status-prof');
    if (btnToggle) {
      const id = btnToggle.getAttribute('data-toggle-prof');
      const profsAtuais = obterProfessores();
      const profAlvo = profsAtuais.find((p) => p.id === id);

      if (profAlvo) {
        const estaAtivo = (profAlvo.status || 'Ativo') === 'Ativo';
        const novoStatus = estaAtivo ? 'Desligado' : 'Ativo';

        const confirmMsg = estaAtivo
          ? 'Tem certeza que deseja DESLIGAR (bloquear) o(a) ' + profAlvo.nome + '?\n\nEle(a) não poderá mais acessar o Portal do Professor nem gerenciar aulas.'
          : 'Deseja REATIVAR o acesso do(a) ' + profAlvo.nome + ' ao Portal do Professor?';

        if (confirm(confirmMsg)) {
          profAlvo.status = novoStatus;
          salvarProfessores(profsAtuais);

          // Se acabou de ser desligado, revoga qualquer sessão ativa imediatamente
          if (novoStatus === 'Desligado') {
            const sessaoProf = localStorage.getItem('KIZUNA_SESSAO_PROFESSOR') || sessionStorage.getItem('KIZUNA_SESSAO_PROFESSOR');
            if (sessaoProf) {
              try {
                const dadosSessao = JSON.parse(sessaoProf);
                if (dadosSessao.email === profAlvo.email || dadosSessao.id === profAlvo.id) {
                  localStorage.removeItem('KIZUNA_SESSAO_PROFESSOR');
                  sessionStorage.removeItem('KIZUNA_SESSAO_PROFESSOR');
                }
              } catch (err) {
                console.warn(err);
              }
            }
          }

          renderizarAdmin();
        }
      }
    }

    // Excluir Professor (Revogação Imediata e Total de Acesso)
    const btnExcluir = e.target.closest('[data-excluir-prof]');
    if (btnExcluir) {
      const id = btnExcluir.getAttribute('data-excluir-prof');
      const profsAtuais = obterProfessores();
      const profAlvo = profsAtuais.find((p) => p.id === id);

      if (confirm('Deseja realmente remover o acesso do(a) ' + (profAlvo ? profAlvo.nome : 'professor') + '?\n\nEle(a) perderá imediatamente e definitivamente todo o acesso ao Portal do Professor.')) {
        const novosProfs = profsAtuais.filter((p) => p.id !== id);
        salvarProfessores(novosProfs);

        // Revoga sessão do professor excluído imediatamente
        if (profAlvo) {
          const sessaoProf = localStorage.getItem('KIZUNA_SESSAO_PROFESSOR') || sessionStorage.getItem('KIZUNA_SESSAO_PROFESSOR');
          if (sessaoProf) {
            try {
              const dadosSessao = JSON.parse(sessaoProf);
              if (dadosSessao.email === profAlvo.email || dadosSessao.id === profAlvo.id) {
                localStorage.removeItem('KIZUNA_SESSAO_PROFESSOR');
                sessionStorage.removeItem('KIZUNA_SESSAO_PROFESSOR');
              }
            } catch (err) {
              console.warn(err);
            }
          }
        }

        renderizarAdmin();
      }
    }
  });

  /* ============================================================
     4. MODAL: CADASTRAR NOVO PROFESSOR
     ============================================================ */
  const modalCadProf = document.getElementById('modal-cadastrar-prof');
  const btnAbrirCad1 = document.getElementById('btn-cadastrar-novo-prof');
  const btnAbrirCad2 = document.getElementById('btn-cadastrar-novo-prof-2');
  const btnFecharCad = document.getElementById('fechar-modal-cadastrar-prof');
  const formCadProf = document.getElementById('form-cadastrar-prof');
  const btnGerarSenha = document.getElementById('btn-gerar-senha-prof');
  const inputSenhaProf = document.getElementById('cad-prof-senha');

  function abrirModalCadProf() {
    if (modalCadProf) modalCadProf.classList.remove('hidden');
    if (inputSenhaProf && !inputSenhaProf.value) {
      inputSenhaProf.value = 'prof-' + Math.floor(1000 + Math.random() * 9000);
    }
    renderIcons();
  }

  function fecharModalCadProf() {
    if (modalCadProf) modalCadProf.classList.add('hidden');
  }

  if (btnAbrirCad1) btnAbrirCad1.addEventListener('click', abrirModalCadProf);
  if (btnAbrirCad2) btnAbrirCad2.addEventListener('click', abrirModalCadProf);
  if (btnFecharCad) btnFecharCad.addEventListener('click', fecharModalCadProf);

  if (modalCadProf) {
    modalCadProf.addEventListener('click', (e) => {
      if (e.target === modalCadProf) fecharModalCadProf();
    });
  }

  if (btnGerarSenha && inputSenhaProf) {
    btnGerarSenha.addEventListener('click', () => {
      inputSenhaProf.value = 'prof-' + Math.floor(1000 + Math.random() * 9000);
    });
  }

  if (formCadProf) {
    formCadProf.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('cad-prof-nome').value.trim();
      const email = document.getElementById('cad-prof-email').value.trim();
      const senha = document.getElementById('cad-prof-senha').value.trim();
      const idioma = document.getElementById('cad-prof-idioma').value;

      const profs = obterProfessores();
      const novoProf = {
        id: 'prof-' + Date.now(),
        nome: nome,
        email: email,
        senha: senha,
        idioma: idioma,
        status: 'Ativo',
        criadoEm: new Date().toISOString().split('T')[0]
      };

      profs.push(novoProf);
      salvarProfessores(profs);

      formCadProf.reset();
      fecharModalCadProf();
      renderizarAdmin();
    });
  }

  // Alternância de Abas (Professores vs Alunos)
  const abaBtnProfs = document.getElementById('aba-btn-professores');
  const abaBtnAlunos = document.getElementById('aba-btn-alunos');
  const painelProfs = document.getElementById('painel-professores');
  const painelAlunos = document.getElementById('painel-alunos');

  if (abaBtnProfs && abaBtnAlunos && painelProfs && painelAlunos) {
    abaBtnProfs.addEventListener('click', () => {
      painelProfs.classList.remove('hidden');
      painelAlunos.classList.add('hidden');
      abaBtnProfs.className = 'border-b-2 border-accent text-navy pb-3 px-2 flex items-center gap-1.5 transition';
      abaBtnAlunos.className = 'text-slateink hover:text-navy pb-3 px-2 flex items-center gap-1.5 transition';
      renderIcons();
    });

    abaBtnAlunos.addEventListener('click', () => {
      painelProfs.classList.add('hidden');
      painelAlunos.classList.remove('hidden');
      abaBtnAlunos.className = 'border-b-2 border-accent text-navy pb-3 px-2 flex items-center gap-1.5 transition';
      abaBtnProfs.className = 'text-slateink hover:text-navy pb-3 px-2 flex items-center gap-1.5 transition';
      renderIcons();
    });
  }

  // Inicializa Estado Admin
  atualizarEstadoAdmin();
  renderIcons();
})();
