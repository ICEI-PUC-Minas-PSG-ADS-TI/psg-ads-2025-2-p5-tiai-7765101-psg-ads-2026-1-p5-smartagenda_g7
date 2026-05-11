# Guia de Configuração e Instalação para Desenvolvimento

## 1. Requisitos

Certifique-se de possuir as seguintes ferramentas instaladas em sua máquina:

* **Node.js e npm**: Versões estáveis (LTS).
* **Java Development Kit (JDK) 21**: Versão de 64 bits para garantir compatibilidade com os serviços de build. [Download JDK 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html).
* **Android Studio**: Instalação padrão, incluindo o SDK do Android. [Download Android Studio](https://developer.android.com/studio?hl=pt-br).

## 2. Configuração de Variáveis de Ambiente do Sistema

Para o correto funcionamento do Android SDK e das ferramentas de build, siga os passos abaixo:

1.  Localize a pasta de instalação do SDK Android (geralmente em `C:\\Users\\[SeuUsuario]\\AppData\\Local\\Android\\Sdk`).
2.  Acesse as **Propriedades do Sistema** (`sysdm.cpl`), aba **Avançado** e clique em **Variáveis de Ambiente**.
3.  Crie uma nova Variável de Sistema chamada `ANDROID_HOME` e insira o caminho do SDK copiado.
4.  Na lista de variáveis do sistema, localize a variável `Path` e adicione os seguintes itens:
    * `%ANDROID_HOME%\\platform-tools`
    * O caminho para a pasta `bin` da instalação do JDK 21 (Ex: `C:\\Program Files\\Java\\jdk-21\\bin`).
5.  Mova o caminho do JDK para o topo da lista no `Path`.

## 3. Configuração de Variáveis de Ambiente (.env)

O aplicativo utiliza o Google Gemini para funcionalidades de Inteligência Artificial. É necessário configurar a chave de API localmente.

1.  Na raiz do diretório `src/app`, crie um arquivo chamado `.env`.
2.  Obtenha uma chave de API no [Google AI Studio](https://aistudio.google.com/api-keys/).
3.  Adicione a seguinte linha ao arquivo `.env`:
    `GEMINI_API_KEY=SUA_CHAVE_AQUI`

## 4. Configuração Específica do Build (Ninja)

Caso ocorram erros durante o build nativo relacionados ao CMake, siga este procedimento:

1.  Acesse o arquivo `src/app/android/app/build.gradle` e localize a seção `cmake`. Verifique se os caminhos apontam corretamente para o executável `ninja.exe`.
2.  Faça o download da versão mais recente do Ninja em [Ninja Build Releases](https://github.com/ninja-build/ninja/releases) (arquivo `ninja-win.zip`).
3.  Extraia o arquivo `ninja.exe` e substitua o executável existente no caminho configurado no SDK Android.
4.  Para limpar o cache de builds anteriores, delete a pasta `src/app/android/app/.cxx`.

## 5. Instalação de Dependências e Verificação

Abra o terminal na pasta do projeto (`cd src/app`) e execute:

```bash
npm install
```

Para validar a instalação, execute os comandos abaixo e verifique as saídas:

```bash
java -version --Deve retornar a versão 21.
```
```bash
adb devices --Deve listar o dispositivo conectado ou emulador ativo.
```

## 6. Execução do Projeto
Com o emulador do Android Studio aberto ou um dispositivo físico conectado via USB (com Depuração USB ativa), execute:

```bash
npx react-native run-android
```

Nota sobre Caminhos Longos no Windows:
Caso ocorram erros de sistema de arquivos durante o build, execute o seguinte comando no PowerShell como Administrador para habilitar caminhos longos:

```PowerShell
New-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Observações Técnicas
Este projeto utiliza react-native-dotenv para o gerenciamento de chaves de API e o SDK oficial @google/generative-ai para integração com o modelo Gemini. A persistência de dados é realizada via Firebase e armazenamento local sincronizado.