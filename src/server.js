const express = require("express");
const server = express();
const routes = require("./routes");

//usando template engine
server.set("view engine", "ejs");

//habilitar arquivos estaticos
server.use(express.static("public"));

//usar o req.body
server.use(express.urlencoded({ extended: true }));

//routes
server.use(routes);

//printa no terminal::: "\033[32m [ESSE VALOR 32 DEFINE A COR DO PRINT]"
server.listen(3000, () => console.log("\033[32m [SERVIDOR RODANDO]"));
/*OUTRAS CORES: https://imasters.com.br/desenvolvimento/como-criar-um-console-colorido-usando-nodejs
" \033[0;31m Vermelho \033[0m --> 0;31 "
" \033[0;32m Verde \033[0m --> 0;32 "
" \033[0;34m Azul \033[0m --> 0;34 "
" \033[0;35m Purple \033[0m --> 0;35 "*/
