import {Sequelize} from 'sequelize';

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    dialect: 'mysql',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 3306,
});

sequelize.authenticate().then(async () => {
    console.log("Database Connection Established");
    await sequelize.sync({
        // force: true,
        // alter: true,
    });
}).catch((error) => {
    //Log Credentials
    console.log(process.env.DB_HOST);
    console.log(process.env.DB_DATABASE);
    console.log(process.env.DB_USER);
    console.log(process.env.DB_PASSWORD);


    console.log(`Database Connection Failed ${error}`);
});

export default sequelize;