import * as lodash from 'lodash';
const minimongo = require("minimongo");
import * as fs from 'fs';
import * as zlib from 'zlib';

require('dotenv').load();
const gzippedJsonFile = String(process.env.DB_IMPORT_JSON).trim();
const collection = String(process.env.DB_COLLECTION).trim();
const splitter = '\n';

const doubleLine = '='.repeat(10);

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

    const buffer = fs.readFileSync(gzippedJsonFile);
    let lines = zlib.gunzipSync(buffer).toString('utf-8').split(splitter) as string[];
    lines = lines.filter(line => {
      return line.indexOf('{') > -1 && line.indexOf('}') > -1;
    });

    const json = "[" + splitter + lines.join(',' + splitter) + splitter + "]";
    const obj = JSON.parse(json);

    this.db[collection].upsert(obj, () => {
      console.log(`${doubleLine} minimongo database is now on ready. ${doubleLine}`);
      console.log('documents count: ' + this.db[collection].find({}, {}).fetch(res => res.length));
    });
  }
}