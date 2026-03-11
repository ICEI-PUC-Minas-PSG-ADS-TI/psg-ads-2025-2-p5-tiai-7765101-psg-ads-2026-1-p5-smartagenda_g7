# Instalação para desenvolvimento

Tenha node.js e npm
instale o JDK versão 21 (64bit) (essa versão do java tem maior compatibilidade com os serviços usados)
(https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
Instale o Android Studio (https://developer.android.com/studio?hl=pt-br) (Instalação Padrão)
(Ao instalar, também instala um conjunto de dependências do pacote Android)

Encontre a Pasta de instalação do Pacote de Desenvolvedor Android (Se Instalado pelo Android Studio, localizado em algo como "C:\Users\user\AppData\Local\Android\Sdk"), e copie.
Abra a janela de Propriedades do Sistema (Execute sysdm.cpl)
Vá para a aba "Avançado" e selecione "Variáveis de ambiente"
Clique em "Novo" nas variáveis do sistema, criando uma variável de nome "ANDROID_HOME", e para o valor, cole o endereço do SDK Android copiado previamente.
Clique OK

Encontre a variável "Path" nas variáveis do sistema, e clique duas vezes nela
No menu aberto, clique em "Novo", e cole "%ANDROID_HOME%\platform-tools"
Identifique o local onde o JDK versão 21 foi instalado, e copie seu endereço até a pasta bin, algo como "C:\Program Files\Java\jdk-21\bin"
Clique em "novo", e cole a localização da etapa passada. Em seguida selecione-a e clique em "Mover para cima" até estar no topo da lista.
clique OK

* Caso queira testar o aplicativo em sua máquina desktop, o Android Studio tem um emulador de Android. Mas é possível fazer testes com seu próprio dispositivo mobile se desejar.

Após a instalação do Android Studio, vá para https://reactnative.dev/docs/set-up-your-environment (traduza a página) e siga as instruções 1 e 2 na seção "Ambiente de desenvolvimento Android"

Vá para /android/app/build.gradle e procure pela seção

```js
cmake {
    arguments
}
```

Certifique que o caminho que está na linha que contem está correto. (Aponta corretamente para o ninja.exe)

Após isto, instale a versão mais atualizada do ninja em https://github.com/ninja-build/ninja/releases (ninja-win.zip), pegue o ninja.exe que vem dentro do ZIP e depois coloque ele no mesmo caminho anterior, substituindo o ninja.exe que já estava lá dentro.

Re-abra o VS-Code ou seu IDE
Re-Abra o terminal 
Navegue para esta pasta (cd src/app)
Rode o comando "npm install"

teste "java -version" > deve retornar versão 21.x.x
teste "adb devices" > deve ser reconhecido.

Configure e deixe aberto seu ambiente mobile, seja local conectado ao USB (Você precisa habilitar opções de depuração no dispositivo) ou Emulador de Android como o Android Studio.
Se foi configurado corretamente, rodar "adb devices" deve mostrar o(s) dispositivo(s) conectados a sua máquina.
Rode "npx react-native run-android". (A execução demora bem mais na primeira vez)

Talvez seja necessário rodar o seguinte comando no Powershell, caso não dê certo:

```powershell
"New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force"
```

# Getting Started

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
