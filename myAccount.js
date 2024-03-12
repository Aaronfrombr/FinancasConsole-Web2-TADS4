const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const inquirer = require("inquirer");

var caminhoUsuario;
var usuario;

var voltarMenuPrincipal;

function run(username, funcaoMenuPrincipal) {
  const caminho = path.join("contas", username + ".json");

  if (fs.existsSync(caminho)) {
    caminhoUsuario = caminho;
    usuario = username;
    voltarMenuPrincipal = funcaoMenuPrincipal;
    dashboard();
  } else {
    throw new Error("Usuário não existe!"); // Usar `Error` em vez de `Exception`
  }
}

function dashboard() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "opcao",
        message: "Selecione a opção desejada:",
        choices: ["Consultar Saldo", "Depositar", "Sacar", "Sair"],
      },
    ])
    .then((respostas) => {
      const resp = respostas["opcao"];

      if (resp === "Consultar Saldo") {
        consultaSaldo();
      } else if (resp === "Depositar") {
        deposita();
      } else if (resp === "Sacar") {
        saca();
      } else {
        voltarMenuPrincipal();
      }
    })
    .catch((err) => {
      console.log(err);
      voltarMenuPrincipal();
    });
}

function consultaSaldo() {
  console.log("### Consultando saldo ###");

  if (!caminhoUsuario) {
    console.log(chalk.bgRed.black("Caminho do arquivo não especificado."));
    dashboard(); // Retornar ao dashboard após o erro
    return;
  }

  if (!fs.existsSync(caminhoUsuario)) {
    console.log(chalk.bgRed.black("Arquivo de conta não encontrado."));
    dashboard(); // Retornar ao dashboard após o erro
    return;
  }

  try {
    const content = fs.readFileSync(caminhoUsuario, "utf8");
    const conteudoSaldo = JSON.parse(content);
    const dinheiro = conteudoSaldo.monetario;

    console.log(chalk.bgGreen.white(`Você tem um total de ${dinheiro}R$`));

    dashboard(); // Chamar dashboard após a consulta
  } catch (err) {
    console.log(chalk.bgRed.black("Erro ao consultar saldo:", err));
    dashboard(); // Retornar ao dashboard após o erro
  }
}

function deposita() {
  console.log("### Depositando ###");
  inquirer
    .prompt([
      {
        type: "number",
        name: "deposito",
        message:
          "Informe o valor a ser depositado (somente números):",
      },
    ])
    .then((respostas) => {
      const deposito = respostas["deposito"];

      if (!deposito) {
        console.log(chalk.bgRed.black("Informe valor !"));
        return;
      } else if (deposito === 0) { // Usar `===` em vez de `==`
        console.log(chalk.bgRed.black("Deposito em Branco!"));
        return;
      }

      const caminho = path.join("contas", `${usuario}.json`);
      const conteudo = fs.readFileSync(caminho, "utf8");
      const dadosConta = JSON.parse(conteudo);

      dadosConta.monetario += deposito;

      fs.writeFileSync(caminho, JSON.stringify(dadosConta));

      console.log(chalk.bgGreen.white("Depósito realizado!"));

      dashboard();
    })
    .catch((err) => console.log(err));
}

function saca() {
  console.log("### Sacando ###");

  inquirer
    .prompt([
      {
        type: "number",
        name: "saque",
        message:
          "Informe o valor a ser sacado (somente números):",
      },
    ])
    .then((respostas) => {
      const saque = respostas["saque"];

      if (!saque) {
        console.log(chalk.bgRed.black("Informe valor!"));
        return;
      }

      const caminho = path.join("contas", `${usuario}.json`);
      const conteudo = fs.readFileSync(caminho, "utf8");
      const dadosConta = JSON.parse(conteudo);

      if (saque > dadosConta.monetario) {
        console.log(chalk.bgRed.black("O saque é maior que o disponivel."));
        return;
      }

      dadosConta.monetario -= saque;

      fs.writeFileSync(caminho, JSON.stringify(dadosConta));

      console.log(chalk.bgGreen.white("Saque realizado!"));

      dashboard();
    })
    .catch((err) => console.log(err));
}

module.exports = run;
