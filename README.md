<div align="center">
  <h1 align="center">
    <br>
    Chitter
  </h1>
  <h3 align="center">Conversas Anônimas Simples, rápido e seguro!</h3>
  <br>
</div>

<div align="center">
  <!-- Badges -->
  <img src="https://img.shields.io/github/stars/josyelbuenos/Chitter-App?style=for-the-badge&logo=github&color=D946EF&logoColor=fff" alt="Stars" />
  <img src="https://img.shields.io/github/forks/josyelbuenos/Chitter-App?style=for-the-badge&logo=github&color=8B5CF6&logoColor=fff" alt="Forks" />
  <img src="https://img.shields.io/github/license/josyelbuenos/Chitter-App?style=for-the-badge&color=22C55E&logoColor=fff" alt="License" />
</div>

<p align="center">
  <a href="#sobre-o-projeto">Sobre</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#começando">Começando</a> •
  <a href="#contato">Contato</a>
</p>

![Pré-visualização do Chitter](/docs/captura.png)
<p align="center" style="font-size: 0.8rem; color: #888;"><i>Interface principal do Chitter em modo escuro.</i></p>

## Sobre o Projeto

**Chitter** é uma aplicação de chat em tempo real com uma abordagem moderna e focada em privacidade. Inspirado em uma estética cyberpunk, o projeto oferece uma plataforma onde os usuários podem conversar anonimamente, identificados apenas por um ID numérico único gerado no momento do cadastro.

O objetivo é fornecer uma experiência de comunicação rápida, segura e estilizada, construída com as tecnologias mais recentes do ecossistema web.

## Funcionalidades

-   **Autenticação Anônima**: Login e cadastro simplificados usando apenas nome de usuário e senha. Um ID único de 7 dígitos é gerado para cada novo usuário.
-   **Sistema de Contatos**: Adicione outros usuários à sua lista de contatos usando o ID de 7 dígitos.
-   **Chat em Tempo Real**: Conversas diretas e em grupo com atualizações instantâneas, alimentadas pelo Firebase Realtime Database.
-   **Temas Personalizáveis**: Escolha entre temas claros e escuros e personalize a cor principal da interface para uma experiência única.
-   **Design Responsivo**: Interface limpa e adaptável a qualquer tamanho de tela, de desktops a dispositivos móveis.
-   **Envio de Mídia**: Compartilhe imagens e mensagens de áudio em suas conversas.

## Tecnologias

Este projeto foi construído utilizando as seguintes tecnologias:

-   [**Next.js**](https://nextjs.org/) - O framework React para a web.
-   [**React**](https://reactjs.org/) - Biblioteca para construir interfaces de usuário.
-   [**TypeScript**](https://www.typescriptlang.org/) - Superset de JavaScript que adiciona tipagem estática.
-   [**Firebase**](https://firebase.google.com/) - Plataforma para autenticação, banco de dados em tempo real e armazenamento.
-   [**Tailwind CSS**](https://tailwindcss.com/) - Framework CSS utility-first.
-   [**Shadcn/ui**](https://ui.shadcn.com/) - Componentes de UI lindamente projetados.

## Começando

Para obter uma cópia local em funcionamento, siga estes passos simples.

### Pré-requisitos

Você precisará do [Node.js](https://nodejs.org/) (versão 18 ou superior) e do `npm` ou `yarn` instalados em sua máquina.

### Instalação

1.  Clone o repositório:
    ```sh
    git clone https://github.com/josyelbuenos/Chitter-App.git
    ```
2.  Navegue até o diretório do projeto:
    ```sh
    cd Chitter-App
    ```
3.  Instale as dependências:
    ```sh
    npm install
    ```

### Configuração do Firebase

O Chitter usa o Firebase para autenticação e banco de dados. Você precisará configurar seu próprio projeto Firebase.

1.  Vá para o [console do Firebase](https://console.firebase.google.com/).
2.  Crie um novo projeto.
3.  Ative os seguintes serviços:
    -   **Authentication**: Habilite o provedor "Email/Senha".
    -   **Realtime Database**: Crie um novo banco de dados.
    -   **Storage**: Crie um novo bucket de armazenamento.
4.  Vá para as Configurações do Projeto (`Project Settings`) e, na aba "Geral" (`General`), adicione um novo aplicativo da web.
5.  Copie as credenciais de configuração do Firebase (o objeto `firebaseConfig`).
6.  Cole suas credenciais no arquivo `src/lib/firebase.ts`, substituindo o objeto `firebaseConfig` existente.

    ```typescript
    // src/lib/firebase.ts
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      databaseURL: "SUA_DATABASE_URL",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_STORAGE_BUCKET",
      messagingSenderId: "SEU_SENDER_ID",
      appId: "SEU_APP_ID"
    };
    ```

7.  **Regras de Segurança:** Copie o conteúdo de `database.rules.json` do repositório e cole nas regras do seu Realtime Database no console do Firebase.

### Executando a Aplicação

Com tudo configurado, inicie o servidor de desenvolvimento:

```sh
npm run dev
```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver a aplicação.

## Contato

Josyel Buenos - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

Link do Projeto: [https://github.com/josyel/chitter](https://github.com/josyel/chitter)
