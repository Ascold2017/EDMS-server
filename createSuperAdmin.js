const mongoose = require("mongoose");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = require("./config");
mongoose.Promise = global.Promise;
mongoose
  .connect(
    `mongodb://${config.db.user}:${config.db.password}@ds263137.mlab.com:${
      config.db.port
    }/${config.db.name}`
  )
  .catch(e => {
    console.error(e);
    throw e;
  });

mongoose.connection.on("connected", function() {
  console.log(
    `Mongoose default connection open mongodb://${config.db.host}:${
      config.db.port
    }/${config.db.name}`
  );
});
//логин и пароль, изначально пустые
let login = "",
  password = "",
  token = "superAdminToken",
  author = "Администратор EDMS",
  role = "superAdmin",
  groupInvite = "superAdminGroup",
  email = "";

const cmdAddUser = () => {
  rl.question("Логин: ", answer => {
    login = answer;

    rl.question("Пароль: ", answer => {
      password = answer;
      rl.question("Почта - туда придут введенные данные: ", answer => {
        email = answer;
        rl.close();
      });
    });
  });
};

cmdAddUser();
//когда ввод будет завершен
rl.on("close", () => {
  //подключаем модель пользователя
  require("./api/models/groups");
  const mailer = require('./api/controllers/mailer');
  const cryptoPass = require("./lib/cryptoPass");
  //создаем экземпляр пользователя и указываем введенные данные
  const SuperAdminGroup = mongoose.model("groups");
  const crypto = cryptoPass.setPassword(password);
  const group = new SuperAdminGroup({
    name: "Админстрация EDMS",
    groupInvite,
    users: [
      {
        login,
        author,
        role,
        token,
        email,
        hash: crypto.hash,
        salt: crypto.salt,
        dateRegistration: Date.now().toString()
      }
    ]
  });
  group.save()
  .then(() => {
    console.log('Успешно добавлен');
    return mailer({
      group: groupInvite,
      adress: 'Test',
      email,
      login,
      password,
      subject: 'Доступи Першого суперадміністратора EDMS'
    });
  })
  .then(res => {
    console.log(res)
  })
  .catch(err => console.error(err));
  //пытаемся найти пользователя с таким логином
});
