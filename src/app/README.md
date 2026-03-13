# SmartAgenda

## Instalação Rápida (Para avaliação do app)

Se você deseja apenas instalar e testar o aplicativo no seu celular Android sem configurar o ambiente de desenvolvimento, siga estas instruções:

1. **Onde encontrar o APK:**

   Colocamos o APK do app em [src/apk/SmartAgenda.apk](../apk/SmartAgenda.apk)
   *(Você pode baixar este arquivo diretamente para o seu celular).*

2. **Como instalar no dispositivo:**
   * Transfira ou baixe o arquivo `SmartAgenda.apk` para o seu dispositivo Android.
   * Abra o gerenciador de arquivos do celular, encontre o APK e toque no arquivo para iniciar a instalação.

3. **Avisos de Segurança (Play Protect):**
   * Como este é um projeto acadêmico e não foi publicado na Google Play Store, o Android exibirá um aviso de segurança do Play Protect.
   * Para prosseguir, toque em **"Mais detalhes"** e depois selecione **"Instalar assim mesmo"**, caso seja uma verificação de segurança, não há problema em verificar.
   * Caso o sistema peça permissão para "Instalar apps desconhecidos" ou "Fontes desconhecidas", conceda a permissão para o seu navegador ou gerenciador de arquivos concluir a instalação.

---

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