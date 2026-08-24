/*
=========================================================
 CONTROLE FINANCEIRO
 Versão 2

 Recursos:
 - Receitas
 - Despesas
 - Saldo inicial
 - Planejamento
 - Reserva para contas futuras
 - Fechamento mensal
 - Histórico
 - LocalStorage
=========================================================
*/


// ======================================================
// DADOS
// ======================================================

let dados =
    JSON.parse(
        localStorage.getItem("controleFinanceiro")
    ) || {

        saldoInicial: 0,

        lancamentos: [],

        historico: []

    };


// ======================================================
// FUNÇÕES GERAIS
// ======================================================

function salvarDados() {

    localStorage.setItem(
        "controleFinanceiro",
        JSON.stringify(dados)
    );

}


function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function dataFormatada(data) {

    const partes = data.split("-");

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


function dataObjeto(data) {

    const partes = data.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}


function dataAtualISO() {

    const hoje = new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


// ======================================================
// MÊS ATUAL
// ======================================================

function mostrarMesAtual() {

    const hoje = new Date();

    const texto =
        hoje.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

    document.getElementById(
        "mesAtual"
    ).textContent =
        texto.charAt(0).toUpperCase() +
        texto.slice(1);

}


// ======================================================
// SALDO INICIAL
// ======================================================

function atualizarSaldoInicial() {

    document.getElementById(
        "saldoInicial"
    ).textContent =
        dinheiro(dados.saldoInicial);

    document.getElementById(
        "inputSaldoInicial"
    ).value =
        dados.saldoInicial || "";
}


document
    .getElementById("salvarSaldoInicial")
    .addEventListener(
        "click",
        function () {

            const valor =
                Number(
                    document.getElementById(
                        "inputSaldoInicial"
                    ).value
                );

            dados.saldoInicial =
                valor || 0;

            salvarDados();

            atualizarTela();

            alert(
                "Saldo inicial salvo!"
            );

        }
    );


// ======================================================
// ADICIONAR LANÇAMENTO
// ======================================================

document
    .getElementById("formLancamento")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const tipo =
                document.getElementById(
                    "tipo"
                ).value;


            const descricao =
                document.getElementById(
                    "descricao"
                ).value.trim();


            const data =
                document.getElementById(
                    "data"
                ).value;


            const valor =
                Number(
                    document.getElementById(
                        "valor"
                    ).value
                );


            if (!descricao) {

                alert(
                    "Digite uma descrição."
                );

                return;

            }


            if (!data) {

                alert(
                    "Escolha uma data."
                );

                return;

            }


            if (
                !valor ||
                valor <= 0
            ) {

                alert(
                    "Digite um valor válido."
                );

                return;

            }


            dados.lancamentos.push({

                id: Date.now(),

                tipo: tipo,

                descricao: descricao,

                data: data,

                valor: valor

            });


            salvarDados();


            this.reset();


            document.getElementById(
                "data"
            ).value =
                dataAtualISO();


            atualizarTela();

        }
    );


// ======================================================
// EXCLUIR
// ======================================================

function excluirLancamento(id) {

    dados.lancamentos =
        dados.lancamentos.filter(
            item =>
                item.id !== id
        );


    salvarDados();

    atualizarTela();

}


// ======================================================
// LIMPAR MÊS
// ======================================================

document
    .getElementById("limparTudo")
    .addEventListener(
        "click",
        function () {

            if (
                dados.lancamentos.length === 0
            ) {

                return;

            }


            const confirmou =
                confirm(
                    "Deseja realmente apagar todas as movimentações deste mês?"
                );


            if (!confirmou) {

                return;

            }


            dados.lancamentos = [];

            salvarDados();

            atualizarTela();

        }
    );


// ======================================================
// CÁLCULO DO SALDO
// ======================================================

function calcularTotais() {

    let receitas = 0;

    let despesas = 0;


    dados.lancamentos.forEach(
        item => {

            if (
                item.tipo === "receita"
            ) {

                receitas +=
                    item.valor;

            } else {

                despesas +=
                    item.valor;

            }

        }
    );


    const saldo =
        dados.saldoInicial +
        receitas -
        despesas;


    return {

        receitas,

        despesas,

        saldo

    };

}


// ======================================================
// RESUMO
// ======================================================

function atualizarResumo() {

    const totais =
        calcularTotais();


    document.getElementById(
        "totalReceitas"
    ).textContent =
        dinheiro(
            totais.receitas
        );


    document.getElementById(
        "totalDespesas"
    ).textContent =
        dinheiro(
            totais.despesas
        );


    document.getElementById(
        "saldo"
    ).textContent =
        dinheiro(
            totais.saldo
        );


    document.getElementById(
        "fechamentoPrevisto"
    ).textContent =
        dinheiro(
            totais.saldo
        );


    calcularReservas();

}


