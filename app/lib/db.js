// db.js
//import postgres from 'postgres'
const postgres = require('postgres')


const sql = postgres('postgres://user:pass@postgres:5432/db', {
  host                 : 'postgres',            // Postgres ip address[s] or domain name[s]
  port                 : 5432,          // Postgres server port[s]
  database             : 'db',            // Name of database to connect to
  username             : 'user',            // Username of database user
  password             : 'pass',            // Password of database user
})

module.exports = sql
//export default sql