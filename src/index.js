
const inquirer = require('inquirer');
const fs = require('fs');
const chalk = require('chalk');
const { AsyncResource } = require('async_hooks');

operation();

function operation(){
    inquirer.prompt([
        {
            type:'list',
            name:'action',
            message:'O que voce deseja fazer?',
            choices:[
                'Criar Conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        }
    ]).then((answers) =>{
        const action = answers['action'];
        if(action == 'Criar Conta'){
            createAccount();
        }
        if(action == 'Consultar Saldo'){
            getAccountBalance();
        }
        if(action == 'Depositar'){
            Depositar();
        }
        if(action == 'Sacar'){
            withDraw();
        }
        if(action =='Sair'){
            Sair();
        }
       
    }).catch((err) => console.log(err));
}

// funcao pára criar a consta
function createAccount(){
    console.log(chalk.bgGreen.black('Parabens por escolher o nosso banco!!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));
    buildAccount();
}

function buildAccount(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Digite um nome para sua conta'
        }
    ]).then((answer) =>{
        const accountName = answer['accountName'];
        console.info(accountName);

        //verificando se uma conta ja existe...se o diretorio não existe, criar um diretorio com nome accounts
        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts');//criando pasta
        }
        //verificando o se existe uma conta com mesmo nome..
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.white('Esta conta ja exisite, escolha outro nome'));
            buildAccount();
            return;
        }

        fs.writeFileSync(
            `accounts/${accountName}.json`,
            '{"balance":0}',
            function(err){
                console.log(err)
            },
        );

        console.log(chalk.green('Conta criada com sucesso'));
        operation();
    }).catch((err) =>{
        console.log(err);
    })
}


function Depositar(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Qual o nome da sua conta?',
        },
    ]).then((answer) =>{
        const accountName = answer['accountName'];

        //verificando se a conta existe
        if(!checkAccount(accountName)){
            return Depositar();
        }

        inquirer.prompt([
            {
                name:'amount',
                message:'Quanto voce deseja depositar ?',
            },
        ]).then((answer) =>{
            const amount = answer['amount'];
            deposit(accountName , amount);
            operation();

        }).catch(err => console.log(err));
        
    }).catch((err => console.log(err)));
}




function Sair(){
    console.log(chalk.bgRed.white('Saindo do Programa'));
    process.exit();
}






//funcao para verificar se a conta digitada existe....
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.white('Estra conta nao existe, esocolha outro nome!!'));
        return false;
    }else{
        return true;
    }

}

//funcao para depositar o dinheiro na conta 
function deposit(accountName , amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.white('Ocorreu um erro'));
        return deposit();
    }
    //adicionando valor depositado 
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

    //escrenvendo os dados no arquivo 
    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err);
        }
    );
}

//lendo  dados das contas 
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    });

    return JSON.parse(accountJSON);
}


//consultando saldo da conta
function getAccountBalance(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Qual o nome da sua conta?'
        }
    ]).then((answer)=>{
        const accountName = answer['accountName'];

        if(!checkAccount(accountName)){
            return getAccountBalance();
        }

        const accountData = getAccount(accountName);

        console.log(chalk.bgBlue.white(`O saldo da conta é de ${accountData.balance}`));
        operation();
    }).catch((err) => console.log(err));
}

function withDraw(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Qual o nome da sua conta?'
        }
    ]).then((answer)=>{
            const account = answer['accountName'];
            if(!checkAccount(account)){
                return withDraw();
            }
            inquirer.prompt([
                {
                    name:'amount',
                    message:'Quanto voce deseja sacar?'
                }
            ]).then((answer) =>{
                const amount = answer['amount'];
                removeAmount(account, amount);
            }).catch((err) => console.log(err))
    }).catch(err => console.log(err))
}


//removendo valor da conta
function removeAmount(accountName, amount){
    const accountData  = getAccount(accountName);

    if(!amount){ //verificando se o foi digitado o nome da conta corretamente
        console.log(chalk.bgRed.black('Erro, tente novamente'));
        return withDraw();
    }

    //verficando o valor da conta...
    if(accountData.balance < amount){
        console.log(chalk.bgRed.white('Erro, valor  indisponivel'));
        return withDraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
     fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err);
        }
    );

    console.log(chalk.bgGreen.white(`Voce sacou ${amount} da conta ${accountName}`));
    operation();
}