// ======================================================
// ORDENAR LANÇAMENTOS
// ======================================================

function obterLancamentosOrdenados() {

    return [
        ...dados.lancamentos
    ].sort(
        (a, b) => {

            const diferenca =
                dataObjeto(a.data) -
                dataObjeto(b.data);


            if (diferenca !== 0) {

                return diferenca;

            }


            /*
            Se dois lançamentos possuem
            a mesma data, receitas entram
            antes das despesas.
            */

            if (
                a.tipo === "receita" &&
                b.tipo === "despesa"
            ) {

                return -1;

            }


            if (
                a.tipo === "despesa" &&
                b.tipo === "receita"
            ) {

                return 1;

            }


            return 0;

        }
    );

}


// ======================================================
// LISTA DE LANÇAMENTOS
// ======================================================

function atualizarLancamentos() {

    const area =
        document.getElementById(
            "listaLancamentos"
        );


    area.innerHTML = "";


    if (
        dados.lancamentos.length === 0
    ) {

        area.innerHTML =
            "<p>Nenhuma movimentação cadastrada.</p>";

        return;

    }


    const lista =
        obterLancamentosOrdenados();


    lista.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "lancamento";


            const receita =
                item.tipo === "receita";


            div.innerHTML = `

                <span>
                    ${dataFormatada(item.data)}
                </span>

                <span>
                    ${item.descricao}
                </span>

                <span class="${
                    receita
                        ? "valor-receita"
                        : "valor-despesa"
                }">

                    ${
                        receita
                            ? "+"
                            : "-"
                    }

                    ${dinheiro(item.valor)}

                </span>

                <button
                    class="btn-excluir"
                    onclick="excluirLancamento(${item.id})"
                >
                    Excluir
                </button>

            `;


            area.appendChild(div);

        }
    );

}


// ======================================================
// ALGORITMO DE RESERVAS
// ======================================================

function calcularReservas() {

    const lista =
        obterLancamentosOrdenados();


    /*
    Aqui vamos simular o dinheiro
    entrando e saindo na ordem das datas.
    */

    let saldo =
        dados.saldoInicial;


    /*
    Guarda os recebimentos que ainda
    podem ser usados para cobrir
    despesas futuras.
    */

    const recebimentos = [];


    /*
    Cada reserva encontrada ficará aqui.
    */

    const reservas = [];


    lista.forEach(
        item => {

            if (
                item.tipo === "receita"
            ) {

                saldo += item.valor;


                recebimentos.push({

                    id: item.id,

                    data: item.data,

                    descricao:
                        item.descricao,

                    valorOriginal:
                        item.valor,

                    disponivel:
                        item.valor

                });


            } else {

                /*
                Primeiro tenta pagar a despesa
                com o saldo acumulado.
                */

                saldo -= item.valor;


                /*
                Se o saldo ficou negativo,
                precisamos descobrir de onde
                virá o dinheiro.
                */

                if (saldo < 0) {

                    let falta =
                        Math.abs(saldo);


                    /*
                    Procura recebimentos futuros.
                    */

                    for (
                        let i = 0;
                        i < recebimentos.length &&
                        falta > 0;
                        i++
                    ) {

                        const recebimento =
                            recebimentos[i];


                        if (
                            recebimento.disponivel <= 0
                        ) {

                            continue;

                        }


                        const usar =
                            Math.min(
                                recebimento.disponivel,
                                falta
                            );


                        recebimento.disponivel -=
                            usar;


                        falta -= usar;


                        reservas.push({

                            conta:
                                item.descricao,

                            dataConta:
                                item.data,

                            valorConta:
                                item.valor,

                            recebimento:
                                recebimento.descricao,

                            dataRecebimento:
                                recebimento.data,

                            valor:
                                usar

                        });

                    }


                    /*
                    Depois que encontramos de onde
                    sairia o dinheiro, corrigimos
                    a simulação.

                    O valor reservado será considerado
                    como dinheiro comprometido.
                    */

                    saldo = 0;

                }

            }

        }
    );


    /*
    =====================================================
    IMPORTANTE

    O algoritmo acima identifica situações em que
    uma despesa ultrapassa o dinheiro disponível.

    Agora vamos montar a visualização.
    =====================================================
    */

    mostrarReservas(reservas);


    /*
    Calcula o total que precisa ser reservado.
    */

    let totalReserva = 0;


    reservas.forEach(
        reserva => {

            totalReserva +=
                reserva.valor;

        }
    );


    document.getElementById(
        "totalReserva"
    ).textContent =
        dinheiro(totalReserva);


    return reservas;

}


