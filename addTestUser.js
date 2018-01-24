const mongoose = require('mongoose');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = require('./config');
mongoose.Promise = global.Promise;
mongoose
  .connect(`mongodb://${config.db.user}:${config.db.password}@ds263137.mlab.com:${config.db.port}/${config.db.name}`)
  .catch(e => {
    console.error(e);
    throw e;
  });

mongoose.connection.on('connected', function () {
  console.log(
    `Mongoose default connection open mongodb://${config.db.host}:${
    config.db.port
    }/${config.db.name}`
  );
});
//логин и пароль, изначально пустые
let login = '',
  password = '',
  token = '',
  author = '',
  role = '';

const cmdAddUser = () => {
  rl.question('Логин: ', answer => {
    login = answer;

    rl.question('Пароль: ', answer => {
      password = answer;

      rl.question('Роль: ', answer => {
        role = answer;

        rl.question('ФИО: ', answer => {
          author = answer;
          rl.question('Инвайт-код: ', answer => {
            token = answer;

            rl.close();
          });
        });
      });
    });
  });
}

cmdAddUser();
//когда ввод будет завершен
rl.on('close', () => {
  //подключаем модель пользователя
  require('./api/models/users');
  //создаем экземпляр пользователя и указываем введенные данные
  const User = mongoose.model('users');
  const testUser = new User({ login, author, role, token });
  testUser.setPassword(password);
  //пытаемся найти пользователя с таким логином
  User.findOne({ login: login })
    .then(u => {
      //если такой пользователь уже есть - сообщаем об этом
      if (u) {
        throw new Error('Такой пользователь уже существует!');
      }

      //если нет - добавляем пользователя в базу
      return testUser.save();
    })
    .then(u => { console.log('ok!'); cmdAddUser(); }, e => console.error(e.message))
});
