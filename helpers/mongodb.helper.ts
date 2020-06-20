import { MongoClient } from 'mongodb';
import ENV from '../environments/env.production';

export default class MongoDBHelper {
    public db: any;

    private cnn: any;
    private port: number;
    private dbUri: string;

    private static _instance: MongoDBHelper;

    constructor(SETTINGS: any) {
        this.port = SETTINGS.PORT;
        this.dbUri = `mongodb://${SETTINGS.USER_NAME}:${SETTINGS.USER_PASSWORD}@${SETTINGS.HOST}/${SETTINGS.DEFAULT_DATABASE}`;
    }

    public static getInstance(settings: any) {
        return this._instance || (this._instance = new this(settings));
    }

    async connect() {
        MongoClient.connect(this.dbUri, { useNewUrlParser: true, useUnifiedTopology: true }).then((connection) => {
            this.cnn = connection;
            this.db = this.cnn.db();
            console.log('ya jala la db');
        }).catch((err: any) => {
            console.log(`error :( ${err}`)
        });
    }
    setDataBase(dbName: string) {
        this.db = this.cnn.db(dbName);
    }

    async close() {
        this.cnn.close();
    }
}