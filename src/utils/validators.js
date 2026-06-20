// ── REGEX PATTERNS ──
export const regexTelefone = /^(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}$/;
export const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
export const regexCEP = /^\d{5}-\d{3}$|^\d{8}$/;
export const regexRua = /^[a-zA-ZÀ-ÿ0-9\s\.\,\-\']+$/;
export const regexBairro = /^[a-zA-ZÀ-ÿ0-9\s\-]+$/;
export const regexCidade = /^[a-zA-ZÀ-ÿ\s\-]+$/;
export const regexEstado = /^[A-Z]{2}$/;
export const regexNome = /^[a-zA-ZÀ-ÿ\s]{3,}$/;
export const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── VALIDAÇÕES INDIVIDUAIS ──
export const validarEmail = (email) => {
  return regexEmail.test(email);
};

export const validarTelefone = (telefone) => {
  const digits = telefone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
};

export const validarCPF = (cpf) => {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 || r === 11 ? 0 : r;
  };
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
};

export const validarCNPJ = (cnpj) => {
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;

  const calc = (len, pesos) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i]) * pesos[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digito1 = calc(12, pesos1);
  const digito2 = calc(13, pesos2);

  return digito1 === parseInt(d[12]) && digito2 === parseInt(d[13]);
};

export const validarDocumento = (documento) => {
  const d = documento.replace(/\D/g, '');
  if (d.length === 11) return validarCPF(documento);
  if (d.length === 14) return validarCNPJ(documento);
  return false;
};

export const validarCEP = (cep) => {
  return regexCEP.test(cep);
};

export const validarRua = (rua) => {
  return regexRua.test(rua);
};

export const validarBairro = (bairro) => {
  return regexBairro.test(bairro);
};

export const validarCidade = (cidade) => {
  return regexCidade.test(cidade);
};

export const validarEstado = (estado) => {
  return regexEstado.test(estado);
};

export const validarNome = (nome) => {
  return regexNome.test(nome.trim());
};

// ── CAMPOS OBRIGATÓRIOS DO PERFIL PARA RESERVA ──
export const CAMPOS_PERFIL_OBRIGATORIOS = [
  { campo: 'nome',      label: 'Nome completo' },
  { campo: 'documento', label: 'CPF ou CNPJ'   },
  { campo: 'telefone',  label: 'Telefone'       },
];

export const perfilCamposFaltando = (perfilForm) =>
  CAMPOS_PERFIL_OBRIGATORIOS.filter(({ campo }) => !perfilForm[campo]?.trim());

// ── FUNÇÃO GENÉRICA ──
export const validarCampo = (tipo, valor) => {
  const validacoes = {
    telefone: validarTelefone(valor),
    cpf: validarCPF(valor),
    cep: validarCEP(valor),
    rua: validarRua(valor),
    bairro: validarBairro(valor),
    cidade: validarCidade(valor),
    estado: validarEstado(valor),
    nome: validarNome(valor),
    email: validarEmail(valor),
  };
  
  return validacoes[tipo] ?? true;
};

const criarValidador = (campo, condicao, mensagem) => ({
  campo,
  condicao,
  mensagem,
});

export const validarReservaHome = (dados) => {
  const { acomodacaoSelecionada, session, perfilForm, form } = dados;

  const validadores = [
    criarValidador('acomodacao', !acomodacaoSelecionada, 'Selecione uma acomodação para reservar.'),
    criarValidador('usuario', !session?.user?.id, 'Você precisa estar logado para concluir a reserva.'),
    criarValidador('nome', !perfilForm.nome.trim(), 'Informe seu nome completo.'),
    criarValidador('nome', perfilForm.nome.trim() && !validarNome(perfilForm.nome), 'Nome deve ter pelo menos 3 caracteres.'),
    criarValidador('email', !perfilForm.email.trim(), 'Informe seu e-mail.'),
    criarValidador('email', perfilForm.email.trim() && !validarEmail(perfilForm.email), 'E-mail inválido.'),
    criarValidador('telefone', !perfilForm.telefone.trim(), 'Informe seu telefone'),
    criarValidador('telefone',perfilForm.telefone.trim() && !validarTelefone(perfilForm.telefone), 'Telefone inválido, deve ter 10 ou 11 dígitos'),
    criarValidador('documento',!perfilForm.documento.trim(), 'Informe seu cpf' ),
    criarValidador('documento', perfilForm.documento.trim() && !validarDocumento(perfilForm.documento), 'CPF ou CNPJ inválido' ),
    criarValidador('data_checkin', !form.data_checkin, 'Selecione a data de check-in.'),
    criarValidador('data_checkout', !form.data_checkout, 'Selecione a data de check-out.'),
    criarValidador('data_checkout', form.data_checkin && form.data_checkout <= form.data_checkin, 'A data de check-out deve ser depois do check-in.'),
    criarValidador('hospedes', Number(form.hospedes) > acomodacaoSelecionada?.capacidadePessoas, `Esta acomodação aceita até ${acomodacaoSelecionada?.capacidadePessoas} hóspede(s).`),
  
  ];

  const erros = {};
  validadores.map(({ campo, condicao, mensagem }) => {
    if (condicao) erros[campo] = mensagem;
  });

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
};

