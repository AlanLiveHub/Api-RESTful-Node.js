/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // id INT AUTO_INCREMENT PRIMARY KEY
    table.uuid('uuid').notNullable().unique(); // uuid gerado na Aplicação
    table.string('name', 255).notNullable(); // name VARCHAR(255) NOT NULL
    table.string('email', 255).notNullable().unique(); // email VARCHAR(255) NOT NULL UNIQUE
    table.string('password', 255).notNullable(); // password VARCHAR(255) NOT NULL
    table.boolean('status').notNullable().defaultTo(true); // status BOOLEAN NOT NULL DEFAULT true
    table.string('role', 50).notNullable().defaultTo('user'); // role VARCHAR(50) NOT NULL DEFAULT 'user'
    // table.timestamps(true, true); // Isso cria created_at e updated_at
    // A linha acima é um atalho. Vamos fazer como você pediu:
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.timestamp('deleted_at').nullable().defaultTo(null);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};