/**
 * KIZUNA LANGUAGE SCHOOL — PAINEL DO PROFESSOR
 * Gerenciamento de Aulas Gratuitas e Visualização de Agendamentos dos Alunos
 */

(function () {
  'use strict';

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ============================================================
     1. BANCO DE DADOS LOCAL (LOCALSTORAGE)
     ============================================================ */
  const CHAVE_AULAS = 'KIZUNA_AULAS_DISPONIVEIS';
  const CHAVE_INSCRICOES = 'KIZUNA_INSCRICOES_ALUNOS';
  const CHAVE_PROFESSORES = 'KIZUNA_PROFESSORES';
  const CHAVE_SESSAO_PROF = 'KIZUNA_SESSAO_PROFESSOR';

  const PROFESSORES_BASE = [
    {
      id: 'prof-1',
      nome: 'Prof. Lucas Miller',
      email: 'lucas.miller@kizuna.com',
      senha: 'prof-lucas-2026',
      idioma: 'Inglês',
      status: 'Ativo'
    },
    {
      id: 'prof-2',
      nome: 'Profª. Sayuri Tanaka',
      email: 'sayuri.tanaka@kizuna.com',
      senha: 'prof-sayuri-2026',
      idioma: 'Japonês',
      status: 'Ativo'
    },
    {
      id: 'prof-3',
      nome: 'Prof. Rafael Silva',
      email: 'rafael.silva@kizuna.com',
      senha: 'prof-rafael-2026',
      idioma: 'Português',
      status: 'Ativo'
    }
  ];

  function obterProfessoresCadastrados() {
    try {
      const salvo = localStorage.getItem(CHAVE_PROFESSORES);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(CHAVE_PROFESSORES, JSON.stringify(PROFESSORES_BASE));
    return PROFESSORES_BASE;
  }

  /* ============================================================
     2. AUTENTICAÇÃO E GATE DO PROFESSOR
     ============================================================ */
  const gateProfLogin = document.getElementById('professor-login-gate');
  const mainProfView = document.getElementById('professor-main-view');
  const formProfLogin = document.getElementById('form-professor-login');
  const erroProfLogin = document.getElementById('prof-login-erro');
  const topbarProfIdent = document.getElementById('prof-identificacao-topbar');
  const btnProfLogout = document.getElementById('btn-prof-logout');

  function obterSessaoProfessor() {
    let sessao = null;
    try {
      const salvoLocal = localStorage.getItem(CHAVE_SESSAO_PROF);
      const salvoSession = sessionStorage.getItem(CHAVE_SESSAO_PROF);
      if (salvoLocal) sessao = JSON.parse(salvoLocal);
      else if (salvoSession) sessao = JSON.parse(salvoSession);
    } catch (e) {
      console.warn(e);
    }

    if (!sessao) return null;

    // Se for o admin master, permite sempre
    if (sessao.email === 'admin@kizuna.com') return sessao;

    // VERIFICAÇÃO EM TEMPO REAL: se foi deletado ou desligado pelo administrador, o acesso é revogado imediatamente!
    const professores = obterProfessoresCadastrados();
    const profAtualizado = professores.find((p) => p.email.toLowerCase() === (sessao.email || '').toLowerCase());
    if (!profAtualizado || profAtualizado.status === 'Desligado') {
      localStorage.removeItem(CHAVE_SESSAO_PROF);
      sessionStorage.removeItem(CHAVE_SESSAO_PROF);
      return null;
    }

    return profAtualizado;
  }

  function atualizarEstadoProfessorUI() {
    const profLogado = obterSessaoProfessor();
    if (profLogado) {
      if (gateProfLogin) gateProfLogin.classList.add('hidden');
      if (mainProfView) mainProfView.classList.remove('hidden');
      if (topbarProfIdent) {
        topbarProfIdent.innerHTML = '👨‍🏫 ' + profLogado.nome;
      }
      const inpProfNovaAula = document.getElementById('nova-aula-prof');
      if (inpProfNovaAula) inpProfNovaAula.value = profLogado.nome;
    } else {
      if (gateProfLogin) gateProfLogin.classList.remove('hidden');
      if (mainProfView) mainProfView.classList.add('hidden');
    }
    renderIcons();
  }

  const chkLembrarProf = document.getElementById('prof-lembrar');

  if (formProfLogin) {
    formProfLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('prof-email').value.trim().toLowerCase();
      const senha = document.getElementById('prof-senha').value.trim();
      const lembrar = chkLembrarProf ? chkLembrarProf.checked : false;

      const professores = obterProfessoresCadastrados();
      const profEncontrado = professores.find(
        (p) => p.email.toLowerCase() === email && p.senha === senha
      );

      if (profEncontrado) {
        // Se o professor foi desligado pelo Administrador, bloqueia o acesso
        if (profEncontrado.status === 'Desligado') {
          if (erroProfLogin) {
            erroProfLogin.textContent = '❌ Acesso Bloqueado: Este professor foi desligado da instituição pela administração da escola. Fale com a direção.';
            erroProfLogin.classList.remove('hidden');
          }
          return;
        }

        if (lembrar) {
          localStorage.setItem(CHAVE_SESSAO_PROF, JSON.stringify(profEncontrado));
        } else {
          sessionStorage.setItem(CHAVE_SESSAO_PROF, JSON.stringify(profEncontrado));
        }
        if (erroProfLogin) erroProfLogin.classList.add('hidden');
        atualizarEstadoProfessorUI();
      } else if (email === 'admin@kizuna.com' && senha === 'kizuna2026') {
        const adminProf = { nome: 'Administrador Master', email: 'admin@kizuna.com', idioma: 'Todos', status: 'Ativo' };
        if (lembrar) {
          localStorage.setItem(CHAVE_SESSAO_PROF, JSON.stringify(adminProf));
        } else {
          sessionStorage.setItem(CHAVE_SESSAO_PROF, JSON.stringify(adminProf));
        }
        if (erroProfLogin) erroProfLogin.classList.add('hidden');
        atualizarEstadoProfessorUI();
      } else {
        if (erroProfLogin) {
          erroProfLogin.textContent = 'E-mail ou senha de professor incorretos. Solicite seu acesso ao Administrador.';
          erroProfLogin.classList.remove('hidden');
        }
      }
    });
  }

  if (btnProfLogout) {
    btnProfLogout.addEventListener('click', () => {
      localStorage.removeItem(CHAVE_SESSAO_PROF);
      sessionStorage.removeItem(CHAVE_SESSAO_PROF);
      atualizarEstadoProfessorUI();
    });
  }

  const INSCRICOES_PADRAO = [
    {
      id: 'ins-1',
      aulaId: 'aula-1',
      idioma: 'Inglês',
      aulaTema: 'Conversação Prática & Inglês para Viagens',
      horario: 'Terça-feira, 02 de Setembro • 19:30',
      nome: 'Mariana Souza',
      whatsapp: '11987654321',
      email: 'mariana.souza@gmail.com',
      dataInscricao: '2026-08-30'
    },
    {
      id: 'ins-2',
      aulaId: 'aula-2',
      idioma: 'Japonês',
      aulaTema: 'Primeiros Passos no Nihongo',
      horario: 'Quinta-feira, 04 de Setembro • 20:00',
      nome: 'Bruno Carvalho',
      whatsapp: '11991234567',
      email: 'bruno.c@outlook.com',
      dataInscricao: '2026-08-30'
    },
    {
      id: 'ins-3',
      aulaId: 'aula-3',
      idioma: 'Português',
      aulaTema: 'Português do Dia a Dia',
      horario: 'Sábado, 06 de Setembro • 10:00',
      nome: 'Jean Dupont',
      whatsapp: '5511977778888',
      email: 'jean.dupont@paris.fr',
      dataInscricao: '2026-08-30'
    }
  ];

  function obterAulas() {
    try {
      const salvo = localStorage.getItem(CHAVE_AULAS);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(CHAVE_AULAS, JSON.stringify(AULAS_PADRAO));
    return AULAS_PADRAO;
  }

  function salvarAulas(aulas) {
    localStorage.setItem(CHAVE_AULAS, JSON.stringify(aulas));
  }

  function obterInscricoes() {
    try {
      const salvo = localStorage.getItem(CHAVE_INSCRICOES);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(CHAVE_INSCRICOES, JSON.stringify(INSCRICOES_PADRAO));
    return INSCRICOES_PADRAO;
  }

  function salvarInscricoes(inscricoes) {
    localStorage.setItem(CHAVE_INSCRICOES, JSON.stringify(inscricoes));
  }

  /* ============================================================
     2. RENDERIZAÇÃO DO PAINEL DO PROFESSOR
     ============================================================ */
  const elListaAulas = document.getElementById('lista-aulas-professor');
  const elTabelaInscritos = document.getElementById('tabela-inscritos-corpo');
  const elFiltroIdioma = document.getElementById('filtro-idioma-inscritos');
  const elStatTotalAulas = document.getElementById('stat-total-aulas');
  const elStatTotalAlunos = document.getElementById('stat-total-alunos');
  const elStatOcupacao = document.getElementById('stat-ocupacao');

  function renderizarPainel() {
    const aulas = obterAulas();
    const inscricoes = obterInscricoes();

    // Atualiza estatísticas
    if (elStatTotalAulas) elStatTotalAulas.textContent = aulas.length;
    if (elStatTotalAlunos) elStatTotalAlunos.textContent = inscricoes.length;

    let vagasTotais = 0;
    let vagasOcupadas = 0;
    aulas.forEach((a) => {
      vagasTotais += parseInt(a.vagasTotais || 8, 10);
      vagasOcupadas += parseInt(a.vagasOcupadas || 0, 10);
    });
    const taxa = vagasTotais > 0 ? Math.round((vagasOcupadas / vagasTotais) * 100) : 0;
    if (elStatOcupacao) elStatOcupacao.textContent = taxa + '%';

    // Renderiza Lista de Aulas
    if (elListaAulas) {
      if (aulas.length === 0) {
        elListaAulas.innerHTML = '<p class="col-span-full py-8 text-center text-xs text-slateink font-semibold">Nenhuma aula cadastrada. Clique em "Adicionar Nova Data" para agendar uma aula.</p>';
      } else {
        elListaAulas.innerHTML = aulas
          .map((aula) => {
            const pct = Math.round((aula.vagasOcupadas / aula.vagasTotais) * 100);
            return (
              '<div class="rounded-2xl border border-navy/10 bg-sand-100/90 p-5 shadow-soft space-y-4 flex flex-col justify-between">' +
              '  <div>' +
              '    <div class="flex items-center justify-between">' +
              '      <span class="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">' +
              '        ' + (aula.bandeira || '🌐') + ' ' + aula.idioma +
              '      </span>' +
              '      <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">' +
              '        ' + aula.vagasOcupadas + '/' + aula.vagasTotais + ' Vagas' +
              '      </span>' +
              '    </div>' +
              '    <h3 class="mt-3 text-base font-extrabold text-navy">' + aula.tema + '</h3>' +
              '    <p class="text-xs text-slateink mt-1">👨‍🏫 ' + aula.professor + '</p>' +
              '    <div class="mt-3 rounded-xl bg-white border border-navy/10 p-3 text-xs space-y-1">' +
              '      <p class="font-bold text-navy">📅 ' + aula.dataExtenso + '</p>' +
              '      <p class="text-slateink">⏰ ' + aula.horario + '</p>' +
              '    </div>' +
              '  </div>' +
              '  <div class="space-y-2 pt-2 border-t border-navy/10">' +
              '    <div class="h-1.5 w-full bg-white rounded-full overflow-hidden border border-navy/10">' +
              '      <div class="h-full bg-accent rounded-full" style="width: ' + pct + '%"></div>' +
              '    </div>' +
              '    <div class="flex items-center gap-2">' +
              '      <a href="' + (aula.meetLink || 'https://meet.google.com') + '" target="_blank" class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy-700 transition">' +
              '        <i data-lucide="video" class="h-3.5 w-3.5 text-emerald-400"></i> Abrir Meet' +
              '      </a>' +
              '      <button type="button" data-excluir-aula="' + aula.id + '" class="p-2 rounded-xl border border-navy/10 bg-white text-accent hover:bg-accent/10 transition" title="Excluir aula">' +
              '        <i data-lucide="trash-2" class="h-4 w-4"></i>' +
              '      </button>' +
              '    </div>' +
              '  </div>' +
              '</div>'
            );
          })
          .join('');
      }
    }

    // Renderiza Tabela de Inscritos
    renderizarTabelaInscritos();
    renderIcons();
  }

  function renderizarTabelaInscritos() {
    if (!elTabelaInscritos) return;
    const inscricoes = obterInscricoes();
    const filtro = elFiltroIdioma ? elFiltroIdioma.value : 'todos';

    const filtrados = inscricoes.filter((ins) => {
      if (filtro === 'todos') return true;
      return ins.idioma === filtro;
    });

    if (filtrados.length === 0) {
      elTabelaInscritos.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slateink">Nenhum aluno inscrito para este filtro.</td></tr>';
      return;
    }

    elTabelaInscritos.innerHTML = filtrados
      .map((ins) => {
        const msgWhats = encodeURIComponent('Olá, ' + ins.nome + '! Aqui é da Kizuna Language School confirmando sua presença na Aula Experimental Gratuita de ' + ins.idioma + ' (' + ins.horario + '). Seja muito bem-vindo(a)!');
        const numWhats = (ins.whatsapp || '').replace(/\D/g, '');

        return (
          '<tr class="hover:bg-sand-100 transition">' +
          '  <td class="p-3.5 font-bold text-navy">' +
          '    <div>' + ins.nome + '</div>' +
          '    <div class="text-[11px] font-normal text-slateink">' + ins.email + '</div>' +
          '  </td>' +
          '  <td class="p-3.5">' +
          '    <span class="font-bold text-navy">' + ins.idioma + '</span>' +
          '    <div class="text-[11px] text-slateink">' + (ins.aulaTema || 'Aula Experimental') + '</div>' +
          '  </td>' +
          '  <td class="p-3.5 font-semibold text-navy">' + ins.horario + '</td>' +
          '  <td class="p-3.5 font-mono text-slateink">' + (ins.whatsapp || '-') + '</td>' +
          '  <td class="p-3.5 text-right">' +
          '    <a href="https://wa.me/' + (numWhats.startsWith('55') ? numWhats : '55' + numWhats) + '?text=' + msgWhats + '" target="_blank" class="inline-flex items-center gap-1.5 rounded-xl bg-[#1FAF54] px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-[#189646] transition">' +
          '      <i data-lucide="message-circle" class="h-3.5 w-3.5"></i> Chamar' +
          '    </a>' +
          '  </td>' +
          '</tr>'
        );
      })
      .join('');
  }

  if (elFiltroIdioma) {
    elFiltroIdioma.addEventListener('change', renderizarTabelaInscritos);
  }

  /* ============================================================
     3. EXCLUSÃO DE AULAS
     ============================================================ */
  document.addEventListener('click', (e) => {
    const btnExcluir = e.target.closest('[data-excluir-aula]');
    if (btnExcluir) {
      const id = btnExcluir.getAttribute('data-excluir-aula');
      if (confirm('Deseja realmente remover esta data de aula?')) {
        const aulas = obterAulas().filter((a) => a.id !== id);
        salvarAulas(aulas);
        renderizarPainel();
      }
    }
  });

  /* ============================================================
     4. MODAL: PUBLICAR NOVA AULA
     ============================================================ */
  const modalCriarAula = document.getElementById('modal-criar-aula');
  const btnAbrirCriar1 = document.getElementById('btn-abrir-nova-aula');
  const btnAbrirCriar2 = document.getElementById('btn-abrir-modal-aula-2');
  const btnFecharCriar = document.getElementById('fechar-modal-criar-aula');
  const formNovaAula = document.getElementById('form-nova-aula');

  function abrirModalCriar() {
    if (modalCriarAula) modalCriarAula.classList.remove('hidden');
    renderIcons();
  }

  function fecharModalCriar() {
    if (modalCriarAula) modalCriarAula.classList.add('hidden');
  }

  if (btnAbrirCriar1) btnAbrirCriar1.addEventListener('click', abrirModalCriar);
  if (btnAbrirCriar2) btnAbrirCriar2.addEventListener('click', abrirModalCriar);
  if (btnFecharCriar) btnFecharCriar.addEventListener('click', fecharModalCriar);

  if (modalCriarAula) {
    modalCriarAula.addEventListener('click', (e) => {
      if (e.target === modalCriarAula) fecharModalCriar();
    });
  }

  /* ============================================================
     5. GESTÃO DAS SALAS FIXAS / PERMANENTES DO GOOGLE MEET
     ============================================================ */
  const CHAVE_SALAS = 'KIZUNA_SALAS_FIXAS';
  const SALAS_PADRAO = {
    ingles: (window.KIZUNA_CONFIG && window.KIZUNA_CONFIG.salasMeet && window.KIZUNA_CONFIG.salasMeet.ingles) || 'https://meet.google.com',
    japones: (window.KIZUNA_CONFIG && window.KIZUNA_CONFIG.salasMeet && window.KIZUNA_CONFIG.salasMeet.japones) || 'https://meet.google.com',
    portugues: (window.KIZUNA_CONFIG && window.KIZUNA_CONFIG.salasMeet && window.KIZUNA_CONFIG.salasMeet.portugues) || 'https://meet.google.com'
  };

  function obterSalasFixas() {
    try {
      const salvo = localStorage.getItem(CHAVE_SALAS);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(CHAVE_SALAS, JSON.stringify(SALAS_PADRAO));
    return SALAS_PADRAO;
  }

  function salvarSalasFixas(salas) {
    localStorage.setItem(CHAVE_SALAS, JSON.stringify(salas));
  }

  const inpIngles = document.getElementById('input-sala-ingles');
  const inpJapones = document.getElementById('input-sala-japones');
  const inpPortugues = document.getElementById('input-sala-portugues');
  const btnSalvarSalas = document.getElementById('btn-salvar-salas-fixas');

  function carregarSalasUI() {
    const salas = obterSalasFixas();
    if (inpIngles) inpIngles.value = salas.ingles || SALAS_PADRAO.ingles;
    if (inpJapones) inpJapones.value = salas.japones || SALAS_PADRAO.japones;
    if (inpPortugues) inpPortugues.value = salas.portugues || SALAS_PADRAO.portugues;

    const linkTestIngles = document.getElementById('link-testar-ingles');
    const linkTestJapones = document.getElementById('link-testar-japones');
    const linkTestPortugues = document.getElementById('link-testar-portugues');

    if (linkTestIngles) linkTestIngles.href = inpIngles.value;
    if (linkTestJapones) linkTestJapones.href = inpJapones.value;
    if (linkTestPortugues) linkTestPortugues.href = inpPortugues.value;
  }

  if (inpIngles) inpIngles.addEventListener('input', () => { const l = document.getElementById('link-testar-ingles'); if (l) l.href = inpIngles.value; });
  if (inpJapones) inpJapones.addEventListener('input', () => { const l = document.getElementById('link-testar-japones'); if (l) l.href = inpJapones.value; });
  if (inpPortugues) inpPortugues.addEventListener('input', () => { const l = document.getElementById('link-testar-portugues'); if (l) l.href = inpPortugues.value; });

  if (btnSalvarSalas) {
    btnSalvarSalas.addEventListener('click', () => {
      const salasAtualizadas = {
        ingles: inpIngles ? inpIngles.value.trim() : SALAS_PADRAO.ingles,
        japones: inpJapones ? inpJapones.value.trim() : SALAS_PADRAO.japones,
        portugues: inpPortugues ? inpPortugues.value.trim() : SALAS_PADRAO.portugues
      };
      salvarSalasFixas(salasAtualizadas);

      const textoOriginal = btnSalvarSalas.innerHTML;
      btnSalvarSalas.innerHTML = '<i data-lucide="check" class="h-4 w-4"></i> Salas Salvas!';
      btnSalvarSalas.className = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition';
      renderIcons();

      setTimeout(() => {
        btnSalvarSalas.innerHTML = textoOriginal;
        btnSalvarSalas.className = 'inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-emerald-700 transition';
        renderIcons();
      }, 2500);
    });
  }

  // Botões de Copiar Link da Sala
  document.querySelectorAll('.btn-copiar-sala').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      navigator.clipboard.writeText(input.value).then(() => {
        const textoOriginal = btn.textContent;
        btn.textContent = 'Copiado! ✓';
        setTimeout(() => {
          btn.textContent = textoOriginal;
        }, 2000);
      });
    });
  });

  // Atualiza automaticamente o link da sala no modal de criar aula quando troca o idioma
  const selIdiomaModal = document.getElementById('nova-aula-idioma');
  const inpMeetModal = document.getElementById('nova-aula-meet');
  if (selIdiomaModal && inpMeetModal) {
    function atualizarLinkModalCriar() {
      const salas = obterSalasFixas();
      const val = selIdiomaModal.value;
      if (val === 'Inglês') inpMeetModal.value = salas.ingles;
      else if (val === 'Japonês') inpMeetModal.value = salas.japones;
      else if (val === 'Português') inpMeetModal.value = salas.portugues;
    }
    selIdiomaModal.addEventListener('change', atualizarLinkModalCriar);
    atualizarLinkModalCriar();
  }

  // Inicialização
  carregarSalasUI();
  renderizarPainel();
  atualizarEstadoProfessorUI();
  renderIcons();
})();
