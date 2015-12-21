import lodash from 'lodash';
const minimongo = require("minimongo");
const fs = require('fs');

require('dotenv').load();
const jsonFile = String(process.env.DB_IMPORT_JSON).trim();
const collection = String(process.env.DB_COLLECTION).trim();
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
    if (this.db === null) {
      this.initDatabase();
    }
    return this.db;
  }

  private initDatabase(): void {
    const LocalDb = minimongo.MemoryDb;
    this.db = new LocalDb();
    this.db.addCollection(collection);

    let lines = fs.readFileSync(jsonFile, 'utf-8').toString().split(splitter) as string[];
    lines = lines.filter(line => {
      return line.indexOf('{') > -1 && line.indexOf('}') > -1;
    });

    const json = "[" + splitter + lines.join(',' + splitter) + splitter + "]";
    const obj = JSON.parse(json);

    this.db[collection].upsert(obj, () => {
      console.log('========= minimongo database is now on ready. =========');
      console.log('documents count: ' + this.db[collection].find({}, {}).fetch(res => res.length));
    });
  }
}