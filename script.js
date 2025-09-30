const visorElemento = document.getElementById('visor');
const botoesElementos = Array.from(document.getElementsByClassName('btn'));

let entradaAtual = '0';
let entradaAnterior = '';
let operadorSelecionado = null;
let deveResetarVisor = false;

botoesElementos.map(botao => {
    botao.addEventListener('click', (evento) => {
        const valor = evento.target.dataset.valor; // Usando data-valor do HTML

        if (valor === 'C') {
            limparTudo();
        } else if (valor === 'Backspace') {
            apagarUltimoCaractere();
        } else if (valor === '=' && operadorSelecionado && entradaAnterior !== '') {
            calcularResultado();
        } else if (ehOperador(valor)) {
            lidarComOperador(valor);
        } else if (ehNumero(valor) || valor === '.') {
            lidarComNumero(valor);
        }
        atualizarVisor();
    });
});

function atualizarVisor() {
    visorElemento.innerText = entradaAtual;
    if (entradaAtual.length > 12) {
        // Limita para não quebrar o layout visualmente, mas o valor completo é mantido
        visorElemento.innerText = entradaAtual.substring(0, 12) + "...";
    }
    if (entradaAtual === '') {
        visorElemento.innerText = '0';
    }
}

function limparTudo() {
    entradaAtual = '0';
    entradaAnterior = '';
    operadorSelecionado = null;
    deveResetarVisor = false;
}

function apagarUltimoCaractere() {
    if (deveResetarVisor) { // Se o visor deve ser resetado (após um cálculo), limpar tudo
        limparTudo();
        return;
    }
    entradaAtual = entradaAtual.slice(0, -1);
    if (entradaAtual === '') {
        entradaAtual = '0'; // Volta para '0' se a entrada ficar vazia
    }
}

function calcularResultado() {
    if (operadorSelecionado === null || deveResetarVisor && entradaAtual === entradaAnterior) {
        // Evita recálculo se '=' for pressionado múltiplas vezes após um resultado
        // ou se não houver operador.
        return;
    }
    if (entradaAtual === '' && operadorSelecionado) return; // Evita erro se o segundo operando estiver vazio

    let resultadoCalculado;
    const valorAnterior = parseFloat(entradaAnterior);
    const valorAtual = parseFloat(entradaAtual);

    if (isNaN(valorAnterior) || isNaN(valorAtual)) return; // Proteção contra valores não numéricos

    switch (operadorSelecionado) {
        case '+':
            resultadoCalculado = valorAnterior + valorAtual;
            break;
        case '-':
            resultadoCalculado = valorAnterior - valorAtual;
            break;
        case '*':
            resultadoCalculado = valorAnterior * valorAtual;
            break;
        case '/':
            if (valorAtual === 0) {
                resultadoCalculado = "Erro Div/0"; // Tratamento de divisão por zero
            } else {
                resultadoCalculado = valorAnterior / valorAtual;
            }
            break;
        default:
            return;
    }
    entradaAtual = resultadoCalculado.toString();
    operadorSelecionado = null;
    entradaAnterior = ''; // Limpa a entrada anterior após o cálculo
    deveResetarVisor = true; // Indica que o próximo número deve limpar o visor
}

function lidarComOperador(proximoOperador) {
    // Se já existe um operador e não estamos esperando para resetar o visor
    // (ou seja, o usuário está encadeando operações como 2+3*), calcula o anterior.
    if (operadorSelecionado && !deveResetarVisor && entradaAnterior !== '' && entradaAtual !== '0' && entradaAtual !== '') {
        calcularResultado();
        // Se houve um cálculo, entradaAtual agora tem o resultado.
        // Precisamos mover isso para entradaAnterior para a próxima operação.
        if (entradaAtual !== "Erro Div/0") {
             entradaAnterior = entradaAtual;
        } else {
            limparTudo(); // Se deu erro, limpa tudo
            atualizarVisor();
            return;
        }
    } else if (entradaAtual !== "Erro Div/0") {
        // Se não houve cálculo anterior ou o visor foi resetado,
        // o valor atual no visor se torna a entrada anterior.
        entradaAnterior = entradaAtual;
    }


    operadorSelecionado = proximoOperador;
    deveResetarVisor = true; // Prepara para a próxima entrada numérica limpar o visor
}

function lidarComNumero(numero) {
    if (entradaAtual === '0' || deveResetarVisor) {
        entradaAtual = ''; // Limpa '0' inicial ou valor anterior
        deveResetarVisor = false; // Permite concatenar números
    }
    // Evita múltiplos pontos decimais no mesmo número
    if (numero === '.' && entradaAtual.includes('.')) return;
    // Adiciona '0' antes do ponto se a entrada atual estiver vazia
    if (numero === '.' && entradaAtual === '') entradaAtual = '0';

    entradaAtual += numero;
}

function ehOperador(valor) {
    return valor === '+' || valor === '-' || valor === '*' || valor === '/';
}

function ehNumero(valor) {
    // Verifica se o valor pode ser convertido para um número finito
    return !isNaN(parseFloat(valor)) && isFinite(valor);
}

// Inicializa o visor ao carregar a página
atualizarVisor();