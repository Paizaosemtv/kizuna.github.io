/**
 * KIZUNA LANGUAGE SCHOOL — PORTAL DO ALUNO
 * Lógica da Área de Videoaulas, Aulas ao Vivo, Testes de Conhecimento e Downloads
 */

(function () {
  'use strict';

  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ============================================================
     1. GESTÃO DE SESSÃO DO ALUNO
     ============================================================ */
  function obterSessao() {
    try {
      const raw = localStorage.getItem('KIZUNA_SESSAO_ALUNO');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function salvarSessao(sessao) {
    try {
      localStorage.setItem('KIZUNA_SESSAO_ALUNO', JSON.stringify(sessao));
    } catch (e) {
      console.warn('Erro ao salvar sessão', e);
    }
  }

  function obterProgresso() {
    try {
      const raw = localStorage.getItem('KIZUNA_ALUNO_PROGRESSO');
      return raw ? JSON.parse(raw) : { concluidas: [1, 2, 3], quizFeito: false, quizNota: 0 };
    } catch (e) {
      return { concluidas: [1, 2, 3], quizFeito: false, quizNota: 0 };
    }
  }

  function salvarProgresso(prog) {
    try {
      localStorage.setItem('KIZUNA_ALUNO_PROGRESSO', JSON.stringify(prog));
    } catch (e) {
      console.warn('Erro ao salvar progresso', e);
    }
  }

  // Se não houver sessão ativa, inicializa como Aluno VIP ou Aluno Demonstração
  let sessaoAtual = obterSessao();
  if (!sessaoAtual) {
    sessaoAtual = {
      nome: 'Aluno Kizuna',
      login: 'aluno@kizuna.com',
      cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
    };
    salvarSessao(sessaoAtual);
  }

  // Atualiza Topbar com perfil do usuário
  const topbarUserArea = document.getElementById('topbar-user-area');
  const alunoNomeDisplay = document.getElementById('aluno-nome-display');

  if (alunoNomeDisplay && sessaoAtual) {
    alunoNomeDisplay.textContent = sessaoAtual.nome || 'Aluno Kizuna';
  }

  if (topbarUserArea) {
    topbarUserArea.innerHTML =
      '<div class="flex items-center gap-2">' +
      '  <span class="grid h-9 w-9 place-items-center rounded-full bg-navy text-white text-xs font-black shadow-soft">' +
      (sessaoAtual?.nome ? sessaoAtual.nome.charAt(0).toUpperCase() : 'A') +
      '  </span>' +
      '  <div class="hidden sm:block text-left leading-none">' +
      '    <span class="block text-xs font-bold text-navy">' + (sessaoAtual?.nome || 'Aluno Kizuna') + '</span>' +
      '    <span class="text-[10px] text-emerald-700 font-semibold">● Acesso Ativo</span>' +
      '  </div>' +
      '  <button type="button" id="btn-logout-portal" class="ml-1 rounded-lg bg-navy/5 hover:bg-navy/10 px-2.5 py-1.5 text-xs font-bold text-slateink hover:text-navy transition" title="Sair da conta">Sair</button>' +
      '</div>';

    const btnLogout = document.getElementById('btn-logout-portal');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('KIZUNA_SESSAO_ALUNO');
        window.location.href = 'index.html';
      });
    }
  }

  /* ============================================================
     2. NAVEGAÇÃO DE ABAS DO PORTAL
     ============================================================ */
  const tabBtns = document.querySelectorAll('[data-portal-tab]');
  const tabContents = {
    videoaulas: document.getElementById('tab-conteudo-videoaulas'),
    'aulas-ao-vivo': document.getElementById('tab-conteudo-aulas-ao-vivo'),
    'teste-conhecimento': document.getElementById('tab-conteudo-teste-conhecimento'),
    'apostilas-download': document.getElementById('tab-conteudo-apostilas-download')
  };

  function trocarAbaPortal(tabName) {
    tabBtns.forEach((btn) => {
      const isCurrent = btn.getAttribute('data-portal-tab') === tabName;
      btn.classList.toggle('is-active', isCurrent);
      btn.classList.toggle('border-navy', isCurrent);
      btn.classList.toggle('text-navy', isCurrent);
      btn.classList.toggle('border-transparent', !isCurrent);
      btn.classList.toggle('text-slateink', !isCurrent);
    });

    Object.keys(tabContents).forEach((key) => {
      if (tabContents[key]) {
        tabContents[key].classList.toggle('hidden', key !== tabName);
      }
    });

    renderIcons();
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-portal-tab');
      trocarAbaPortal(tab);
    });
  });

  /* ============================================================
     3. GRADE CURRICULAR DE VIDEOAULAS & PLAYER INTERATIVO
     ============================================================ */
  const gradeAulas = [
    // MÓDULO 1: FUNDAMENTOS
    { id: 1, modulo: 'Módulo 1: Fundamentos', titulo: 'Fonética Comparada & Sons Essenciais (EN • PT • JP)', duracao: '18:30', prof: 'Prof. Kenji Takahashi & Sarah Jenkins', desc: 'Aprenda as articulações dos sons críticos: TH inglês, vogais puras japonesas e nasalidade do português.', docNome: 'Volume 1: Fundamentos (Capítulo 2)', docLink: 'assets/docs/apostila-vol1-fundamentos.pdf' },
    { id: 2, modulo: 'Módulo 1: Fundamentos', titulo: 'Alfabetos: Latino, Hiragana, Katakana & Romaji', duracao: '22:15', prof: 'Prof. Kenji Takahashi', desc: 'Introdução prática aos silabários japoneses e como associar os sons ao alfabeto latino.', docNome: 'Volume 1: Fundamentos (Capítulo 3)', docLink: 'assets/docs/apostila-vol1-fundamentos.pdf' },
    { id: 3, modulo: 'Módulo 1: Fundamentos', titulo: 'Saudações & Fórmulas Sociais nos 3 Idiomas', duracao: '16:40', prof: 'Profª. Sarah Jenkins', desc: 'Diferenças de formalidade entre Good Morning, Konnichiwa e Bom dia.', docNome: 'Volume 1: Fundamentos (Capítulo 4)', docLink: 'assets/docs/apostila-vol1-fundamentos.pdf' },
    { id: 4, modulo: 'Módulo 1: Fundamentos', titulo: 'Apresentação Pessoal & Identidade (Jikoshoukai)', duracao: '20:10', prof: 'Prof. Kenji Takahashi', desc: 'Como dizer seu nome, profissão, nacionalidade e cidade de origem com naturalidade.', docNome: 'Volume 1: Fundamentos (Capítulo 5)', docLink: 'assets/docs/apostila-vol1-fundamentos.pdf' },
    { id: 5, modulo: 'Módulo 1: Fundamentos', titulo: 'Números, Dinheiro & Horários no Cotidiano', duracao: '19:50', prof: 'Equipe Pedagógica', desc: 'Contagem prática de 0 a 100, preços, compras e marcação de horas.', docNome: 'Volume 1: Fundamentos (Capítulo 6)', docLink: 'assets/docs/apostila-vol1-fundamentos.pdf' },
    { id: 6, modulo: 'Módulo 1: Fundamentos', titulo: 'Estrutura de Frases: SVO vs SOV', duracao: '24:00', prof: 'Prof. Kenji Takahashi', desc: 'Entenda como o cérebro conecta o sujeito, objeto e verbo nos 3 idiomas.', docNome: 'Volume 1: Fundamentos (Capítulo 9)', docLink: 'assets/docs/apostila-vol1-fundamentos.pdf' },

    // MÓDULO 2: CONSTRUÇÃO & PRÁTICA
    { id: 7, modulo: 'Módulo 2: Construção', titulo: 'Família, Casa & Rotina Doméstica', duracao: '21:30', prof: 'Profª. Sarah Jenkins', desc: 'Tabelas temáticas de 4 colunas aplicadas a objetos da casa e parentesco.', docNome: 'Volume 2: Construção (Capítulos 1-2)', docLink: 'assets/docs/apostila-vol2-construcao.pdf' },
    { id: 8, modulo: 'Módulo 2: Construção', titulo: 'Comida, Bebidas & Pedidos em Restaurantes', duracao: '25:10', prof: 'Prof. Kenji Takahashi', desc: 'Simulações reais de pedidos, cardápios, preferências e pedir a conta.', docNome: 'Volume 2: Construção (Capítulo 3)', docLink: 'assets/docs/apostila-vol2-construcao.pdf' },
    { id: 9, modulo: 'Módulo 2: Construção', titulo: 'Animais, Natureza & Clima', duracao: '17:20', prof: 'Equipe Pedagógica', desc: 'Vocabulário da fauna, estações do ano e previsões do tempo.', docNome: 'Volume 2: Construção (Capítulo 4)', docLink: 'assets/docs/apostila-vol2-construcao.pdf' },
    { id: 10, modulo: 'Módulo 2: Construção', titulo: 'Profissões, Escritório & Cidade', duracao: '23:45', prof: 'Profª. Sarah Jenkins', desc: 'Diálogos no trabalho, transporte público e pedir direções na rua.', docNome: 'Volume 2: Construção (Capítulos 5-6)', docLink: 'assets/docs/apostila-vol2-construcao.pdf' },
    { id: 11, modulo: 'Módulo 2: Construção', titulo: 'Gramática Inglesa: Verbo To Be & Present Simple', duracao: '26:15', prof: 'Profª. Sarah Jenkins', desc: 'Construção de afirmações, negativas e perguntas com Do e Does.', docNome: 'Volume 2: Construção (Capítulo 8)', docLink: 'assets/docs/apostila-vol2-construcao.pdf' },
    { id: 12, modulo: 'Módulo 2: Construção', titulo: 'Guia Completo de Partículas Japonesas (wa, o, ni, de, no)', duracao: '28:30', prof: 'Prof. Kenji Takahashi', desc: 'O segredo para nunca mais errar as partículas estruturais do japonês.', docNome: 'Volume 2: Construção (Capítulo 9)', docLink: 'assets/docs/apostila-vol2-construcao.pdf' },

    // MÓDULO 3: DESENVOLVIMENTO & FLUÊNCIA
    { id: 13, modulo: 'Módulo 3: Fluência', titulo: 'Hiragana & Katakana Avançados', duracao: '22:00', prof: 'Prof. Kenji Takahashi', desc: 'Sons combinados (Yoon), consoantes duplas (Sokuon) e leitura rápida.', docNome: 'Volume 3: Fluência (Capítulo 1)', docLink: 'assets/docs/apostila-vol3-conversacao.pdf' },
    { id: 14, modulo: 'Módulo 3: Fluência', titulo: 'Os 20+ Kanji Fundamentais & Leituras On/Kun', duracao: '30:10', prof: 'Prof. Kenji Takahashi', desc: 'Origem dos ideogramas, traços essenciais e palavras compostas (Jukugo).', docNome: 'Volume 3: Fluência (Capítulo 2)', docLink: 'assets/docs/apostila-vol3-conversacao.pdf' },
    { id: 15, modulo: 'Módulo 3: Fluência', titulo: 'Tempos Verbais: Past Simple & Passado Mashita', duracao: '27:40', prof: 'Profª. Sarah Jenkins', desc: 'Como contar fatos do passado nos 3 idiomas com naturalidade.', docNome: 'Volume 3: Fluência (Capítulos 3-4)', docLink: 'assets/docs/apostila-vol3-conversacao.pdf' },
    { id: 16, modulo: 'Módulo 3: Fluência', titulo: 'Perguntas Complexas & Respostas Rápidas', duracao: '24:50', prof: 'Equipe Pedagógica', desc: 'Dominando Wh- Questions, Gimonshi e gírias do dia a dia.', docNome: 'Volume 3: Fluência (Capítulos 5-6)', docLink: 'assets/docs/apostila-vol3-conversacao.pdf' },
    { id: 17, modulo: 'Módulo 3: Fluência', titulo: 'Fonética Avançada, Ritmo & Pitch Accent', duracao: '23:15', prof: 'Prof. Kenji Takahashi', desc: 'Entonação musical japonesa e fluidez oral.', docNome: 'Volume 3: Fluência (Capítulo 7)', docLink: 'assets/docs/apostila-vol3-conversacao.pdf' },
    { id: 18, modulo: 'Módulo 3: Fluência', titulo: 'Grandes Diálogos & Preparação para o Teste Final', duracao: '32:00', prof: 'Prof. Kenji & Profª. Sarah', desc: 'Simulações reais de conversação e revisão completa para certificação.', docNome: 'Volume 3: Fluência (Capítulo 10)', docLink: 'assets/docs/apostila-vol3-conversacao.pdf' }
  ];

  let aulaAtivaId = 1;
  const progresso = obterProgresso();

  function atualizarBarraProgresso() {
    const totalAulas = gradeAulas.length;
    const concluidas = progresso.concluidas.length;
    const percent = Math.min(100, Math.round((concluidas / totalAulas) * 100));

    const progressoBar = document.getElementById('aluno-progresso-bar');
    const progressoPercent = document.getElementById('aluno-progresso-percent');
    const statAulasAssistidas = document.getElementById('stat-aulas-assistidas');

    if (progressoBar) progressoBar.style.width = percent + '%';
    if (progressoPercent) progressoPercent.textContent = percent + '%';
    if (statAulasAssistidas) statAulasAssistidas.textContent = concluidas + ' / ' + totalAulas + ' Aulas Concluídas';
  }

  function carregarAula(aulaId) {
    const aula = gradeAulas.find((a) => a.id === aulaId) || gradeAulas[0];
    aulaAtivaId = aula.id;

    // Atualiza Player
    const playerBadge = document.getElementById('player-badge-modulo');
    const playerTitulo = document.getElementById('player-titulo-aula');
    const playerProf = document.getElementById('player-prof-aula');
    const aulaTituloInfo = document.getElementById('aula-titulo-info');
    const aulaDescricaoInfo = document.getElementById('aula-descricao-info');

    if (playerBadge) playerBadge.textContent = aula.modulo + ' • Aula ' + aula.id;
    if (playerTitulo) playerTitulo.textContent = aula.titulo;
    if (playerProf) playerProf.textContent = aula.prof;
    if (aulaTituloInfo) aulaTituloInfo.textContent = 'Aula ' + aula.id + ': ' + aula.titulo;
    if (aulaDescricaoInfo) aulaDescricaoInfo.textContent = aula.desc;

    // Atualiza Botão Concluir
    const btnConcluir = document.getElementById('btn-concluir-aula');
    if (btnConcluir) {
      const estaConcluida = progresso.concluidas.includes(aula.id);
      btnConcluir.innerHTML = estaConcluida
        ? '<i data-lucide="check-circle-2" class="h-4 w-4"></i> <span>Aula Concluída ✓</span>'
        : '<i data-lucide="check" class="h-4 w-4"></i> <span>Marcar como Concluída</span>';
      btnConcluir.className = estaConcluida
        ? 'inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition'
        : 'inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-emerald-700 transition';
    }

    renderPlaylist();
    renderIcons();
  }

  function renderPlaylist() {
    const container = document.getElementById('playlist-aulas-container');
    if (!container) return;

    container.innerHTML = '';

    gradeAulas.forEach((aula) => {
      const isAtiva = aula.id === aulaAtivaId;
      const isConcluida = progresso.concluidas.includes(aula.id);

      const item = document.createElement('div');
      item.className =
        'flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ' +
        (isAtiva
          ? 'bg-navy/5 border-navy/30 text-navy font-bold shadow-soft'
          : 'bg-white border-navy/10 text-slateink hover:bg-sand-100');

      item.innerHTML =
        '<div class="flex items-center gap-3 pr-2">' +
        '  <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ' +
        (isConcluida ? 'bg-emerald-100 text-emerald-700' : isAtiva ? 'bg-navy text-white' : 'bg-navy/10 text-navy') +
        '">' +
        (isConcluida ? '✓' : aula.id) +
        '  </span>' +
        '  <div>' +
        '    <span class="block text-xs ' + (isAtiva ? 'text-navy font-bold' : 'text-navy') + ' line-clamp-1">' + aula.titulo + '</span>' +
        '    <span class="text-[10.5px] text-slateink">' + aula.duracao + ' • ' + aula.modulo + '</span>' +
        '  </div>' +
        '</div>' +
        '<div class="shrink-0">' +
        (isAtiva ? '<i data-lucide="play" class="h-4 w-4 text-accent"></i>' : '') +
        '</div>';

      item.addEventListener('click', () => carregarAula(aula.id));
      container.appendChild(item);
    });
  }

  // Alternar Conclusão da Aula
  const btnConcluirAula = document.getElementById('btn-concluir-aula');
  if (btnConcluirAula) {
    btnConcluirAula.addEventListener('click', () => {
      const idx = progresso.concluidas.indexOf(aulaAtivaId);
      if (idx >= 0) {
        progresso.concluidas.splice(idx, 1);
      } else {
        progresso.concluidas.push(aulaAtivaId);
      }
      salvarProgresso(progresso);
      atualizarBarraProgresso();
      carregarAula(aulaAtivaId);
    });
  }

  // Interação do Player
  const btnPlayVideo = document.getElementById('btn-play-video');
  const btnCtrlPlay = document.getElementById('btn-ctrl-play');

  function simularPlayVideo() {
    alert('▶️ Reproduzindo videoaula: ' + gradeAulas.find((a) => a.id === aulaAtivaId)?.titulo);
  }

  if (btnPlayVideo) btnPlayVideo.addEventListener('click', simularPlayVideo);
  if (btnCtrlPlay) btnCtrlPlay.addEventListener('click', simularPlayVideo);

  /* ============================================================
     4. QUIZ DE NIVELAMENTO E TESTE DE CONHECIMENTO INTERATIVO
     ============================================================ */
  const formQuiz = document.getElementById('form-quiz-nivelamento');
  const quizResultadoResumo = document.getElementById('quiz-resultado-resumo');

  if (formQuiz) {
    formQuiz.addEventListener('submit', (e) => {
      e.preventDefault();

      let acertos = 0;
      const totalPerguntas = 5;

      const explicacoes = {
        1: 'A ordem padrão em japonês é SOV (Sujeito + Objeto + Verbo), onde o verbo fica sempre no final.',
        2: 'Hajimemashite é a fórmula consagrada de apresentação inicial (muito prazer).',
        3: 'Good Evening é a saudação noturna de chegada/encontro; Good Night é usada para despedidas ou ao dormir.',
        4: 'A partícula O (を) é a marca oficial do objeto direto na gramática japonesa.',
        5: 'O passado polido dos verbos em Masu é formado substituindo Masu por Mashita (Tabemashita).'
      };

      document.querySelectorAll('.quiz-question-card').forEach((card) => {
        const qId = card.getAttribute('data-q');
        const correta = card.getAttribute('data-correct');
        const feedbackDiv = card.querySelector('.quiz-feedback');

        const inputSelecionado = card.querySelector('input[type="radio"]:checked');
        const respostaUser = inputSelecionado ? inputSelecionado.value : null;

        if (feedbackDiv) {
          if (respostaUser === correta) {
            acertos++;
            feedbackDiv.innerHTML = '✅ <strong>Correto!</strong> ' + (explicacoes[qId] || '');
            feedbackDiv.className = 'quiz-feedback block text-xs font-semibold p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-600/30';
          } else {
            feedbackDiv.innerHTML =
              '❌ <strong>Incorreto.</strong> A resposta certa é a alternativa <strong>' +
              correta +
              '</strong>. ' +
              (explicacoes[qId] || '');
            feedbackDiv.className = 'quiz-feedback block text-xs font-semibold p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-600/30';
          }
        }
      });

      const percent = Math.round((acertos / totalPerguntas) * 100);
      progresso.quizFeito = true;
      progresso.quizNota = percent;
      salvarProgresso(progresso);

      if (quizResultadoResumo) {
        quizResultadoResumo.innerHTML =
          '<span>Resultado: ' +
          acertos +
          ' de ' +
          totalPerguntas +
          ' acertos (' +
          percent +
          '%)</span>' +
          (percent >= 70
            ? ' — 🎉 <strong>Parabéns! Nível Aprovado com Sucesso!</strong>'
            : ' — 💡 <em>Revise as videoaulas e tente novamente para melhorar sua nota.</em>');
        quizResultadoResumo.classList.remove('hidden');
      }

      renderIcons();
    });
  }

  // Inicialização
  carregarAula(1);
  atualizarBarraProgresso();
  renderIcons();
})();
