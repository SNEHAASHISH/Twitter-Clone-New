const mongoose = require('mongoose');

class Database {
    
    constructor() {
        this.connect();
    }
    
    connect() {
        mongoose.connect("mongodb+srv://2019ucp1900:dbUserPassword@cluster0.bli5vub.mongodb.net/?retryWrites=true&w=majority")
        .then(() => {
            console.log('mongodb connection established');
        })
        .catch((error) => {
            console.log('error connecting', error);
        })
    }
}

module.exports = new Database();