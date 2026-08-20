import Fastify from 'fastify'
import { Pool } from 'pg'
import cors from '@fastify/cors'

const sql = new Pool({
    user: "postgres",
    password: "senai",
    host: "localhost",
    port: 5432,
    database: "Tarefas"
})

const servidor = Fastify()

servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'PUT', 'POST','DELETE']
})


servidor.get('/usuarios', async () => {
    const resultado = await sql.query('select * from usuario')
    return resultado.rows
})

servidor.get('/Tarefas', async () => {
    const resultado = await sql.query('select * from tarefas')
    return resultado.rows
})


servidor.post('/Tarefas', async (request, reply) => {
    const { titulo, descricao } = request.body; 

    if (!titulo || !descricao) {
        return reply.status(400).send(
            {error: "Título e descrição são obrigatórios!"}
        )
    }

    await sql.query(
        'INSERT INTO tarefas (titulo, descricao) VALUES ($1, $2)', 
        [titulo, descricao]
    )      
    reply.status(201).send({mensagem: "Tarefa criada com sucesso!"})
})


servidor.post('/usuarios', async (request, reply) => {
    const { nome, email, senha } = request.body; 

    if (!nome || !email || !senha) {
        return reply.status(400).send(
            {error: "Nome, email e senha são obrigatórios!"}
        )
    }

    try {
        await sql.query(
            'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3)', 
            [nome, email, senha]
        )      
        reply.status(201).send({mensagem: "Usuário criado com sucesso!"})
    } catch (erro) {
        if (erro.code === '23505') {
            return reply.status(400).send({error: "Este e-mail já está cadastrado!"})
        }
        console.error(erro) 
        reply.status(500).send({error: "Erro interno ao tentar salvar o usuário."})
    }
})

servidor.put('/usuarios/:id', async (request, reply) => {
    const body = request.body;
    const id = request.params.id;

    if (!body || !body.nome || !body.senha || !body.email) {
        return reply.status(400).send(
            {error: "Nome, email e senha são obrigatórios!"}
        )
    } else if (!id) {
        return reply.status(400).send({
            error: "Faltou o id!"
        })
    }

    const existe = await sql.query('select * from usuario where id = $1', [id])

    if (existe.rows.length === 0) {
        return reply.status(400).send({ 
            error: `Usuário com o id: ${id} não existe`
        })
    }

    try {
        await sql.query(
            'UPDATE usuario SET nome = $1, senha = $2, email = $4 WHERE id = $3', 
            [body.nome, body.senha, id, body.email]
        )    
        reply.send({message: "Usuário alterado!"})
    } catch (erro) {
        if (erro.code === '23505') {
            return reply.status(400).send({error: "Este e-mail já está em uso por outro usuário!"})
        }
        console.error(erro)
        reply.status(500).send({error: "Erro interno ao tentar alterar o usuário."})
    }
})

servidor.delete('/usuarios/:id', async (request, reply) => {
    const id = request.params.id
    await sql.query('DELETE FROM usuario where id = $1', [id])      
    reply.status(204).send() 
})


servidor.post('/login', async (request, reply) => {
    const { email, senha } = request.body; 
    
    const resultado = await sql.query(
        'select * from usuario where email = $1 AND senha = $2', 
        [email, senha]
    )    

    if (resultado.rows.length === 0) {
        return reply.status(401).send({error: 'E-mail ou senha inválidos!'})
    }

    reply.status(200).send({mensagem: "Login realizado com sucesso!", ok: true})
})

servidor.listen({
    port: 3000
})