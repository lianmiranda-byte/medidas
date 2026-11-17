# medidas

Documentação do Projeto Medidas
O projeto medidas é uma API RESTful desenvolvida em Node.js com o framework Express e banco de dados relacional MySQL. Sua finalidade principal é receber requisições com medições de grandezas físicas (temperatura, velocidade e comprimento), realizar a conversão matemática de unidades, atribuir uma classificação categórica baseada no valor convertido e persistir o histórico completo no banco de dados.
1. Arquitetura e Tecnologias
A aplicação utiliza o ambiente de execução Node.js estruturado no formato CommonJS (type: commonjs). A escolha das dependências prioriza desempenho, segurança no manuseio de credenciais de banco e facilidade de desenvolvimento.
Componente / BibliotecaVersãoFunção na ArquiteturaNode.jsCommonJSAmbiente de execução JavaScript no servidor.Express^5.3.0Framework web para roteamento de requisições HTTP e middlewares.MySQL2^3.24.6Driver de conexão ao MySQL com suporte a Promises (mysql2/promise) e Pool.dotenv^18.0.8Gerenciamento e carregamento de variáveis de ambiente.nodemon^3.1.14Ferramenta de desenvolvimento para recarregamento automático (npm run dev).
A estrutura física do repositório é composta pelos seguintes arquivos principais:

index.js: Ponto de entrada do sistema (main), configurado na porta 3000, onde estão implementadas as funções de conversão e todos os endpoints da API.
db.js: Módulo de abstração do banco de dados que cria e exporta o Pool de conexões MySQL.
package.json: Manifesto de configuração do Node.js contendo scripts de execução (test e dev) e controle de dependências.
.gitignore: Arquivo de regras de exclusão do Git para ignorar diretórios como node_modules/, logs, caches e arquivos .env.
LICENSE: Licença MIT atribuída ao projeto.

2. Configuração do Ambiente e Banco de Dados
A persistência de dados é gerenciada pelo módulo db.js, que cria um Pool de conexões assíncronas utilizando mysql2/promise. O Pool otimiza a utilização de recursos ao manter conexões reutilizáveis.
2.1 Variáveis de Ambiente
Para o funcionamento correto da conexão com o banco de dados, o arquivo .env deve ser configurado na raiz do projeto com as seguintes chaves de ambiente:

DB_HOST: Host do banco de dados MySQL.
DB_USER: Usuário do banco de dados.
DB_PASSWORD: Senha de acesso.
DB_NAME: Nome da base de dados.

O pool de conexões é inicializado com as seguintes propriedades operacionais:

waitForConnections: true (aguarda conexões disponíveis caso o limite seja atingido).
connectionLimit: 10 (suporta até 10 conexões simultâneas no pool).
queueLimit: 0 (sem restrição no limite da fila de requisições pendentes).

2.2 Estrutura da Tabela medicoes
As operações da API interagem diretamente com a tabela medicoes. O esquema da tabela inferido a partir das rotas SQL é detalhado a seguir:
ColunaTipo de Dado SugeridoDescriçãoidINT AUTO_INCREMENT PRIMARY KEYIdentificador único do registro.tipoVARCHARTipo da grandeza física (temperatura, velocidade ou comprimento).unidade_originalVARCHARUnidade de medida informada na entrada.valor_originalDECIMAL / FLOATValor numérico original fornecido pelo usuário.descricaoVARCHAR / TEXTDescrição textual ou observação sobre a medição.valor_convertidoDECIMAL / FLOATValor resultante após a conversão matemática.unidade_convertidaVARCHARUnidade de medida gerada após a conversão.classificacaoVARCHARRótulo categórico atribuído com base no valor convertido.
3. Regras de Negócio e Algoritmos de Conversão
A API processa os dados de entrada através de funções especializadas que executam os cálculos matemáticos, formatam o resultado para duas casas decimais com toFixed(2) e rotulam a medição.
3.1 Conversão de Temperatura
A função temp recebe uma medição em graus Celsius e efetua a conversão para Fahrenheit:
$$F = \left(C \times \frac{9}{5}\right) + 32$$
A classificação da temperatura é definida de acordo com os seguintes intervalos:

Frio: Valor convertido $\le 50$ ºF.
Morno: Valor convertido $> 50$ ºF e $\le 70$ ºF.
Quente: Valor convertido $> 70$ ºF.

3.2 Conversão de Velocidade
A função velo converte valores de velocidade de quilômetros por hora ($km/h$) para metros por segundo ($m/s$):
$$v_{m/s} = \frac{v_{km/h}}{3,6}$$
A classificação de velocidade segue as seguintes faixas:

Baixa Velocidade: Valor convertido $\le 11$ m/s.
Velocidade Moderada: Valor convertido $> 11$ m/s e $\le 25$ m/s.
Alta Velocidade: Valor convertido $> 25$ m/s.

3.3 Conversão de Comprimento
A função comp converte medições de comprimento em metros ($m$) para pés ($ft$):
$$l_{ft} = m \times 3,28084$$
A classificação de comprimento segue as regras:

Curto: Valor convertido $\le 16$ ft.
Médio: Valor convertido $> 16$ ft e $\le 164$ ft.
Longo: Valor convertido $> 164$ ft.

4. Especificação das Rotas da API REST
A API expõe sete rotas HTTP para manipulação completa dos recursos de medição na porta 3000.
4.1 Rota Principal (Health Check)

Método: GET
Caminho: /
Descrição: Retorna o status de execução do servidor.
Resposta (200 OK):
{
  "mensagem": "o sistema está rodando!"
}



4.2 Listagem de Todas as Medições

Método: GET
Caminho: /medicao
Descrição: Executa a consulta SELECT * FROM medicoes e retorna todos os registros.
Resposta (200 OK): Array contendo todos os objetos de medição.

4.3 Obter Medição por ID

Método: GET
Caminho: /medicao/:id
Descrição: Busca uma medição específica pelo campo id.
Resposta de Sucesso (200 OK): Objeto da medição correspondente.
Resposta de Erro (404 Not Found):
{
  "mensagem": "Paciente não encontrado"
}



4.4 Inserir Nova Medição

Método: POST
Caminho: /medicao
Descrição: Valida os campos, calcula a conversão e insere um novo registro na tabela medicoes.
Corpo da Requisição (JSON):
{
  "tipo": "temperatura",
  "unidade_original": "Celsius",
  "valor_original": 30,
  "descricao": "Temperatura ambiente"
}


Validações: É necessário enviar tipo, unidade_original, valor_original e descricao. O campo tipo aceita apenas "velocidade", "temperatura" ou "comprimento".
Resposta de Sucesso (201 Created):
{
  "descricao": "Temperatura ambiente",
  "tipo": "temperatura",
  "valor_original": 30,
  "unidade_original": "Celsius",
  "valor_convertido": 86,
  "unidade_convertida": "Fahrenheit",
  "classificacao": "Quente"
}


Respostas de Erro (400 Bad Request):

Se faltar algum campo: { "mensagem": "Verifique se todos os campos estão preenchidos" }
Se o tipo for inválido: { "mensagem": "O tipo é incopativel" }



4.5 Consultar Medições de Alta Velocidade

Método: GET
Caminho: /medicao/altavelocidade
Descrição: Executa a consulta SQL SELECT * FROM medicoes WHERE classificacao = "Alta velocidade";.
Resposta (200 OK): Array com os registros que possuem a classificação de alta velocidade.

4.6 Atualizar Medição por ID

Método: PUT
Caminho: /medicao/put/:id
Descrição: Atualiza todos os campos de uma medição existente, recalculando os valores convertidos.
Corpo da Requisição (JSON): Estrutura idêntica à rota POST /medicao.
Resposta de Sucesso (200 OK):
{
  "id": 1,
  "descricao": "Temperatura atualizada",
  "tipo": "temperatura",
  "valor_original": 20,
  "unidade_original": "Celsius",
  "valor_convertido": 68,
  "unidade_convertida": "Fahrenheit",
  "classificacao": "Morno"
}



4.7 Excluir Medição por ID

Método: DELETE
Caminho: /paciente/:id
Descrição: Remove o registro correspondente ao ID da tabela medicoes.
Resposta de Sucesso (200 OK):
{
  "mensagem": "Paciente apagado com sucesso"
}


Resposta de Erro (404 Not Found):
{
  "mensagem": "Paciente não encontrado"
}



5. Instruções para Instalação e Execução

Clone o repositório ou navegue até o diretório do projeto.
Instale as dependências executando o comando:
npm install


Crie o arquivo .env na raiz do projeto e defina as variáveis de conexão do MySQL (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
Execute o servidor em modo de desenvolvimento com:
npm run dev


O servidor estará ativo na porta 3000 e exibirá a mensagem "Servidor rodando com sucesso em http://localhost:3000".

6. Licença
O projeto está sob a licença MIT, conforme detalhado no arquivo LICENSE:
MIT License
Copyright (c) 2026 lianmiranda-byte