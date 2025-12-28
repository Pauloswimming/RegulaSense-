# RegulaSense

O **RegulaSense** é um sistema web desenvolvido para apoiar a gestão e o acompanhamento de solicitações de procedimentos médicos, integrando autenticação segura, módulos funcionais inteligentes e uma interface moderna orientada à experiência do usuário.

O projeto foi desenvolvido em ambiente acadêmico com foco em arquitetura moderna, integração contínua e separação clara de responsabilidades entre Frontend e Backend.

---

## 👥 Colaboradores e Supervisão

- **Desenvolvimento Frontend & Integração**  
  Paulo Henrique Rodrigues Nogueira

- **Desenvolvimento Backend & Arquitetura**  
  Marcos Vinicius Gundel da Silva

- **Supervisão Acadêmica**  
  Professor Eduardo Siqueira

O desenvolvimento foi conduzido por meio de **sprints iterativas**, priorizando a integração contínua das funcionalidades de autenticação e dos módulos principais do sistema.

---

## 🏗️ Arquitetura Técnica e Ambiente

O sistema segue uma arquitetura **Frontend + Backend desacoplados**, orquestrados via Docker.

### Backend – Serviço de Usuários & FillSense
- **Linguagem:** Python  
- **Framework:** Django  
- **APIs:** Django REST Framework  
- **Autenticação:** SimpleJWT  
- **Banco de Dados:** PostgreSQL  
- **Driver:** Psycopg2  
- **Containerização:** Docker

### Frontend – Interface Web
- **Framework:** React  
- **Roteamento:** react-router-dom  
- **Comunicação HTTP:** axios  
- **Estilização:** CSS Modular  
- **Containerização:** Docker

### Orquestração
- **Docker Compose**  
Responsável por unificar o ambiente de desenvolvimento, garantir a comunicação entre os serviços (`localhost:3000` e `localhost:8000`) e automatizar a inicialização do sistema.

---

## 🔄 Fluxos de Trabalho e Funcionalidades Críticas

| Camada | Responsabilidade |
|------|----------------|
| Backend | Lógica de negócio, autenticação, gerenciamento de dados e APIs de IA |
| Banco de Dados | Persistência e armazenamento de usuários e solicitações |
| Frontend | Interface do usuário, roteamento, gerenciamento de estado e consumo de APIs |
| Docker Compose | Integração entre serviços e inicialização automatizada |

---

## 🔐 Fluxo de Autenticação (Login)

**Status:** Totalmente integrado e funcional.

1. O usuário acessa a aplicação em:  
   `http://localhost:3000`
2. É redirecionado para a rota `/login`
3. O componente `Login.jsx` envia uma requisição `POST` para:  
   `http://localhost:8000/api/auth/login/`
4. Em caso de sucesso:
   - O Backend retorna um **Token JWT**
   - O Frontend armazena o token no `localStorage`
   - O usuário é redirecionado para `/home`
5. O componente `ProtectedRoute.jsx` valida a existência do token antes de permitir acesso às rotas protegidas

---

## 🧠 Módulo FillSense (Formulários e Histórico)

### Objetivo
Gerenciar a **criação, visualização e acompanhamento** de solicitações de procedimentos médicos.

### Funcionalidades

#### 📄 Histórico de Solicitações (`/solicitacoes`)
- Requisição `GET` para:
- Token JWT enviado no header
- Renderização dinâmica em tabela

#### ➕ Nova Solicitação (`/nova-solicitacao`)
- Formulário com lógica avançada
- Envio `POST` para a API principal
- Simulações de chamadas de IA
- Inclusão do campo **Número do SUS**
- JSON de envio ajustado conforme novas regras do Backend

#### 🎯 Ajustes de UX
- Ícone de ação dinâmico:
- `fa-eye` para visualização
- `fa-pen-to-square` para edição
- Ícone muda de acordo com o status da solicitação

---

## 🎨 Ajustes de Interface e Usabilidade (Frontend)

**Status:** Concluído

Diversos refinamentos foram aplicados para garantir uma experiência de usuário limpa, clara e profissional:

- **Layout**
- Correção dos estilos globais (`index.css`)
- Centralização correta do formulário de login
- Eliminação de telas em branco

- **Navegação**
- Remoção da barra global do `App.js` (retângulo azul)
- Navegação centralizada nos componentes:
  - Home
  - Solicitações
  - RegulaFlow
- Links corrigidos para rotas React (ex: `/regulaflow`)

- **Rodapé**
- Implementação de um rodapé moderno (`Footer.jsx`)
- Logo do CIIA com tamanho ajustado
- Informações de contato
- Links para parcerias e redes sociais

- **Login**
- Remoção dos links:
  - "Criar conta"
  - "Esqueceu a senha?"
- Interface mais limpa e objetiva

---

## 🔧 Fluxo de Trabalho Git e Colaboração

- **Modelo de Branch**
- `main`: sempre estável
- `developer`: desenvolvimento contínuo

- **Rotina de Sincronização**
```bash
git pull origin main
git merge main

# Clone o repositório
git clone git@github.com:Pauloswimming/RegulaSense-.git

# Acesse o diretório
cd RegulaSense-

# Suba os containers
docker-compose up --build
Frontend: http://localhost:3000

Backend: http://localhost:8000
```
### 📸 Demonstração
<img width="1364" height="612" alt="image" src="https://github.com/user-attachments/assets/134d507f-75b8-4c7a-b54d-45dd2cc5de6d" />
1. Tela de Login e Autenticação

Legenda: Interface de acesso seguro com autenticação baseada em JSON Web Tokens (JWT). O sistema valida o e-mail e senha junto ao microserviço de usuários, garantindo que apenas profissionais autorizados acessem os dados sensíveis.

<img width="1350" height="611" alt="image" src="https://github.com/user-attachments/assets/89f1920e-66bf-4a6a-a990-0622d4e475fe" />
2. Dashboard Principal (Home)

Legenda: Painel central de navegação desenvolvido em React. Esta tela organiza o fluxo de trabalho do médico, permitindo acesso rápido aos módulos de solicitações e ao fluxo de regulação inteligente.

<img width="1006" height="332" alt="image" src="https://github.com/user-attachments/assets/cf150b5d-fd56-44c8-b847-8ce0854d6441" />
3. Módulo RegulaFlow

Legenda: Visualização do fluxo de regulação assistida. Esta interface foca na usabilidade (UX), permitindo que o utilizador visualize em qual etapa do processo técnico a solicitação se encontra.

<img width="759" height="539" alt="image" src="https://github.com/user-attachments/assets/5ff27793-5171-4d2e-baa0-7b3d85d42542" />
4. Legenda: Visualização dinâmica das solicitações médicas armazenadas no PostgreSQL. A tabela consome dados via API REST e exibe o status em tempo real, permitindo a triagem rápida de pedidos.Módulo inteligente para criação de pedidos médicos. O formulário inclui validações complexas, como o Número do SUS, e prepara os dados em formato JSON para processamento no backend Django.

<img width="1357" height="117" alt="image" src="https://github.com/user-attachments/assets/3a29d12c-d7fe-4036-94d8-fefed253b62e" />
5. Rodapé e Identidade Visual (Footer)
Legenda: Componente de rodapé modular que integra as informações de contacto e a marca institucional do CIIA, reforçando a seriedade e o caráter académico-profissional do projeto.