// ======================================================
// MOSTRAR RESERVAS
// ======================================================

function mostrarReservas(reservas) {

    const area =
        document.getElementById(
            "planejamento"
        );


    area.innerHTML = "";


    if (
        reservas.length === 0
    ) {

        area.innerHTML = `

            <div class="reserva-card ok">

                <div class="reserva-topo">

                    <strong>
                        ✅ Nenhuma reserva obrigatória
                    </strong>

                    <span class="reserva-valor">
                        Tudo certo
                    </span>

                </div>

                <div class="reserva-info">

                    Com os valores cadastrados,
                    não foi identificada falta de
                    dinheiro para cobrir as despesas.

                </div>

            </div>

        `;

        document.getElementById(
            "alertaReserva"
        ).className =
            "alerta";


        document.getElementById(
            "alertaReserva"
        ).innerHTML = `
            ✅ <strong>Seu fluxo financeiro está coberto.</strong>
            As receitas cadastradas são suficientes
            para as despesas informadas.
        `;

        return;

    }


    document.getElementById(
        "alertaReserva"
    ).className =
        "alerta aviso";


    document.getElementById(
        "alertaReserva"
    ).innerHTML = `
        ⚠️ Existem contas que precisam
        de dinheiro reservado.
    `;


    reservas.forEach(
        reserva => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "reserva-card urgente";


            div.innerHTML = `

                <div class="reserva-topo">

                    <strong>
                        ${reserva.conta}
                    </strong>

                    <span class="reserva-valor">
                        Reserve ${dinheiro(reserva.valor)}
                    </span>

                </div>


                <div class="reserva-info">

                    Conta de
                    <strong>
                        ${dinheiro(reserva.valorConta)}
                    </strong>

                    com vencimento em
                    <strong>
                        ${dataFormatada(reserva.dataConta)}
                    </strong>

                    <br><br>

                    Do recebimento

                    <strong>
                        "${reserva.recebimento}"
                    </strong>

                    do dia

                    <strong>
                        ${dataFormatada(
                            reserva.dataRecebimento
                        )}
                    </strong>

                    reserve

                    <strong>
                        ${dinheiro(reserva.valor)}
                    </strong>.

                </div>

            `;


            area.appendChild(div);

        }
    );

}


// ======================================================
// FECHAMENTO
// ======================================================

document
    .getElementById("saldoReal")
    .addEventListener(
        "input",
        atualizarDiferenca
    );


function atualizarDiferenca() {

    const previsto =
        calcularTotais().saldo;


    const real =
        Number(
            document.getElementById(
                "saldoReal"
            ).value
        );


    const diferenca =
        real - previsto;


    const campo =
        document.getElementById(
            "diferenca"
        );


    campo.textContent =
        dinheiro(diferenca);


    if (
        diferenca < 0
    ) {

        campo.style.color =
            "#dc2626";

    } else {

        campo.style.color =
            "#16a34a";

    }

}


// ======================================================
// FECHAR MÊS
// ======================================================

document
    .getElementById("fecharMes")
    .addEventListener(
        "click",
        fecharMes
    );


function fecharMes() {

    if (
        dados.lancamentos.length === 0
    ) {

        alert(
            "Não existem movimentações para fechar."
        );

        return;

    }


    const saldoPrevisto =
        calcularTotais().saldo;


    const campoReal =
        document.getElementById(
            "saldoReal"
        ).value;


    /*
    Se o usuário não informar o saldo real,
    usamos o saldo previsto.
    */

    let saldoFinal;


    if (
        campoReal === ""
    ) {

        const confirmou =
            confirm(
                `Você não informou o saldo real.

Deseja fechar o mês usando o saldo previsto de ${dinheiro(saldoPrevisto)}?`
            );


        if (!confirmou) {

            return;

        }


        saldoFinal =
            saldoPrevisto;

    } else {

        saldoFinal =
            Number(campoReal);

    }


    const agora =
        new Date();


    const nomeMes =
        agora.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );


    /*
    Salva uma cópia completa do mês.
    */

    const registro = {

        id: Date.now(),

        mes: nomeMes,

        dataFechamento:
            new Date().toLocaleString(
                "pt-BR"
            ),

        saldoInicial:
            dados.saldoInicial,

        receitas:
            calcularTotais().receitas,

        despesas:
            calcularTotais().despesas,

        saldoPrevisto:
            saldoPrevisto,

        saldoReal:
            saldoFinal,

        diferenca:
            saldoFinal -
            saldoPrevisto,

        lancamentos:
            JSON.parse(
                JSON.stringify(
                    dados.lancamentos
                )
            )

    };


    dados.historico.push(
        registro
    );


    /*
    =====================================================
    AQUI ESTÁ A PARTE IMPORTANTE

    O saldo real do mês encerrado vira
    o saldo inicial do próximo mês.
    =====================================================
    */

    dados.saldoInicial =
        saldoFinal;


    /*
    Limpa os lançamentos do mês.
    */

    dados.lancamentos = [];


    salvarDados();


    document.getElementById(
        "saldoReal"
    ).value = "";


    atualizarTela();


    alert(
        `Mês fechado!

Saldo levado para o próximo mês:
${dinheiro(saldoFinal)}`
    );

}


