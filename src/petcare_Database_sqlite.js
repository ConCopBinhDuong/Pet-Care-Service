
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');


db.exec(`
  CREATE TABLE users (
    userid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
    role TEXT CHECK(role IN ('Pet owner', 'Service provider', 'Manager'))
  );
`);

db.exec(`
  CREATE TABLE manager (
    id INTEGER PRIMARY KEY,
    FOREIGN KEY(id) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE petowner (
    id INTEGER PRIMARY KEY,
    phone TEXT UNIQUE,
    city TEXT,
    address TEXT,
    FOREIGN KEY(id) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE serviceprovider (
    id INTEGER PRIMARY KEY,
    bussiness_name TEXT,
    logo BLOB,
    phone TEXT UNIQUE,
    description TEXT,
    address TEXT,
    website TEXT,
    FOREIGN KEY(id) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE ticket (
    ticketid INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    description TEXT,
    attachment BLOB,
    respone BLOB,
    status TEXT CHECK(status IN ('pending','solving','finished')),
    userid INTEGER,
    createtime DATETIME DEFAULT CURRENT_TIMESTAMP,
    managerid INTEGER,
    assigntime DATETIME,
    FOREIGN KEY(userid) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(managerid) REFERENCES manager(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE thread (
    threadid INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    text TEXT,
    image BLOB,
    ownerid INTEGER,
    FOREIGN KEY(ownerid) REFERENCES petowner(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE subcribe (
    threadid INTEGER,
    userid INTEGER,
    PRIMARY KEY(threadid, userid),
    FOREIGN KEY(threadid) REFERENCES thread(threadid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(userid) REFERENCES petowner(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE reply (
    threadid INTEGER,
    userid INTEGER,
    no INTEGER,
    image BLOB,
    text TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(threadid, userid, no),
    FOREIGN KEY(threadid) REFERENCES thread(threadid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(userid) REFERENCES petowner(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE pet (
    petid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    description TEXT,
    picture BLOB NOT NULL,
    age INTEGER,
    dob DATE,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES petowner(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE diet (
    dietid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount TEXT,
    description TEXT,
    petid INTEGER,
    FOREIGN KEY(petid) REFERENCES pet(petid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE activity (
    activityid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    petid INTEGER,
    FOREIGN KEY(petid) REFERENCES pet(petid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE petschedule (
    petscheduleid INTEGER PRIMARY KEY AUTOINCREMENT,
    startdate DATE,
    repeat_option TEXT DEFAULT 'never',
    hour INTEGER,
    minute INTEGER,
    dietid INTEGER,
    activityid INTEGER,
    FOREIGN KEY(dietid) REFERENCES diet(dietid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(activityid) REFERENCES activity(activityid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE servicetype (
    typeid INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT
  );
`);

db.exec(`
  CREATE TABLE service (
    serviceid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    description TEXT,
    duration TEXT,
    license BLOB,
    typeid INTEGER,
    providerid INTEGER,
    FOREIGN KEY(typeid) REFERENCES servicetype(typeid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(providerid) REFERENCES serviceprovider(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE timeslot (
    serviceid INTEGER,
    slot TEXT,
    PRIMARY KEY(serviceid, slot),
    FOREIGN KEY(serviceid) REFERENCES service(serviceid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE booking (
    bookid INTEGER PRIMARY KEY AUTOINCREMENT,
    poid INTEGER,
    svid INTEGER,
    slot TEXT,
    book_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    servedate DATE,
    payment_method TEXT,
    status TEXT,
    FOREIGN KEY(poid) REFERENCES petowner(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY(svid, slot) REFERENCES timeslot(serviceid, slot) ON UPDATE CASCADE ON DELETE RESTRICT
  );
`);

db.exec(`
  CREATE TABLE booking_pet (
    bookid INTEGER,
    petid INTEGER,
    PRIMARY KEY(bookid, petid),
    FOREIGN KEY(bookid) REFERENCES booking(bookid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(petid) REFERENCES pet(petid) ON UPDATE CASCADE ON DELETE RESTRICT
  );
`);

db.exec(`
  CREATE TABLE service_report (
    bookid INTEGER PRIMARY KEY,
    text TEXT,
    image BLOB,
    FOREIGN KEY(bookid) REFERENCES booking(bookid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE service_review (
    bookid INTEGER PRIMARY KEY,
    start INTEGER,
    comment TEXT,
    FOREIGN KEY(bookid) REFERENCES booking(bookid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE service_update (
    bookid INTEGER,
    no_update INTEGER,
    text TEXT,
    image BLOB,
    PRIMARY KEY(bookid, no_update),
    FOREIGN KEY(bookid) REFERENCES booking(bookid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE notification (
    notiid INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE schedule (
    scheduleid INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduled_time DATETIME,
    tittle TEXT,
    detail TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES users(userid) ON UPDATE CASCADE ON DELETE CASCADE
  );
`);

export default db;
