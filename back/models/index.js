const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};

const sequelize = new Sequelize(config.database,config.username,config.password,config);

db.Comment = require("./comment")(sequelize,Sequelize);
db.User = require("./user")(sequelize,Sequelize);
db.Class = require("./class")(sequelize,Sequelize);
db.Email_auth = require("./email_auth")(sequelize,Sequelize);
db.Subject = require("./subject")(sequelize,Sequelize);

Object.keys(db).forEach(modelName => {//db모델들 associate 연산
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports =  db;