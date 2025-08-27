// Um helper para evitar try/catch repetitivo
// É uma função que recebe uma função assíncrona (controlador) e retorna uma nova função que executa a original, mas com um .catch(next) no final. Isso garante que qualquer erro em uma Promise seja passado para o nosso middleware de erro global.
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};