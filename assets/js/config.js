/**
 * ============================================================
 * CONFIGURAÇÃO DO SITE — KIZUNA LANGUAGE SCHOOL
 * ============================================================
 * Edite os campos abaixo para personalizar as informações da escola,
 * links de redes sociais e canais de atendimento.
 *
 * Deixe entre colchetes como '[VALOR]' para manter o placeholder visível
 * até a definição final do conteúdo real.
 */

window.KIZUNA_CONFIG = {
  // WhatsApp: Apenas números com DDI e DDD (ex: '5511999999999' ou '819000000000')
  whatsapp: '[NÚMERO DO WHATSAPP]',
  
  // Mensagem inicial padrão enviada pelo botão de WhatsApp
  mensagem: 'Olá! Vim pelo site e gostaria de agendar uma aula experimental na Kizuna.',
  
  // Informações de contato direto
  email: '[E-MAIL]',                  // Ex: 'contato@kizuna.com'
  telefone: '[TELEFONE]',              // Ex: '+81 90-0000-0000'
  endereco: '[ENDEREÇO]',              // Ex: 'Tóquio / São Paulo'
  horario: '[HORÁRIO DE ATENDIMENTO]', // Ex: 'Segunda a Sexta, das 9h às 20h'
  
  // Redes Sociais (URLs completas)
  instagram: '[INSTAGRAM]',            // Ex: 'https://instagram.com/kizunalanguageschool'
  facebook: '[FACEBOOK]',              // Ex: 'https://facebook.com/kizunalanguageschool'
  youtube: '[YOUTUBE]',                // Ex: 'https://youtube.com/@kizunalanguageschool'
  tiktok: '[TIKTOK]',                  // Ex: 'https://tiktok.com/@kizunalanguageschool'
  
  // Endpoint de Envio do Formulário:
  // Se preenchido com um endpoint de serviço como Formspree ou backend próprio (ex: 'https://formspree.io/f/xxxxxxx'),
  // o formulário enviará via requisição HTTP AJAX POST.
  // Se deixado vazio (''), o formulário montará automaticamente o texto e abrirá o WhatsApp do usuário.
  formEndpoint: '',

  // ============================================================
  // CONFIGURAÇÃO DE INTELIGÊNCIA ARTIFICIAL (GOOGLE GEMINI API)
  // ============================================================
  ai: {
    // Chave de API do Google Gemini
    geminiApiKey: 'AQ.Ab8RN6Koect3OY-fyyfE6sQo4QBRx2vEDVcx6DjX4IrhRqjP2Q',
    modelo: 'gemini-1.5-flash',
    nomeAssistente: 'Kizuna AI Sensei'
  },

  // ============================================================
  // CONFIGURAÇÃO DAS SALAS FIXAS / PERMANENTES DO GOOGLE MEET
  // ============================================================
  salasMeet: {
    ingles: 'https://meet.google.com',
    japones: 'https://meet.google.com',
    portugues: 'https://meet.google.com',
    geral: 'https://meet.google.com'
  },

  // ============================================================
  // CONFIGURAÇÃO DAS APOSTILAS / MATERIAIS BLOQUEADOS
  // ============================================================
  apostilas: {
    // Códigos Mestres Iniciais por Curso (também funcionam como senhas de turma)
    // O sistema também gera códigos dinâmicos únicos (ex: KIZUNA-EN-7492) em cada compra.
    codigosMestre: {
      ingles: 'KIZUNA-EN-2026',       // Válido exclusivamente para Inglês
      japones: 'KIZUNA-JP-2026',      // Válido exclusivamente para Japonês
      portugues: 'KIZUNA-PT-2026',    // Válido exclusivamente para Português
      combo: 'KIZUNA-VIP-2026'        // Válido para liberar todos os 3 idiomas
    },

    // Modo de expiração após primeiro uso (true = código expira e só funciona 1 vez)
    usoUnico: true,
    
    // Arquivos das apostilas dentro de assets/docs/
    arquivos: {
      vol1: 'assets/docs/apostila-vol1-fundamentos.pdf',
      vol2: 'assets/docs/apostila-vol2-construcao.pdf',
      vol3: 'assets/docs/apostila-vol3-conversacao.pdf',
      ingles: 'assets/docs/apostila-vol1-fundamentos.pdf',
      japones: 'assets/docs/apostila-vol2-construcao.pdf',
      portugues: 'assets/docs/apostila-vol3-conversacao.pdf'
    }
  },

  // ============================================================
  // CONFIGURAÇÃO DA ÁREA DE COMPRAS / CHECKOUT
  // ============================================================
  compras: {
    // Chave Pix da escola para recebimento
    chavePix: 'pix@kizunalanguageschool.com',
    nomeBeneficiario: 'Kizuna Language School',
    
    // Catálogo de produtos: Compra única que libera todos os 3 volumes
    produtos: {
      colecao: {
        id: 'colecao',
        nome: 'Coleção Didática Completa (Os 3 Volumes Inclusos)',
        descricao: 'Compre 1 e leve todos: Vol 1 (Fundamentos) + Vol 2 (Construção) + Vol 3 (Conversação)',
        bandeira: '📚',
        preco: 'R$ 47,00',
        valorNum: 47.00,
        destaque: 'Pacote Completo (Todos os 3 Volumes)'
      },
      combo: {
        id: 'combo',
        nome: 'Coleção Didática Completa (3 Volumes)',
        descricao: 'Acesso total aos 3 livros da formação Kizuna',
        bandeira: '🌟',
        preco: 'R$ 47,00',
        valorNum: 47.00,
        destaque: 'Acesso Total'
      }
    }
  },

  // ============================================================
  // CONFIGURAÇÃO DE CONTAS DE ALUNOS (LOGIN & SENHA)
  // ============================================================
  alunos: {
    // Permite persistir sessão de login
    lembrarSessao: true,

    // Contas de Alunos Pré-Configuradas (todas recebem acesso aos 3 volumes)
    usuariosPadrao: [
      {
        nome: 'Aluno Kizuna',
        login: 'aluno@kizuna.com',
        senha: 'senha123',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      },
      {
        nome: 'Aluno VIP (Todos os Volumes)',
        login: 'aluno.vip@kizuna.com',
        senha: 'senha123',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      },
      {
        nome: 'Aluno de Inglês',
        login: 'aluno.ingles@kizuna.com',
        senha: 'senha123',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      },
      {
        nome: 'Aluno de Japonês',
        login: 'aluno.japones@kizuna.com',
        senha: 'senha123',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      },
      {
        nome: 'Aluno de Português',
        login: 'aluno.portugues@kizuna.com',
        senha: 'senha123',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      },
      {
        nome: 'Administrador Kizuna',
        login: 'admin@kizuna.com',
        senha: 'kizuna2026',
        cursos: ['ingles', 'japones', 'portugues', 'vol1', 'vol2', 'vol3', 'combo']
      }
    ]
  }
};
