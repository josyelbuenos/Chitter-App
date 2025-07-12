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
  <a href="#contato">Contato</a> •
  <a href="#termos-de-uso">Termos de Uso</a> •
  <a href="#política-de-privacidade">Política de Privacidade</a>
</p>

![Pré-visualização do Chitter](/docs/captura.png)
<p align="center" style="font-size: 0.8rem; color: #888;"><i>Interface principal do Chitter em modo escuro.</i></p>

Demo: https://chitter-web.vercel.app/dashboard

## Sobre o Projeto

**Chitter** é uma aplicação de chat em tempo real com uma abordagem moderna e focada em privacidade. Inspirado em uma estética cyberpunk, o projeto oferece uma plataforma onde os usuários podem conversar anonimamente, identificados apenas por um ID numérico único gerado no momento do cadastro.

O objetivo é fornecer uma experiência de comunicação rápida, segura e estilizada, construída com as tecnologias mais recentes do ecossistema web.

## Funcionalidades

- **Autenticação Anônima**: Login e cadastro simplificados usando apenas nome de usuário e senha. Um ID único de 7 dígitos é gerado para cada novo usuário.
- **Sistema de Contatos**: Adicione outros usuários à sua lista de contatos usando o ID de 7 dígitos.
- **Chat em Tempo Real**: Conversas diretas e em grupo com atualizações instantâneas, alimentadas pelo Firebase Realtime Database.
- **Temas Personalizáveis**: Escolha entre temas claros e escuros e personalize a cor principal da interface para uma experiência única.
- **Design Responsivo**: Interface limpa e adaptável a qualquer tamanho de tela, de desktops a dispositivos móveis.
- **Envio de Mídia**: Compartilhe imagens e mensagens de áudio em suas conversas.

## Tecnologias

Este projeto foi construído utilizando as seguintes tecnologias:

- [**Next.js**](https://nextjs.org/)
- [**React**](https://reactjs.org/)
- [**TypeScript**](https://www.typescriptlang.org/)
- [**Firebase**](https://firebase.google.com/)
- [**Tailwind CSS**](https://tailwindcss.com/)
- [**Shadcn/ui**](https://ui.shadcn.com/)

## Começando

### Pré-requisitos

- Node.js (18 ou superior)
- npm ou yarn

### Instalação

```bash
git clone https://github.com/josyelbuenos/Chitter-App.git
cd Chitter-App
npm install
```

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative:
   - Authentication (Email/Senha)
   - Realtime Database
   - Storage
3. Adicione o app web nas configurações do projeto
4. Copie suas credenciais e substitua em `src/lib/firebase.ts`

```ts
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

5. Cole o conteúdo de `database.rules.json` nas regras do Realtime Database

### Executando o projeto

```bash
npm run dev
```

Acesse: [http://localhost:9002](http://localhost:9002)

## Contato

Josyel Buenos - [josyelbuenos@gmail.com](mailto:josyelbuenos@gmail.com)

Link do Projeto: [https://github.com/josyel/chitter](https://github.com/josyel/chitter)

## Termos de Uso

Leia os termos de uso completos em [`/docs/termos-de-uso.md`](docs/termos-de-uso.md).

## Política de Privacidade

Leia nossa política de privacidade em [`/docs/politica-e-privacidade.md`](docs/politica-e-privacidade.md).
