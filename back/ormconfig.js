module.exports = {
   "type": "mysql",
   "host": "localhost",
   "port": 3306,
   "username": "markflix",
   "password": "markflix",
   "database": "markflix",
   "synchronize": true,
   "logging": false,
   "entities": [
      process.env.NODE_ENV === 'development' ?
        __dirname + "/src/entity/**/*.ts" :
        __dirname + "/build/entity/**/*.js"
   ],
   "migrations": [
      process.env.NODE_ENV === 'development' ?
        __dirname + "/src/migration/**/*.ts" :
        __dirname + "/build/migration/**/*.js"
   ],
   "subscribers": [
      process.env.NODE_ENV === 'development' ?
        __dirname + "/src/subscriber/**/*.ts" :
        __dirname + "/build/subscriber/**/*.js"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}