// ======================================================
// HISTÓRICO
// ======================================================

function atualizarHistorico() {

    const area =
        document.getElementById(
            "historico"
        );


    area.innerHTML = "";


    if (
        dados.historico.length === 0
    ) {

        area.innerHTML = `

            <p class="historico-vazio">
                Nenhum mês fechado ainda.
            </p>

        `;

        return;

    }


    const lista =
        [...dados.historico].reverse();


    lista.forEach(
        mes => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "historico-item";


            const diferenca =
                mes.diferenca;


            div.innerHTML = `

                <div>

                    <strong>
                        ${mes.mes}
                    </strong>

                    <small>
                        Fechado em
                        ${mes.dataFechamento}
                    </small>

                </div>


                <div>

                    <small>
                        Saldo previsto
                    </small>

                    <strong>
                        ${dinheiro(
                            mes.saldoPrevisto
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        Saldo real
                    </small>

                    <strong>
                        ${dinheiro(
                            mes.saldoReal
                        )}
                    </strong>

                </div>


                <button
                    class="btn-ver"
                    onclick="verHistorico(${mes.id})"
                >
                    Ver mês
                </button>

            `;


            area.appendChild(div);

        }
    );

}


// ======================================================
// VER HISTÓRICO
// ======================================================

function verHistorico(id) {

    const mes =
        dados.historico.find(
            item =>
                item.id === id
        );


    if (!mes) {

        return;

    }


    document.getElementById(
        "tituloHistorico"
    ).textContent =
        `📚 ${mes.mes}`;


    const area =
        document.getElementById(
            "detalhesHistorico"
        );


    area.innerHTML = `

        <div class="painel">

            <p>
                <strong>
                    Saldo inicial:
                </strong>

                ${dinheiro(
                    mes.saldoInicial
                )}
            </p>

            <br>

            <p>
                <strong>
                    Receitas:
                </strong>

                ${dinheiro(
                    mes.receitas
                )}
            </p>

            <br>

            <p>
                <strong>
                    Despesas:
                </strong>

                ${dinheiro(
                    mes.despesas
                )}
            </p>

            <br>

            <p>
                <strong>
                    Saldo previsto:
                </strong>

                ${dinheiro(
                    mes.saldoPrevisto
                )}
            </p>

            <br>

            <p>
                <strong>
                    Saldo real:
                </strong>

                ${dinheiro(
                    mes.saldoReal
                )}
            </p>

            <br>

            <p>
                <strong>
                    Diferença:
                </strong>

                ${dinheiro(
                    mes.diferenca
                )}
            </p>

        </div>


        <h3>
            Movimentações
        </h3>

        <br>

    `;


    mes.lancamentos.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "lancamento";


            const receita =
                item.tipo === "receita";


            div.innerHTML = `

                <span>
                    ${dataFormatada(
                        item.data
                    )}
                </span>

                <span>
                    ${item.descricao}
                </span>

                <span class="${
                    receita
                        ? "valor-receita"
                        : "valor-despesa"
                }">

                    ${
                        receita
                            ? "+"
                            : "-"
                    }

                    ${dinheiro(
                        item.valor
                    )}

                </span>

            `;


            area.appendChild(div);

        }
    );


    document.getElementById(
        "modalHistorico"
    ).classList.remove(
        "escondido"
    );

}


// ======================================================
// FECHAR MODAL
// ======================================================

document
    .getElementById("fecharModal")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "modalHistorico"
                )
                .classList.add(
                    "escondido"
                );

        }
    );


// ======================================================
// ATUALIZAR TUDO
// ======================================================

function atualizarTela() {

    mostrarMesAtual();

    atualizarSaldoInicial();

    atualizarResumo();

    atualizarLancamentos();

    atualizarHistorico();

    atualizarDiferenca();

}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.getElementById(
    "data"
).value =
    dataAtualISO();


atualizarTela();