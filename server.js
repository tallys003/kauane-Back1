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
servidor.get('/tarefas', async () => {
    const resultado = await sql.query('select * from tarefas')
    return resultado.rows
})

servidor.post('/Tarefas', async (request, reply) => {
    const titulo = request.body.titulo;
    const descricao = request.body.descricao;

    if (!titulo || !descricao) {
        return reply.status(400).send(
            {error: "titulo, descricao são obrigatórios!"}
        )
    }

    const resultado = await sql.query(
        'INSERT INTO usuario (titulo, descricao) VALUES ($1, $2, $3)', 
        [titulo, descricao])       
    reply.status(201).send({mensagem: "Deu certo!"})
})

servidor.post('/usuarios', async (request, reply) => {
    const titlo = request.body.titulo;
    const descricao = request.body.desricao;

    if (!nome || !senha || !email) {
        return reply.status(400).send(
            {error: "titulo, descricao são obrigatórios!"}
        )
    }

    const resultado = await sql.query(
        'INSERT INTO usuario (titulo, descricao) VALUES ($1, $2)', 
        [titulo, descricao])       
    reply.status(201).send({mensagem: "Deu certo!"})
})

servidor.put('/usuarios/:id', async (request, reply) => {
    const body = request.body;
    const id = request.params.id;

    if (!body || !body.nome || !body.senha || !body.email) {
        return reply.status(400).send(
            {error: "titulo, descricao são obrigatórios!"}
        )
    } else if (!id) {
        return reply.status(400).send({
            error: "Faltou o id!"
        })
    }

    const existe = await sql.query('select * from usuario where id = $1', [id])

    if (existe.rows.length === 0) {
        reply.status(400).send({
            error: `Usuário com o id: ${id} não existe`
        })
    }

    const resultado = await sql.query('UPDATE usuario SET nome = $1, senha = $2, email = $4 WHERE id = $3', [body.nome, body.senha, id, body.email])     
    reply.send({message: "Usuário alterado!"})
})

servidor.delete('/usuarios/:id', async (request, reply) => {
    const id = request.params.id
    const resultado = await sql.query('DELETE FROM usuario where id = $1', [id])      
    reply.status(204)
})

servidor.post('/login', async (request, reply) => {
    const body = request.body;
    const resultado = await sql.query('select * from usuario where email = $1 AND senha = $2', [body.titulo, body.descricao])     

    if (resultado.rows.length === 0) {
        return reply.status(401).send({error: 'titulo ou descricao inválidos!'})
    }

    reply.status(200).send({mensagem: "login realizado com sucesso!", ok: true})
})

servidor.listen({
    port: 3000
})