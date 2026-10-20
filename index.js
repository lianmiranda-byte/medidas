const express = require('express');
const db = require('./db');
const app = express();
const port = 3000;
app.use(express.json());

function temp(celcius) {
    const numcelcius = parseFloat(celcius);
    const calculo = ((numcelcius * 9 / 5) + 32);
    const numf = parseFloat(calculo.toFixed(2));

    let classe = "";

    if (calculo <= 50) {
        classe = "Frio";
    } else if (calculo > 50 && calculo <= 70) {
        classe = "Morno";
    } else {
        classe = "Quente";
    }
    return { valor_convertido: numf, classificacao: classe, unidade_convertida: "Fahrenheit" }
}
function velo(kmh) {
    const numkmh = parseFloat(kmh);
    const calculo = (numkmh / 3.6);
    const numms = parseFloat(calculo.toFixed(2));

    let classe = "";

    if (calculo <= 11) {
        classe = "Baixa Velocidade";
    } else if (calculo > 11 && calculo <= 25) {
        classe = "Velocidade Moderada";
    } else {
        classe = "Alta Velocidade";
    }
    return { valor_convertido: numms, classificacao: classe, unidade_convertida: "m/s" }
}
function comp(m) {
    const numm = parseFloat(m);
    const calculo = (numm * 3.28084);
    const numft = parseFloat(calculo.toFixed(2));

    let classe = "";

    if (calculo <= 16) {
        classe = "Curto";
    } else if (calculo > 16 && calculo <= 164) {
        classe = "Médio";
    } else {
        classe = "Longo";
    }
    return { valor_convertido: numft, classificacao: classe, unidade_convertida: "ft" }
}
app.get('/', async (req, res) => {
    try {
        res.status(200).json({ mensagem: "o sistema está rodando!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
    }
});
app.get('/medicao', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM medicoes');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
    }
});
app.get('/medicao/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM medicoes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: "Paciente não encontrado" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
    }
});
app.post('/medicao', async (req, res) => {
    const { tipo, unidade_original, descricao, valor_original, } = req.body;

    if (!tipo || !unidade_original || valor_original == undefined || !descricao) {
        return res.status(400).json({ mensagem: "Verifique se todos os campos estão preenchidos" });
    }
    const tipoM = tipo.toLowerCase();
    let convertido;

    if (tipoM === "velocidade") {
        convertido = velo(valor_original);
    } else if (tipoM === "temperatura") {
        convertido = temp(valor_original);
    } else if (tipoM === "comprimento") {
        convertido = comp(valor_original);
    } else {
        return res.status(400).json({ mensagem: "O tipo é incopativel" });
    }
    const { valor_convertido, classificacao, unidade_convertida } = convertido

    try {
        const query = `
            INSERT INTO medicoes (tipo, unidade_original, valor_original, descricao, valor_convertido, classificacao,unidade_convertida) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [tipo, unidade_original, valor_original, descricao, valor_convertido, classificacao, unidade_convertida]);

        res.status(201).json({
            descricao,
            tipo,
            valor_original,
            unidade_original,
            valor_convertido,
            unidade_convertida,
            classificacao
        });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
    }
});
app.get('/medicao/altavelocidade', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM `medicoes` WHERE `classificacao` = "Alta velocidade";');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
    }
})
app.put('/medicao/put/:id', async (req, res) => {
    const { tipo, unidade_original, descricao, valor_original, } = req.body;
    const { id } = req.params;

    if (!tipo || !unidade_original || valor_original == undefined || !descricao) {
        return res.status(400).json({ mensagem: "Verifique se todos os campos estão preenchidos" });
    }
    const tipoM = tipo.toLowerCase();
    let convertido;

    if (tipoM === "velocidade") {
        convertido = velo(valor_original);
    } else if (tipoM === "temperatura") {
        convertido = temp(valor_original);
    } else if (tipoM === "comprimento") {
        convertido = comp(valor_original);
    } else {
        return res.status(400).json({ mensagem: "O tipo é incopativel" });
    }
    const { valor_convertido, classificacao, unidade_convertida } = convertido

    try {
        const [rows] = await db.execute('SELECT * FROM medicoes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: "Paciente não encontrado" });
        }
        const query = `
            UPDATE medicoes 
            SET tipo = ?, unidade_original = ?, valor_original = ?, descricao = ?, valor_convertido = ?, classificacao = ?, unidade_convertida = ? 
            WHERE id = ?
        `;
        await db.execute(query, [
            tipo, 
            unidade_original, 
            valor_original, 
            descricao, 
            valor_convertido, 
            classificacao, 
            unidade_convertida, 
            id
        ]);
        res.status(200).json({
            id: Number(id),
            descricao,
            tipo,
            valor_original,
            unidade_original,
            valor_convertido,
            unidade_convertida,
            classificacao
        });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
    }
});
app.delete('/paciente/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM medicoes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Paciente não encontrado" });
    }
    res.status(200).json({ mensagem: "Paciente apagado com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno do servidor", detalhes: error.message });
  }
});
app.listen(port, () => {
    console.log(`Servidor rodando com sucesso em http://localhost:${port}`);
});