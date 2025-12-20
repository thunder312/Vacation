// app/config/i18n/pt-br.ts
import type { Translation } from './de'

/**
 * Brazilian Portuguese Translations
 * Traduções em Português Brasileiro
 */
export const ptBr: Translation = {
  // Geral
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação',
    yes: 'Sim',
    no: 'Não',
    optional: 'Opcional',
    required: 'Obrigatório',
    days: 'Dias',
    day: 'Dia',
    from: 'De',
    to: 'Até',
    date: 'Data',
    reason: 'Motivo',
    status: 'Status',
    actions: 'Ações'
  },

  // Navegação
  nav: {
    home: 'Início',
    vacation: 'Férias',
    organization: 'Organograma',
    users: 'Gerenciamento de Usuários',
    settings: 'Configurações',
    logout: 'Sair'
  },

  // Login
  login: {
    title: 'Entrar',
    username: 'Nome de usuário',
    password: 'Senha',
    usernamePlaceholder: 'Digite o nome de usuário',
    passwordPlaceholder: 'Digite a senha',
    loginButton: 'Entrar',
    error: 'Nome de usuário ou senha inválidos',
    welcome: 'Bem-vindo de volta!'
  },

  // Funções
  roles: {
    employee: 'Funcionário',
    teamlead: 'Líder de Equipe',
    manager: 'Gerente',
    office: 'Escritório',
    sysadmin: 'Administrador do Sistema'
  },

  // Status
  status: {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado',
    teamleadApproved: 'Aprovado pelo Líder'
  },

  // Gerenciamento de Férias
  vacation: {
    title: 'Gerenciamento de Férias',
    myVacation: 'Minhas Férias',
    teamRequests: 'Solicitações da Equipe',
    managerApproval: 'Aprovação do Gerente',
    vacationRules: 'Regras de Férias',
    
    // Formulário
    requestVacation: 'Solicitar Férias',
    startDate: 'Data de Início',
    endDate: 'Data de Término',
    reason: 'Motivo',
    reasonPlaceholder: 'ex: Férias em família, Descanso...',
    submit: 'Enviar Solicitação',
    
    // Visão Geral
    vacationDays: 'Dias de Férias',
    remainingDays: 'Dias Restantes',
    usedDays: 'Dias Usados',
    totalDays: 'Total',
    carryover: 'Saldo Anterior',
    standard: 'Padrão',
    
    // Ações
    approve: 'Aprovar',
    reject: 'Rejeitar',
    cancel: 'Cancelar Férias',
    cancelReason: 'Motivo do Cancelamento',
    cancelWarning: 'As férias aprovadas serão canceladas e os dias serão reembolsados.',
    
    // Exportar
    exportPdf: 'Exportar PDF',
    exportTeamPdf: 'Exportar PDF da Equipe',
    exportAllPdf: 'Exportar Todas as Férias em PDF',
    
    // Mensagens
    requestSubmitted: 'Solicitação de férias enviada com sucesso',
    requestApproved: 'Solicitação de férias aprovada',
    requestRejected: 'Solicitação de férias rejeitada',
    requestCancelled: 'Férias canceladas',
    pdfCreated: 'PDF criado com sucesso!',
    
    // Regras de Meio Dia
    halfDayRules: 'Regras de Meio Dia',
    addHalfDay: 'Adicionar Meio Dia',
    halfDayDate: 'Data',
    halfDayDescription: 'Descrição',
    halfDayDescriptionPlaceholder: 'ex: Véspera de Natal, Véspera de Ano Novo...'
  },

  // Gerenciamento de Usuários
  users: {
    title: 'Gerenciamento de Usuários',
    addUser: 'Adicionar Funcionário',
    existingUsers: 'Funcionários Existentes',
    
    // Formulário
    firstName: 'Nome',
    lastName: 'Sobrenome',
    username: 'Nome de Usuário',
      generated: 'gerado',
    role: 'Função',
      yourRole: 'Sua função',

    roleSelect: 'Por favor, selecione...',
    teamlead: 'Líder de Equipe',
    teamleadSelect: 'Selecionar Líder de Equipe...',
      yourTeamlead: 'Sua Líder de Equipe',
    password: 'Senha',
    vacationDays: 'Dias de Férias',
    vacationDaysPerYear: 'Dias de Férias por Ano',
    
    // Placeholders
    firstNamePlaceholder: 'João',
    lastNamePlaceholder: 'Silva',
    
    // Tabela
    name: 'Nome',
    displayName: 'Nome de Exibição',
    
    // Ações
    editUser: 'Editar Usuário',
    resetPassword: 'Redefinir Senha',
    deactivateUser: 'Desativar Usuário',
    activateUser: 'Ativar Usuário',
    regeneratePassword: 'Gerar Nova Senha',
    
    // Filtro
    showInactive: 'Mostrar Inativos',
    searchPlaceholder: 'Buscar por nome ou sobrenome...',
    
    // Mensagens
    userCreated: 'Usuário criado com sucesso',
    userUpdated: 'Usuário atualizado',
    passwordReset: 'Senha redefinida',
    userDeactivated: 'Usuário desativado',
    userActivated: 'Usuário ativado',
    
    // Senha
    changePassword: 'Alterar Senha',
    oldPassword: 'Senha Antiga',
    newPassword: 'Nova Senha',
    confirmPassword: 'Confirmar Senha',
    passwordChanged: 'Senha alterada com sucesso',
    passwordsNotMatch: 'As senhas não correspondem',
    passwordTooShort: 'A senha deve ter pelo menos 8 caracteres',
    passwordNote: 'Senha segura - pode ser editada'
  },

  // Organograma
  organization: {
    title: 'Organograma',
    description: 'Visão geral da estrutura organizacional e atribuições de equipe.',
    exportOrgChart: 'Exportar Organograma como PDF',
    exportTeamOverview: 'Exportar Visão Geral da Equipe como PDF',
    
    // Gerenciamento de Equipe
    teamManagement: 'Gerenciamento de Equipe',
    unassignedEmployees: 'Funcionários Não Atribuídos',
    assignToTeam: 'Atribuir Funcionário à Equipe',
    employee: 'Funcionário',
    selectEmployee: 'Selecionar Funcionário...',
    selectTeamlead: 'Selecionar Líder de Equipe...',
    assignButton: 'Salvar Atribuição',
    
    // Estatísticas
    statistics: 'Estatísticas',
    totalEmployees: 'Total de Funcionários',
    teamleads: 'Líderes de Equipe',
    employees: 'Funcionários',
    
    // PDF
    orgChartPdf: 'Organograma - {company}',
    teamOverviewPdf: 'Visão Geral da Equipe - {company}',
    vacationOverviewPdf: 'Visão Geral de Férias - {company}',
    createdOn: 'Criado em',
    supervisor: 'Supervisor',
    teamMembers: 'Membros da Equipe',
    notAssigned: 'Não Atribuído'
  },

  // Mensagens de Erro
  errors: {
    genericError: 'Ocorreu um erro',
    networkError: 'Erro de rede',
    notFound: 'Não encontrado',
    unauthorized: 'Não autorizado',
    forbidden: 'Acesso negado',
    serverError: 'Erro do servidor',
    validationError: 'Erro de validação',
    required: 'Este campo é obrigatório',
    invalidEmail: 'Endereço de e-mail inválido',
    invalidDate: 'Data inválida',
    startDateAfterEndDate: 'A data de início deve ser anterior à data de término',
    noVacationDaysLeft: 'Não há dias de férias disponíveis'
  },

  // Textos do PDF
  pdf: {
    page: 'Página',
    totalPages: 'Página {current}/{total}',
    myApprovedVacations: 'Minhas Férias Aprovadas',
    teamVacations: 'Visão Geral de Férias da Equipe',
    allVacations: 'Visão Geral de Férias',
    vacationAccount: 'Conta de Férias',
    totalApprovedDays: 'Total de Dias de Férias Aprovados',
    totalRequests: 'Total de Solicitações',
    fullyApproved: 'Totalmente Aprovado',
    pendingManager: 'Pendente com Gerente',
    pendingTeamlead: 'Pendente com Líder de Equipe',
    totalCancelledDays: 'Total de Dias de Férias Cancelados'
  },

  // Diálogos de Confirmação
  confirm: {
    deleteTitle: 'Confirmar Exclusão',
    deleteMessage: 'Você realmente deseja excluir este item?',
    cancelTitle: 'Confirmar Cancelamento',
    cancelMessage: 'Você realmente deseja cancelar esta ação?',
    logoutTitle: 'Confirmar Saída',
    logoutMessage: 'Você realmente deseja sair?',
    resetPasswordTitle: 'Redefinir Senha',
    resetPasswordMessage: 'Redefinir senha para {name}?'
  },

  // About Dialog
  about: {
    title: '{appName}',
    version: 'Versão {version}',
    developedBy: 'Desenvolvido por',
    leadDeveloper: 'Desenvolvedor Principal',
    aiAssistant: 'Assistente de IA da Anthropic',
    techStack: 'Stack Tecnológico',
    copyright: '© {year} {company}',
    madeWith: 'Feito com ❤️ na Alemanha'
  }
}
