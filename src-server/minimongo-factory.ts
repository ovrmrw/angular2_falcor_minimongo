import _ from 'lodash';
const minimongo = require("minimongo");
const fs = require('fs');

require('dotenv').load();
const DB_IMPORT_JSON = _.trim(process.env.DB_IMPORT_JSON);
const DB_COLLECTION = _.trim(process.env.DB_COLLECTION);
const jsonFile = DB_IMPORT_JSON;
const splitter = '\n';

export class MinimongoFactory {
  private static _db = null;
  private get db() {
    return MinimongoFactory._db;
  }
  private set db(db: any) {
    MinimongoFactory._db = db;
  }

  public getDatabase(): any {
    if (_.isNull(this.db)) {
      this.initDatabase();
    }
    return this.db;
  }

  private initDatabase(): void {
    const LocalDb = minimongo.MemoryDb;
    this.db = new LocalDb();
    this.db.addCollection(DB_COLLECTION);

    let lines = fs.readFileSync(jsonFile, 'utf-8').toString().split(splitter) as string[];
    lines = _.filter(lines, line => {
      return line.indexOf('{') > -1 && line.indexOf('}') > -1;
    });

    const json = "[" + splitter + lines.join(',' + splitter) + splitter + "]";
    const obj = JSON.parse(json);

    this.db[DB_COLLECTION].upsert(obj, () => {
      console.log('========= minimongo database is now on ready. =========');
      console.log('documents count: ' + this.db[DB_COLLECTION].find({}, {}).fetch(res => res.length));
    });
  }
}