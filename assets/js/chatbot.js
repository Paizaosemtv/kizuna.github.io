/**
 * ============================================================
 * KIZUNA AI SENSEI — ASSISTENTE INTELIGENTE COM IA GENERATIVA
 * ============================================================
 * Suporta IA Generativa em tempo real (Google Gemini API) +
 * Motor Semântico Neuro-Fuzzy local com base de conhecimento profunda.
 */

(function () {
  'use strict';

  // Configurações e Estado do Chat
  const AI_STATE = {
    isOpen: false,
    soundEnabled: true,
    isTyping: false,
    diagnosticStep: null,
    diagnosticData: { idioma: '', nivel: '', objetivo: '' },
    messages: [],
    geminiKey: ''
  };

  // Carrega chave do Gemini do localStorage ou config
  function getGeminiKey() {
    return localStorage.getItem('kizuna_gemini_key') || 
           (window.KIZUNA_CONFIG && window.KIZUNA_CONFIG.ai && window.KIZUNA_CONFIG.ai.geminiApiKey) || '';
  }

  // Prompt de Sistema para a IA Generativa (Gemini)
  const SYSTEM_PROMPT = `
Você é o "Kizuna AI Sensei", o assistente oficial inteligente e humanizado da Kizuna Language School.
Seu papel é responder com simpatia, naturalidade, precisão e entusiasmo a qualquer pergunta de visitantes, alunos e interessados.

============================================================
CONHECIMENTO COMPLETO DA ESCOLA KIZUNA:
============================================================

1. SIGNIFICADO E FILOSOFIA:
   - "Kizuna" (絆) em japonês significa laço forte, conexão afetiva e união entre as pessoas.
   - A escola nasceu para conectar culturas através do aprendizado leve, acolhedor e focado na vida real.

2. IDIOMAS E METODOLOGIA:
   - 🇺🇸 INGLÊS: Do iniciante absoluto (A1) ao avançado (C2). Foco 100% em destravar a fala.
     • Inglês para Viagens (aeroportos, imigração, hotéis, compras, restaurantes).
     • Business English (reuniões internacionais, entrevistas corporativas, negociações e e-mails).
     • Preparatório TOEFL e IELTS para quem quer morar ou estudar fora.
   - 🇯🇵 JAPONÊS: Do zero ao avançado.
     • Módulo Especial "Vida e Trabalho no Japão": Japonês prático para prefeitura (Shiyakusho), saúde/médico (Byouin), fábricas e escritórios (Kaisha/Koujou), bancos e reuniões de pais na escola (Hogosha-kai).
     • Alfabetos: Hiragana, Katakana e Kanji com mnemônicos visuais descomplicados.
     • Preparatório oficial JLPT (Nihongo Noryoku Shiken) do N5 ao N1 e bolsas de estudo do governo japonês (MEXT).
   - 🇧🇷 PORTUGUÊS PARA ESTRANGEIROS:
     • Portuguese for Foreigners: Para expatriados, turistas, imigrantes e profissionais que vivem ou fazem negócios no Brasil. Preparatório oficial para o exame Celpe-Bras.

3. COMO COMPRAR / MATRICULAR-SE / PREÇOS:
   - Aula Experimental: 100% GRATUITA ao vivo com professor pelo Google Meet. O aluno escolhe o melhor dia e horário.
   - Coleção Didática Completa: Apenas R$ 47,00 em pagamento único via Pix ou cartão. Libera na hora os 3 volumes em PDF com leitor interativo e áudios de pronúncia:
     • Volume 1: Fundamentos (Fonética, saudações, primeiros diálogos).
     • Volume 2: Construção & Prática (Vocabulário temático e estruturas cotidianas).
     • Volume 3: Fluência & Conversação (Expressões nativas e business).
   - Chave Pix da escola: pix@kizunalanguageschool.com
   - Códigos de Acesso às Apostilas: KIZUNA-VIP-2026 (Combo VIP), KIZUNA-EN-2026 (Inglês), KIZUNA-JP-2026 (Japonês), KIZUNA-PT-2026 (Português).
   - Planos de aulas: Turmas reduzidas e aulas individuais VIP com horários flexíveis.

4. PORTAL DO ALUNO (aluno.html):
   - Acesso com e-mail e senha no topo do site.
   - Contas de demonstração para testes: aluno@kizuna.com / senha123 (ou aluno.vip@kizuna.com).
   - No portal, o aluno tem leitor de apostilas, exercícios e salas fixas do Google Meet.

5. DEGUSTAÇÃO DE IDIOMAS (idiomas.html):
   - Página interativa onde qualquer pessoa pode ouvir áudios com pronúncia nativa e treinar frases práticas.

6. CERTIFICADOS:
   - Ao concluir cada nível, o aluno recebe um Certificado Oficial de Conclusão válido para LinkedIn, currículo e horas complementares acadêmicas.

============================================================
DIRETRIZES DE RESPOSTA DO BOT:
============================================================
- Seja acolhedor, objetivo, prestativo e use emojis para tornar a leitura agradável.
- Use formatação Markdown (negrito, listas com marcadores).
- Se perguntarem como comprar ou se matricular, explique o passo a passo de 2 etapas (comprar a coleção didática por R$ 47 e agendar a aula gratuita no Meet).
- Se pedirem traduções para japonês ou inglês, forneça a frase traduzida, a pronúncia (romaji / fonética) e uma breve dica cultural.
- Mantenha respostas com tamanho ideal (2 a 4 parágrafos curtos).
`;

  // Base de Conhecimento Semântica Profunda (Motor Local Avançado)
  const KIZUNA_KB = [
    {
      intent: 'como_comprar_matricula',
      triggers: [
        'como comprar', 'comprar', 'compra', 'adquirir', 'matricular', 'matricula', 'matrícula', 
        'inscrever', 'inscricao', 'inscrição', 'virar aluno', 'como faco para comprar', 'como faço para comprar', 
        'como entro no curso', 'quero comprar', 'onde compro', 'onde pagar', 'como pagar', 'quero ser aluno', 
        'forma de pagamento', 'pagamento', 'pix', 'cartao', 'cartão', 'preco', 'preço', 'valor', 'quanto custa', 'mensalidade'
      ],
      response: 'Para se matricular e começar a estudar na **Kizuna**, o processo é super simples e rápido em 2 etapas! 🚀\n\n1️⃣ **Adquira sua Coleção Didática Oficial (Apenas R$ 47,00):**\n• Pagamento único via **Pix** (`pix@kizunalanguageschool.com`) com liberação instantânea.\n• Inclui os **3 Volumes completos em PDF** com leitor interativo e áudios de pronúncia nativa.\n\n2️⃣ **Agende sua 1ª Aula com o Professor (100% Gratuita):**\n• Você faz uma aula demonstrativa ao vivo pelo **Google Meet** para conhecer seu professor, tirar dúvidas e alinhar sua rotina de estudos.\n\nEscolha uma das opções abaixo para começar agora mesmo:',
      actions: [
        { label: '📚 Comprar Coleção Completa (R$ 47)', action: 'abrir_compras', style: 'primary' },
        { label: '📅 Agendar Aula Experimental Grátis', action: 'agendar_aula', style: 'secondary' },
        { label: '🟢 Falar no WhatsApp com Atendente', action: 'abrir_whatsapp', style: 'secondary' }
      ],
      suggestions: ['📚 Comprar Coleção por R$ 47', '📅 Agendar aula grátis', '💳 Como funciona o Pix?']
    },
    {
      intent: 'aula_experimental',
      triggers: [
        'aula experimental', 'experimental', 'aula gratis', 'aula gratuita', 'aula de graca', 'aula de graça', 
        'testar aula', 'agendar aula', 'marcar aula', 'primeira aula', 'demonstrativa', 'como funciona a aula'
      ],
      response: 'A **Aula Experimental Gratuita da Kizuna** é o melhor caminho para você dar o primeiro passo! 🎯\n\n• **Ao vivo pelo Google Meet:** Você conversa em tempo real com nossos professores especialistas.\n• **Zero custo e sem compromisso:** Experimente nossa didática prática antes de tomar qualquer decisão.\n• **Diagnóstico de Nível:** Descubra exatamente em qual estágio você está e receba um plano de estudos personalizado.',
      actions: [
        { label: '📅 Agendar Minha Aula Grátis Agora', action: 'agendar_aula', style: 'primary' },
        { label: '🎧 Ouvir Degustação de Áudios', action: 'abrir_degustacao', style: 'secondary' }
      ],
      suggestions: ['📅 Agendar agora', '🇺🇸 Cursos de Inglês', '🇯🇵 Cursos de Japonês']
    },
    {
      intent: 'japao_vida',
      triggers: [
        'japao', 'japão', 'morar no japao', 'viver no japao', 'fabrica', 'fábrica', 'shiyakusho', 
        'prefeitura', 'hospital', 'byouin', 'kaisha', 'decasségui', 'dekassegui', 'nihongo', 'cotidiano japao', 'visto japao'
      ],
      response: 'Temos um treinamento exclusivo de **Japonês Prático para a Vida no Japão** 🇯🇵:\n\n🏛️ **Shiyakusho (Prefeitura):** Formulários de visto, seguro de saúde (Kokumin Kenko Hoken), imposto e certidões.\n🏥 **Byouin (Hospitais):** Como explicar sintomas médicos, emergências e comprar remédios.\n🏭 **Kaisha & Fábricas:** Vocabulário de linha de produção, normas de segurança e comunicação com encarregados.\n🏫 **Escolas dos Filhos:** Reuniões escolares (Hogosha-kai) e avisos em japonês.',
      actions: [
        { label: '📅 Agendar Aula de Japonês Gratuita', action: 'agendar_aula', style: 'primary' },
        { label: '🎧 Degustação de Japonês com Áudio', action: 'abrir_degustacao', style: 'secondary' }
      ],
      suggestions: ['🇯🇵 O que é JLPT?', '🌱 Começar japonês do zero', '📅 Agendar aula de Japonês']
    },
    {
      intent: 'iniciante_zero',
      triggers: [
        'iniciante', 'do zero', 'nunca estudei', 'nao sei nada', 'não sei nada', 'vergonha', 
        'medo de errar', 'comecar do zero', 'começar do zero', 'dificil', 'difícil', 'primeiros passos'
      ],
      response: 'Fique 100% tranquilo! Mais de **70% dos nossos alunos começaram do absoluto zero** 🌱.\n\n• **Ambiente Acolhedor:** Professores pacientes que respeitam o seu ritmo individual.\n• **Foco em Conversação:** Você já aprende a formar e falar frases reais na primeira aula.\n• **Sem Decoreba:** Métodos visuais, mnemônicos e áudios que facilitam a fixação.',
      actions: [
        { label: '📅 Agendar Aula Iniciante Gratuita', action: 'agendar_aula', style: 'primary' },
        { label: '📚 Ver Apostila Volume 1 (Fundamentos)', action: 'abrir_compras', style: 'secondary' }
      ],
      suggestions: ['🇺🇸 Curso de Inglês', '🇯🇵 Curso de Japonês', '💰 Quanto custam os materiais?']
    },
    {
      intent: 'ingles_curso',
      triggers: ['ingles', 'inglês', 'english', 'toefl', 'ielts', 'conversacao ingles', 'business english', 'viagem ingles'],
      response: 'Nosso curso de **Inglês** é projetado para destravar sua comunicação no mundo 🇺🇸:\n\n• **Inglês para Viagens:** Aeroportos, alfândega, hotéis, restaurantes e emergências.\n• **Business English:** Entrevistas internacionais, reuniões corporativas e e-mails profissionais.\n• **Preparatório TOEFL / IELTS:** Estruturas e pontuações para intercâmbio e visto.\n• **Do Iniciante ao Avançado (A1 a C2).**',
      actions: [
        { label: '📅 Agendar Aula de Inglês Grátis', action: 'agendar_aula', style: 'primary' },
        { label: '🎧 Degustação de Inglês com Áudio', action: 'abrir_degustacao', style: 'secondary' }
      ],
      suggestions: ['📅 Agendar aula de Inglês', '📚 Ver apostilas de Inglês', '🎯 Fazer teste de nível']
    },
    {
      intent: 'japones_curso',
      triggers: ['japones', 'japonês', 'japanese', 'hiragana', 'katakana', 'kanji', 'jlpt', 'n5', 'n4', 'n3', 'n2', 'n1', 'mext'],
      response: 'O curso de **Japonês da Kizuna** ensina o idioma com praticidade e imersão cultural 🇯🇵:\n\n• **Alfabetos Descomplicados:** Domine Hiragana, Katakana e Kanji com métodos visuais.\n• **Conversação Natural:** Fale como os nativos no cotidiano.\n• **Preparatório Oficial JLPT:** Estrutura completa do N5 (básico) ao N1 (fluência total).\n• **Bolsas MEXT & Intercâmbio Universitário.**',
      actions: [
        { label: '📅 Agendar Aula de Japonês Grátis', action: 'agendar_aula', style: 'primary' },
        { label: '🎧 Degustação de Japonês com Áudio', action: 'abrir_degustacao', style: 'secondary' }
      ],
      suggestions: ['🇯🇵 Vida no Japão', '📅 Agendar aula de Japonês', '📚 Coleção de Japonês']
    },
    {
      intent: 'portugues_curso',
      triggers: ['portugues', 'português', 'portuguese', 'estrangeiro', 'gringo', 'celpe-bras', 'brasil'],
      response: 'O curso de **Português para Estrangeiros** (Portuguese for Foreigners) é ideal para expatriados, descendentes e turistas 🇧🇷:\n\n• **Portuguese for Daily Life & Business:** Comunicação clara e natural no Brasil.\n• **Preparatório Celpe-Bras:** Certificado oficial de proficiência em português.\n• **Imersão Cultural:** Expressões regionais, cultura e etiqueta brasileira.',
      actions: [
        { label: '📅 Agendar Aula de Português Grátis', action: 'agendar_aula', style: 'primary' },
        { label: '🎧 Degustação de Português com Áudio', action: 'abrir_degustacao', style: 'secondary' }
      ],
      suggestions: ['📅 Agendar aula de Português', '💰 Valores', '💬 Falar no WhatsApp']
    },
    {
      intent: 'apostilas_materiais',
      triggers: ['apostila', 'apostilas', 'material', 'livro', 'pdf', 'volume 1', 'volume 2', 'volume 3', 'codigo', 'código', 'desbloquear', 'senha material', 'baixar'],
      response: 'Nossa **Coleção Didática Oficial** reúne todo o conteúdo do curso 📚:\n\n• **Volume 1 - Fundamentos:** Alfabetos, fonética, primeiras construções e saudações.\n• **Volume 2 - Construção & Cotidiano:** Gramática comunicativa, vocabulário temático e diálogos.\n• **Volume 3 - Fluência & Conversação:** Expressões idiomáticas, business e debates.\n\n💡 *Por apenas R$ 47,00 (pagamento único), você desbloqueia os 3 volumes imediatamente em PDF com leitor interativo!*',
      actions: [
        { label: '📚 Adquirir Coleção Completa (R$ 47)', action: 'abrir_compras', style: 'primary' }
      ],
      suggestions: ['💰 Como pagar com Pix?', '🔑 Como faço login?', '📅 Agendar aula gratuita']
    },
    {
      intent: 'login_aluno',
      triggers: ['login', 'portal do aluno', 'entrar aluno', 'senha', 'esqueci a senha', 'acesso aluno', 'minha conta', 'sala de aula'],
      response: 'Para acessar o **Portal do Aluno Kizuna** 🎓:\n\n1. Clique no botão **"Portal do Aluno"** no topo da página ou no botão abaixo.\n2. Insira seu e-mail e senha cadastrados.\n\n*💡 Contas de demonstração para testes:*\n• **Login:** `aluno@kizuna.com`\n• **Senha:** `senha123`\n\nNo portal você acessa seus materiais digitais e as salas de aula ao vivo no Google Meet!',
      actions: [
        { label: '🎓 Abrir Portal do Aluno', action: 'abrir_login', style: 'primary' }
      ],
      suggestions: ['🔑 Testar conta demo', '📚 Minhas apostilas', '💬 Falar com suporte']
    },
    {
      intent: 'atendimento_humano',
      triggers: ['humano', 'atendente', 'falar com alguem', 'falar com alguém', 'whatsapp', 'telefone', 'contato', 'secretaria', 'pessoa'],
      response: 'Nossa equipe de atendimento e coordenação pedagógica está pronta para te atender no WhatsApp 🟢:\n\n• Tire dúvidas sobre horários e planos sob medida\n• Converse diretamente com nossos professores\n• Atendimento humanizado e rápido!',
      actions: [
        { label: '🟢 Conversar no WhatsApp Agora', action: 'abrir_whatsapp', style: 'primary' }
      ],
      suggestions: ['📅 Agendar aula experimental', '💰 Valores dos cursos', '❓ Voltar ao início']
    },
    {
      intent: 'saudacao',
      triggers: ['ola', 'olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'hey', 'hello', 'konnichiwa', 'tudo bem'],
      response: 'Konnichiwa! 👋 Eu sou o **Sensei AI**, o assistente inteligente da **Kizuna Language School**.\n\nEstou aqui para tirar todas as suas dúvidas sobre nossos cursos de **Inglês, Japonês e Português**, valores, aulas experimentais gratuitas e muito mais!\n\nComo posso ajudar você hoje?',
      suggestions: [
        '📚 Como faço para comprar o curso?',
        '📅 Como funciona a aula experimental?',
        '🇯🇵 Como é o japonês para quem vive no Japão?',
        '🔑 Como entro no Portal do Aluno?'
      ]
    }
  ];

  // Tradutor Rápido
  const MINI_DICIONARIO = [
    { pt: 'obrigado', jp: 'ありがとう (Arigatou / Arigatou gozaimasu)', en: 'Thank you / Thanks' },
    { pt: 'bom dia', jp: 'おはようございます (Ohayou gozaimasu)', en: 'Good morning' },
    { pt: 'boa tarde', jp: 'こんにちは (Konnichiwa)', en: 'Good afternoon / Hello' },
    { pt: 'boa noite', jp: 'こんばんは (Konbanwa) / おやすみなさい (Oyasuminasai - ao dormir)', en: 'Good evening / Good night' },
    { pt: 'por favor', jp: 'お願いします (Onegaishimasu) / どうぞ (Douzo)', en: 'Please' },
    { pt: 'com licença', jp: 'すみません (Sumimasen)', en: 'Excuse me / Pardon' },
    { pt: 'quanto custa', jp: 'いくらですか？ (Ikura desu ka?)', en: 'How much is it?' },
    { pt: 'onde fica o banheiro', jp: 'トイレはどこですか？ (Toire wa doko desu ka?)', en: 'Where is the bathroom / restroom?' },
    { pt: 'socorro', jp: '助けてください (Tasukete kudasai)', en: 'Help me / Help!' },
    { pt: 'agua', jp: '水 (Mizu) / お水 (Omizu)', en: 'Water' }
  ];

  // Inicialização do Chatbot
  function initChatbot() {
    if (document.getElementById('kizuna-ai-root')) return;

    AI_STATE.geminiKey = getGeminiKey();
    renderChatWidgetHTML();
    bindChatEvents();
    loadSessionChat();
  }

  // Renderiza a estrutura HTML do Widget
  function renderChatWidgetHTML() {
    const root = document.createElement('div');
    root.id = 'kizuna-ai-root';
    root.className = 'font-sans antialiased text-navy';

    const hasGemini = Boolean(AI_STATE.geminiKey);

    root.innerHTML = `
      <!-- Launcher Button (Botão Flutuante) -->
      <div id="kizuna-ai-launcher-container" class="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50">
        <button id="kizuna-ai-trigger" type="button" aria-label="Abrir assistente virtual Kizuna AI"
          class="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-navy-900 via-navy to-accent text-white shadow-lift transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer">
          
          <span class="absolute -inset-1 rounded-full bg-accent/30 opacity-75 blur-sm animate-pulse group-hover:opacity-100"></span>
          
          <span id="kizuna-ai-icon-closed" class="relative flex items-center justify-center">
            <svg class="h-7 w-7 text-white transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-navy-900"></span>
            </span>
          </span>

          <span id="kizuna-ai-icon-opened" class="hidden relative">
            <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </span>
        </button>

        <!-- Tooltip Balão Inicial -->
        <div id="kizuna-ai-tooltip" class="absolute bottom-full right-0 mb-3 hidden sm:flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lift border border-navy/10 backdrop-blur-md text-xs font-bold text-navy whitespace-nowrap animate-bounce">
          <span class="text-base">💬</span>
          <span>Dúvidas? Pergunte à nossa IA Kizuna!</span>
          <button id="kizuna-ai-tooltip-close" class="ml-1 text-slateink hover:text-navy text-sm font-black">&times;</button>
        </div>
      </div>

      <!-- Janela Principal do Chat -->
      <div id="kizuna-ai-window" class="hidden fixed bottom-24 right-5 sm:right-7 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-7.5rem)] bg-white/98 sm:rounded-3xl shadow-2xl border border-navy/15 backdrop-blur-xl flex flex-col overflow-hidden z-50">
        
        <!-- Header do Chat -->
        <div class="relative bg-gradient-to-r from-navy-900 via-navy to-navy-700 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-soft">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-navy-900"></span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-extrabold tracking-tight">Kizuna AI Sensei</h3>
                <span id="kizuna-ai-status-badge" class="rounded-full ${hasGemini ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'} text-[10px] font-bold px-2 py-0.5 border">
                  ${hasGemini ? '✨ Gemini AI' : '⚡ IA Ativa 24/7'}
                </span>
              </div>
              <p class="text-[11px] text-sand-200/80">Cursos, matrículas, valores e suporte</p>
            </div>
          </div>

          <!-- Controles do Header -->
          <div class="flex items-center gap-1">
            <button id="kizuna-ai-settings-btn" type="button" title="Configurar Chave Gemini AI" class="p-2 rounded-xl text-sand-200/80 hover:text-white hover:bg-white/10 transition">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button id="kizuna-ai-sound-btn" type="button" title="Alternar som do assistente" class="p-2 rounded-xl text-sand-200/80 hover:text-white hover:bg-white/10 transition">
              <svg id="kizuna-sound-on-icon" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <svg id="kizuna-sound-off-icon" class="h-4 w-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
            </button>
            <button id="kizuna-ai-clear-btn" type="button" title="Reiniciar conversa" class="p-2 rounded-xl text-sand-200/80 hover:text-white hover:bg-white/10 transition">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <button id="kizuna-ai-close-btn" type="button" title="Fechar chat" class="p-2 rounded-xl text-sand-200/80 hover:text-white hover:bg-white/10 transition">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Painel de Configurações da Chave Gemini (Modal Interno) -->
        <div id="kizuna-ai-settings-panel" class="hidden p-4 bg-sand-100 border-b border-navy/15 text-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="font-extrabold text-navy flex items-center gap-1.5">
              <span>⚙️</span> Conectar Google Gemini AI
            </span>
            <button id="kizuna-ai-settings-close" class="text-slateink hover:text-navy font-bold">&times;</button>
          </div>
          <p class="text-[11px] text-slateink mb-2.5">
            Insira sua chave gratuita da API do Gemini (obtida em <a href="https://aistudio.google.com/" target="_blank" class="text-accent underline font-semibold">aistudio.google.com</a>) para ativar respostas generativas ultra-inteligentes:
          </p>
          <div class="flex gap-2">
            <input id="kizuna-gemini-input" type="password" placeholder="Cole sua chave API aqui (AIzaSy...)" 
              value="${AI_STATE.geminiKey}"
              class="flex-1 rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs text-navy focus:outline-none">
            <button id="kizuna-gemini-save-btn" type="button" class="rounded-xl bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-soft hover:bg-navy-700 transition">
              Salvar
            </button>
          </div>
          ${AI_STATE.geminiKey ? '<p class="text-[10px] text-emerald-700 font-bold mt-1.5">✓ Chave salva e ativa no navegador!</p>' : ''}
        </div>

        <!-- Área de Mensagens (Scrollable) -->
        <div id="kizuna-ai-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-sand/40 text-xs sm:text-sm">
        </div>

        <!-- Indicador de Digitação -->
        <div id="kizuna-ai-typing" class="hidden px-4 py-2 bg-sand/40 text-xs text-slateink flex items-center gap-2">
          <span class="flex gap-1 items-center bg-white px-3 py-1.5 rounded-full border border-navy/10 shadow-xs">
            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-bounce"></span>
            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></span>
            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]"></span>
            <span class="ml-1 text-[11px] font-semibold text-slateink">Sensei AI está pensando...</span>
          </span>
        </div>

        <!-- Barra de Sugestões Rápidas (Chips) -->
        <div id="kizuna-ai-chips-container" class="px-3 py-2 bg-white border-t border-navy/5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        </div>

        <!-- Campo de Input & Envio -->
        <form id="kizuna-ai-form" class="p-3 bg-white border-t border-navy/10 flex items-center gap-2 shrink-0">
          <input id="kizuna-ai-input" type="text" autocomplete="off" placeholder="Escreva sua dúvida aqui..."
            class="flex-1 rounded-2xl border border-navy/15 bg-sand-100 px-4 py-3 text-xs sm:text-sm text-navy placeholder:text-slateink/60 focus:border-navy focus:bg-white focus:outline-none transition shadow-inner">
          
          <button type="submit" id="kizuna-ai-send-btn" aria-label="Enviar mensagem"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy text-white shadow-soft transition hover:bg-navy-700 active:scale-95 disabled:opacity-50 cursor-pointer">
            <svg class="h-4 w-4 transform rotate-45 -translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </form>

      </div>
    `;

    document.body.appendChild(root);
  }

  // Associa os Eventos de Interação
  function bindChatEvents() {
    const trigger = document.getElementById('kizuna-ai-trigger');
    const closeBtn = document.getElementById('kizuna-ai-close-btn');
    const clearBtn = document.getElementById('kizuna-ai-clear-btn');
    const soundBtn = document.getElementById('kizuna-ai-sound-btn');
    const settingsBtn = document.getElementById('kizuna-ai-settings-btn');
    const settingsClose = document.getElementById('kizuna-ai-settings-close');
    const geminiSaveBtn = document.getElementById('kizuna-gemini-save-btn');
    const geminiInput = document.getElementById('kizuna-gemini-input');
    const form = document.getElementById('kizuna-ai-form');
    const input = document.getElementById('kizuna-ai-input');
    const tooltipClose = document.getElementById('kizuna-ai-tooltip-close');

    if (trigger) trigger.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', () => setChatOpen(false));
    if (clearBtn) clearBtn.addEventListener('click', resetChat);
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const panel = document.getElementById('kizuna-ai-settings-panel');
        if (panel) panel.classList.toggle('hidden');
      });
    }

    if (settingsClose) {
      settingsClose.addEventListener('click', () => {
        const panel = document.getElementById('kizuna-ai-settings-panel');
        if (panel) panel.classList.add('hidden');
      });
    }

    if (geminiSaveBtn && geminiInput) {
      geminiSaveBtn.addEventListener('click', () => {
        const key = geminiInput.value.trim();
        AI_STATE.geminiKey = key;
        localStorage.setItem('kizuna_gemini_key', key);
        
        const badge = document.getElementById('kizuna-ai-status-badge');
        if (badge) {
          badge.textContent = key ? '✨ Gemini AI' : '⚡ IA Ativa 24/7';
          badge.className = `rounded-full ${key ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'} text-[10px] font-bold px-2 py-0.5 border`;
        }

        const panel = document.getElementById('kizuna-ai-settings-panel');
        if (panel) panel.classList.add('hidden');

        addMessageToUI({
          sender: 'bot',
          text: key 
            ? '✨ **Conexão com Google Gemini AI ativada com sucesso!** Agora estou utilizando inteligência generativa em tempo real para responder qualquer pergunta sobre a Kizuna!'
            : '⚡ Chave removida. O assistente continuará funcionando com o motor semântico inteligente local da Kizuna!'
        });
      });
    }

    if (tooltipClose) {
      tooltipClose.addEventListener('click', (e) => {
        e.stopPropagation();
        const tip = document.getElementById('kizuna-ai-tooltip');
        if (tip) {
          tip.classList.add('hidden');
          tip.style.display = 'none';
        }
      });
    }

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const texto = input.value.trim();
        if (!texto || AI_STATE.isTyping) return;
        input.value = '';
        processUserMessage(texto);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AI_STATE.isOpen) {
        setChatOpen(false);
      }
    });

    setTimeout(() => {
      if (!sessionStorage.getItem('kizuna_chat_opened') && !AI_STATE.isOpen) {
        const tip = document.getElementById('kizuna-ai-tooltip');
        if (tip) tip.classList.remove('hidden');
      }
    }, 3000);
  }

  function toggleChat() {
    setChatOpen(!AI_STATE.isOpen);
  }

  function setChatOpen(open) {
    AI_STATE.isOpen = open;
    const win = document.getElementById('kizuna-ai-window');
    const iconClosed = document.getElementById('kizuna-ai-icon-closed');
    const iconOpened = document.getElementById('kizuna-ai-icon-opened');
    const tooltip = document.getElementById('kizuna-ai-tooltip');

    if (tooltip) {
      tooltip.classList.add('hidden');
      tooltip.style.display = 'none';
    }

    if (open) {
      sessionStorage.setItem('kizuna_chat_opened', 'true');
      if (win) {
        win.classList.remove('hidden');
        win.style.display = 'flex';
      }
      if (iconClosed) iconClosed.classList.add('hidden');
      if (iconOpened) iconOpened.classList.remove('hidden');
      
      const input = document.getElementById('kizuna-ai-input');
      if (input && window.innerWidth > 640) input.focus();

      if (AI_STATE.messages.length === 0) {
        sendBotGreeting();
      } else {
        scrollToBottom();
      }
    } else {
      if (win) {
        win.classList.add('hidden');
        win.style.display = 'none';
      }
      if (iconClosed) iconClosed.classList.remove('hidden');
      if (iconOpened) iconOpened.classList.add('hidden');
    }
  }

  function toggleSound() {
    AI_STATE.soundEnabled = !AI_STATE.soundEnabled;
    const onIcon = document.getElementById('kizuna-sound-on-icon');
    const offIcon = document.getElementById('kizuna-sound-off-icon');
    if (onIcon && offIcon) {
      onIcon.classList.toggle('hidden', !AI_STATE.soundEnabled);
      offIcon.classList.toggle('hidden', AI_STATE.soundEnabled);
    }
  }

  function playNotificationBeep() {
    if (!AI_STATE.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {}
  }

  function speakText(text, lang = 'pt-BR') {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`[\]()]/g, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  function sendBotGreeting() {
    const greetingObj = KIZUNA_KB.find(k => k.intent === 'saudacao');
    addMessageToUI({
      sender: 'bot',
      text: greetingObj.response,
      suggestions: greetingObj.suggestions
    });
  }

  function resetChat() {
    AI_STATE.messages = [];
    AI_STATE.diagnosticStep = null;
    AI_STATE.diagnosticData = { idioma: '', nivel: '', objetivo: '' };
    sessionStorage.removeItem('kizuna_chat_history');
    
    const container = document.getElementById('kizuna-ai-messages');
    if (container) container.innerHTML = '';
    
    sendBotGreeting();
  }

  // Processa mensagem do usuário (com chamada à API do Gemini ou Motor Semântico Local)
  async function processUserMessage(texto) {
    addMessageToUI({ sender: 'user', text: texto });
    setTyping(true);

    const apiKey = getGeminiKey();

    if (apiKey) {
      try {
        const geminiReply = await queryGeminiAPI(texto, apiKey);
        setTyping(false);
        addMessageToUI(geminiReply);
        playNotificationBeep();
        return;
      } catch (err) {
        console.warn('Falha no Gemini, usando motor semântico local:', err);
      }
    }

    // Fallback inteligente para o Motor Semântico Local
    setTimeout(() => {
      const botResponse = generateLocalSemanticAnswer(texto);
      setTyping(false);
      addMessageToUI(botResponse);
      playNotificationBeep();
    }, 450);
  }

  // Chamada à API do Google Gemini com suporte a múltiplos modelos e system_instruction
  async function queryGeminiAPI(prompt, apiKey) {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Histórico de mensagens
        const historyContents = [];
        AI_STATE.messages.slice(-6).forEach(m => {
          historyContents.push({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          });
        });

        historyContents.push({ role: 'user', parts: [{ text: prompt }] });

        const requestBody = {
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: historyContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          // Tenta formato alternativo sem system_instruction caso a versão não aceite
          const fallbackBody = {
            contents: [
              { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nUsuário pergunta: ' + prompt }] }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          };

          const retryResp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackBody)
          });

          if (!retryResp.ok) {
            throw new Error(`Erro na API (${model}): ${retryResp.status}`);
          }

          const retryData = await retryResp.json();
          const candidateText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return formatGeminiResponse(candidateText, prompt);
          }
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          return formatGeminiResponse(candidateText, prompt);
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Não foi possível obter resposta da IA Gemini');
  }

  // Formata a resposta do Gemini e anexa botões de ação contextuais
  function formatGeminiResponse(candidateText, prompt) {
    const actions = [];
    const lower = (prompt + ' ' + candidateText).toLowerCase();

    if (lower.includes('comprar') || lower.includes('compra') || lower.includes('preco') || lower.includes('preço') || lower.includes('valor') || lower.includes('47') || lower.includes('matricula') || lower.includes('matrícula') || lower.includes('apostila')) {
      actions.push({ label: '📚 Comprar Coleção Didática (R$ 47)', action: 'abrir_compras', style: 'primary' });
    }
    if (lower.includes('aula') || lower.includes('gratis') || lower.includes('grátis') || lower.includes('experimental') || lower.includes('agendar') || lower.includes('demonstrativa')) {
      actions.push({ label: '📅 Agendar Aula Experimental Grátis', action: 'agendar_aula', style: 'secondary' });
    }
    if (lower.includes('degustacao') || lower.includes('degustação') || lower.includes('ouvir') || lower.includes('audio') || lower.includes('áudio') || lower.includes('pronuncia') || lower.includes('pronúncia')) {
      actions.push({ label: '🎧 Degustação de Idiomas', action: 'abrir_degustacao', style: 'secondary' });
    }
    if (lower.includes('aluno') || lower.includes('login') || lower.includes('portal')) {
      actions.push({ label: '🎓 Portal do Aluno', action: 'abrir_login', style: 'secondary' });
    }
    if (lower.includes('whatsapp') || lower.includes('humano') || lower.includes('atendente') || lower.includes('secretaria') || lower.includes('contato')) {
      actions.push({ label: '🟢 Falar no WhatsApp com Atendente', action: 'abrir_whatsapp', style: 'secondary' });
    }

    return {
      sender: 'bot',
      text: candidateText,
      actions: actions.slice(0, 3),
      suggestions: ['📚 Como comprar o curso?', '📅 Agendar aula gratuita', '🇯🇵 Vida no Japão', '💬 Falar no WhatsApp']
    };
  }

  // Normalizador de Texto e Removedor de Acentos
  function normalizeText(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Motor Semântico Neuro-Fuzzy Local (Offline & Instantâneo)
  function generateLocalSemanticAnswer(rawInput) {
    const raw = rawInput.trim();
    const input = normalizeText(raw);

    // 1. Dicionário de Expressões Úteis
    const matchDic = MINI_DICIONARIO.find(d => 
      input.includes(normalizeText(d.pt)) || input.includes(normalizeText(d.en))
    );
    if (input.startsWith('como se diz') || input.startsWith('como fala') || input.startsWith('traduz') || (matchDic && input.split(' ').length <= 4)) {
      if (matchDic) {
        return {
          sender: 'bot',
          text: `Aqui está a tradução da expressão **"${matchDic.pt}"**:\n\n🇯🇵 **Japonês:** ${matchDic.jp}\n🇺🇸 **Inglês:** ${matchDic.en}\n🇧🇷 **Português:** ${matchDic.pt}\n\n💡 *Dica: Clique no alto-falante para ouvir a pronúncia!*`,
          speechLang: 'ja-JP',
          suggestions: ['🎧 Degustação de Idiomas', '📅 Agendar Aula Gratuita', '❓ Fazer outra pergunta']
        };
      }
    }

    // 2. Classificador Semântico com Pontuação Ponderada
    let bestMatch = null;
    let highestScore = 0;

    const userWords = input.split(' ').filter(w => w.length > 1);

    KIZUNA_KB.forEach(item => {
      let score = 0;
      item.triggers.forEach(trigger => {
        const normTrigger = normalizeText(trigger);
        
        // Correspondência exata da frase de gatilho
        if (input.includes(normTrigger)) {
          score += 15;
        }

        // Correspondência por raiz das palavras (Stemming)
        const triggerWords = normTrigger.split(' ');
        triggerWords.forEach(tw => {
          userWords.forEach(uw => {
            if (uw === tw) score += 4;
            else if (uw.length > 4 && tw.length > 4 && (uw.startsWith(tw.slice(0, 4)) || tw.startsWith(uw.slice(0, 4)))) {
              score += 3; // Ex: compr / compra / comprar
            }
          });
        });
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    // Se encontrou intenção confiável
    if (bestMatch && highestScore >= 3) {
      return {
        sender: 'bot',
        text: bestMatch.response,
        actions: bestMatch.actions,
        suggestions: bestMatch.suggestions
      };
    }

    // 3. Resposta Resolutiva Geral (Direcionando para Compra e Aula Gratuita)
    return {
      sender: 'bot',
      text: `Excelente pergunta sobre **"${raw}"**! 💡\n\nNa **Kizuna**, você pode:\n\n1. **Adquirir a Coleção Didática Completa (R$ 47,00)** com os 3 volumes em PDF e leitor interativo.\n2. **Agendar uma Aula Experimental 100% Gratuita** ao vivo pelo Google Meet com nossos professores.\n3. **Conversar diretamente com a coordenação no WhatsApp** para tirar dúvidas específicas.\n\nComo você prefere continuar?`,
      actions: [
        { label: '📚 Comprar Coleção Didática (R$ 47)', action: 'abrir_compras', style: 'primary' },
        { label: '📅 Agendar Aula Experimental Grátis', action: 'agendar_aula', style: 'secondary' },
        { label: '🟢 Falar com Atendente no WhatsApp', action: 'abrir_whatsapp', style: 'secondary' }
      ],
      suggestions: [
        '📚 Como comprar o curso?',
        '📅 Agendar aula gratuita',
        '🇯🇵 Japonês para quem mora no Japão',
        '🔑 Login do Portal do Aluno'
      ]
    };
  }

  // Renderiza a mensagem na tela
  function addMessageToUI(msgObj) {
    const container = document.getElementById('kizuna-ai-messages');
    if (!container) return;

    const isUser = msgObj.sender === 'user';
    const msgElement = document.createElement('div');
    msgElement.className = `flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fadeIn`;

    const formattedText = formatMarkdown(msgObj.text);

    let html = '';

    if (isUser) {
      html = `
        <div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-navy px-4 py-2.5 text-white shadow-soft text-xs sm:text-[13.5px] leading-relaxed">
          ${formattedText}
        </div>
        <span class="text-[10px] text-slateink/70 mr-1">${getCurrentTime()}</span>
      `;
    } else {
      html = `
        <div class="flex items-start gap-2 max-w-[94%]">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent text-white text-xs font-bold shadow-xs mt-0.5">
            K
          </div>
          <div class="flex flex-col space-y-2">
            <div class="rounded-2xl rounded-tl-xs border border-navy/10 bg-white px-4 py-3 text-navy shadow-soft text-xs sm:text-[13.5px] leading-relaxed relative group">
              ${formattedText}
              <button type="button" class="speech-btn absolute -right-2 -bottom-2 h-6 w-6 rounded-full bg-sand-100 border border-navy/10 text-slateink hover:text-accent flex items-center justify-center shadow-xs transition hover:scale-110" title="Ouvir áudio">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>
            </div>

            ${renderActionButtons(msgObj.actions)}
          </div>
        </div>
        <span class="text-[10px] text-slateink/70 ml-9">${getCurrentTime()}</span>
      `;
    }

    msgElement.innerHTML = html;
    container.appendChild(msgElement);

    if (!isUser) {
      const speechBtn = msgElement.querySelector('.speech-btn');
      if (speechBtn) {
        speechBtn.addEventListener('click', () => {
          speakText(msgObj.text, msgObj.speechLang || 'pt-BR');
        });
      }

      msgElement.querySelectorAll('[data-chat-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          handleChatAction(btn.getAttribute('data-chat-action'));
        });
      });
    }

    updateChips(msgObj.suggestions || []);
    AI_STATE.messages.push(msgObj);
    saveSessionChat();
    scrollToBottom();
  }

  function renderActionButtons(actions) {
    if (!actions || !actions.length) return '';
    return `
      <div class="flex flex-wrap gap-1.5 pt-1">
        ${actions.map(act => `
          <button type="button" data-chat-action="${act.action}"
            class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-soft transition hover:scale-105 active:scale-95 cursor-pointer ${
              act.style === 'primary' 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-navy text-white hover:bg-navy-700'
            }">
            ${act.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  function handleChatAction(actionKey) {
    if (actionKey === 'agendar_aula') {
      if (typeof window.abrirModalAula === 'function') {
        window.abrirModalAula();
      } else {
        const agendarLink = document.querySelector('a[href="#contato"], button[data-abrir-agendamento]');
        if (agendarLink) agendarLink.click();
        else window.location.href = 'index.html#contato';
      }
    } else if (actionKey === 'abrir_compras') {
      if (typeof window.abrirModalCompras === 'function') {
        window.abrirModalCompras('colecao');
      } else {
        const btnCompras = document.querySelector('button[data-abrir-compras]');
        if (btnCompras) btnCompras.click();
        else window.location.href = 'index.html#apostilas';
      }
    } else if (actionKey === 'abrir_degustacao') {
      window.location.href = 'idiomas.html';
    } else if (actionKey === 'abrir_login') {
      if (typeof window.abrirModalLoginAluno === 'function') {
        window.abrirModalLoginAluno();
      } else {
        window.location.href = 'aluno.html';
      }
    } else if (actionKey === 'abrir_whatsapp') {
      const tel = (window.KIZUNA_CONFIG && window.KIZUNA_CONFIG.whatsapp) || '5511999999999';
      const msg = encodeURIComponent('Olá, equipe Kizuna! Estava conversando com o Sensei AI no site e gostaria de falar com um atendente.');
      window.open('https://wa.me/' + tel.replace(/\D/g, '') + '?text=' + msg, '_blank');
    }
  }

  function updateChips(suggestions) {
    const container = document.getElementById('kizuna-ai-chips-container');
    if (!container) return;

    if (!suggestions || !suggestions.length) {
      suggestions = [
        '📚 Como comprar o curso?',
        '📅 Aula experimental gratuita',
        '🇯🇵 Japonês para o Japão',
        '💬 Falar no WhatsApp'
      ];
    }

    container.innerHTML = suggestions.map(sug => `
      <button type="button" class="para-quem-chip shrink-0 inline-flex items-center gap-1 rounded-full border border-navy/15 bg-sand-100 px-3 py-1 text-[11px] font-semibold text-navy hover:border-accent hover:bg-accent/10 hover:text-accent transition shadow-xs">
        <span>${sug}</span>
      </button>
    `).join('');

    container.querySelectorAll('.para-quem-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const texto = btn.textContent.trim().replace(/^[\u{1F300}-\u{1F9FF}\s]+/gu, '');
        processUserMessage(texto);
      });
    });
  }

  function setTyping(typing) {
    AI_STATE.isTyping = typing;
    const indicator = document.getElementById('kizuna-ai-typing');
    if (indicator) indicator.classList.toggle('hidden', !typing);
    if (typing) scrollToBottom();
  }

  function scrollToBottom() {
    const container = document.getElementById('kizuna-ai-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-sand-200 px-1 py-0.5 rounded text-[11px] font-mono text-accent">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function getCurrentTime() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function saveSessionChat() {
    try {
      sessionStorage.setItem('kizuna_chat_history', JSON.stringify(AI_STATE.messages.slice(-20)));
    } catch (e) {}
  }

  function loadSessionChat() {
    try {
      const saved = sessionStorage.getItem('kizuna_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          AI_STATE.messages = parsed;
          parsed.forEach(msg => addMessageToUI(msg));
        }
      }
    } catch (e) {}
  }

  window.KizunaAI = {
    open: () => setChatOpen(true),
    close: () => setChatOpen(false),
    toggle: toggleChat,
    ask: (pergunta) => {
      setChatOpen(true);
      processUserMessage(pergunta);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

})();