// ── VALIDAÇÃO PARA CADASTRO DE FUNCIONÁRIO ──
export const validarCadastroFuncionario = (form) => {
  const validadores = [
    criarValidador('nome', !form.nome.trim(), 'Nome é obrigatório'),
    criarValidador('nome', form.nome.trim() && !validarNome(form.nome.trim()), 'Nome deve ter pelo menos 3 caracteres'),
    criarValidador('documento', !form.documento.trim(), 'CPF é obrigatório'),
    criarValidador('documento', form.documento.trim() && !validarCPF(form.documento), 'CPF inválido'),
    criarValidador('cidade', form.cidade.trim() && !validarCidade(form.cidade.trim()), 'Apenas letras são permitidas na cidade'),
    criarValidador('cep', form.cep.trim() && !validarCEP(form.cep), 'CEP inválido (deve ter 8 dígitos ou formato 00000-000)'),
    criarValidador('email', !form.email.trim(), 'E-mail é obrigatório'),
    criarValidador('email', form.email.trim() && !validarEmail(form.email), 'E-mail inválido'),
    criarValidador('senha', !form.senha, 'Senha é obrigatória'),
    criarValidador('senha', form.senha && form.senha.length < 6, 'Mínimo de 6 caracteres'),
    criarValidador('senha', form.senha && !/[A-Za-z]/.test(form.senha), 'Use ao menos uma letra'),
    criarValidador('senha', form.senha && !/[0-9]/.test(form.senha), 'Use ao menos um número'),
    criarValidador('confirmarSenha', !form.confirmarSenha, 'Confirme a senha'),
    criarValidador('confirmarSenha', form.senha && form.confirmarSenha && form.senha !== form.confirmarSenha, 'As senhas não coincidem'),
  ];

  const erros = {};
  validadores.forEach(({ campo, condicao, mensagem }) => {
    if (condicao) erros[campo] = mensagem;
  });

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
};
export const validate = (form) => {
   const errs = {};

    // Nome
    if (!form.nome.trim())
      errs.nome = 'Nome é obrigatório';
    else if (form.nome.trim().length < 3)
      errs.nome = 'Mínimo de 3 caracteres';

    // CPF
    if (!form.cpf.trim())
      errs.cpf = 'CPF é obrigatório';
    else if (!validarCPF(form.cpf))
      errs.cpf = 'CPF inválido';

    // E-mail
    if (!form.email.trim())
      errs.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'E-mail inválido';

    // Telefone
    if (!form.telefone.trim())
      errs.telefone = 'Telefone é obrigatório';
    else if (form.telefone.replace(/\D/g, '').length < 10)
      errs.telefone = 'Telefone inválido (mín. 10 dígitos)';

    // Acomodação
    if (!form.id_acomodacao)
      errs.id_acomodacao = 'Selecione uma acomodação';

    // Datas
    if (!form.data_checkin)
      errs.data_checkin = 'Data de check-in é obrigatória';
    if (!form.data_checkout)
      errs.data_checkout = 'Data de check-out é obrigatória';
    else if (form.data_checkin && form.data_checkout <= form.data_checkin)
      errs.data_checkout = 'Check-out deve ser após o check-in';

    return {
      valido: Object.keys(errs).length === 0,
      erros: errs,
    };
  };