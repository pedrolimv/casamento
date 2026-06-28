# B&P Wedding

Site estático pronto para GitHub Pages com RSVP enviando para Google Sheets.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie esta pasta de trabalho para o repositório.
3. No GitHub, abra `Settings > Pages`.
4. Em `Build and deployment`, selecione `GitHub Actions`.
5. Faça um push na branch `main` ou rode o workflow `Deploy GitHub Pages`.

O workflow publica a pasta:

```text
outputs/beatriz-pedro-copia
```

## Ligar o RSVP ao Google Sheets

1. Crie uma planilha no Google Sheets.
2. Vá em `Extensões > Apps Script`.
3. Apague o conteúdo padrão e cole o conteúdo de `google-apps-script.gs`.
4. Clique em `Implantar > Nova implantação`.
5. Escolha o tipo `App da Web`.
6. Configure:
   - Executar como: `Eu`
   - Quem pode acessar: `Qualquer pessoa`
7. Copie a URL da implantação.
8. Abra `config.js` e substitua:

```js
googleAppsScriptUrl: "COLE_AQUI_A_URL_DO_APPS_SCRIPT"
```

pela URL copiada.

As confirmações entram automaticamente na aba `Convidados`.

## Testar

Depois de configurar a URL, abra o site, preencha o RSVP e confira a aba `Convidados` na planilha.
