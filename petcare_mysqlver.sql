create database petcare;
use petcare;

create table user (
	userid int auto_increment,
    name varchar(100) not null,
    email varchar(100) not null unique,
    password varchar(20) not null,
    gender ENUM('Male', 'Female', 'Other'),
    role enum('Pet owner', 'Service provider', 'Manager'),
    constraint pk_user primary key (userid)
);

create table manager (
	id int,
    constraint fk_manager foreign key(id) references user(userid) on update cascade on delete cascade,
    constraint pk_manager primary key (id)
);

create table petowner (
	id int,
    phone varchar(20) unique,
    city varchar(20),
    address varchar(100),
    constraint fk_petowner foreign key(id) references user(userid) on update cascade on delete cascade,
    constraint pk_petowner primary key (id)
);


create table serviceprovider (
	id int,
    bussiness_name varchar(20),
    logo longblob,
    phone varchar(20) unique,
    description mediumtext,
    address varchar(100),
    website varchar(100),
    constraint fk_serviceprovider foreign key(id) references user(userid) on update cascade on delete cascade ,
    constraint pk_serviceprovider primary key (id)
);

create table ticket(
		ticketid int auto_increment,
        subject varchar(100),
        description longtext,
        attachment mediumblob,
        respone mediumblob,
        status enum('pending','solving','finished'),
        userid int,
        createtime datetime default now(),
        managerid int,
        assigntime datetime,
        constraint pk_ticket primary key (ticketid),
        constraint fk_ticket_user foreign key (userid) references user(userid) on update cascade on delete cascade ,
        constraint fk_ticket_manager foreign key (managerid) references manager(id) on update cascade on delete cascade 
);

create table thread (
	threadid int auto_increment,
    timestamp datetime default now(),
    text mediumtext,
    image longblob,
    ownerid int,
    constraint fk_thread foreign key(ownerid) references petowner(id) on update cascade on delete cascade,
    constraint pk_thread primary key(threadid)
);

create table subcribe(
	threadid int,
    userid int,
    constraint fk_subcribe_thread foreign key(threadid) references thread(threadid) on update cascade on delete cascade,
    constraint fk_subcribe_user foreign key(userid) references petowner(id) on update cascade on delete cascade,
    constraint pk_subcribe primary key(threadid,userid)
);

create table reply(
	threadid int,
    userid int,
    no int,
    image mediumblob,
    text mediumtext,
    timestamp datetime default now(),
    constraint fk_reply_thread foreign key(threadid) references thread(threadid) on update cascade on delete cascade,
    constraint fk_reply_user foreign key(userid) references petowner(id) on update cascade on delete cascade,
    constraint pk_reply primary key (threadid, userid, no)
);

create table pet(
	petid int auto_increment,
    name varchar(20) not null,
    breed varchar(20) not null,
    description varchar(100),
    picture mediumblob not null,
    age int,
    dob date,
    userid int,
    constraint fk_pet_user foreign key(userid) references petowner(id) on update cascade on delete cascade,
    constraint pk_pet primary key (petid)
);

create table diet (
	dietid int auto_increment,
    name varchar(20) not null,
    amount varchar(20),
    description mediumtext,
    petid int,
    constraint fk_diet_pet foreign key(petid) references pet(petid) on update cascade on delete cascade,
    constraint pk_diet primary key(dietid)
);

create table activity (
	activityid int auto_increment,
    name varchar(20) not null,
    description mediumtext,
    petid int,
    constraint fk_activity_pet foreign key(petid) references pet(petid) on update cascade on delete cascade,
    constraint pk_activity primary key(activityid)
);

create table petschedule (
	petscheduleid int auto_increment,
    startdate date,
    repeat_option enum('never','hourly','daily','weekly','biweekly','monthly','every 3 months','every 6 months','yearly') default 'never',
    hour int,
    minute int,
    dietid int,
    activityid int,
    constraint fk_diet_schedule foreign key (dietid) references diet(dietid) on update cascade on delete cascade,
	constraint fk_activity_schedule foreign key (activityid) references activity(activityid) on update cascade on delete cascade,
	constraint pk_petschedule primary key (petscheduleid)
);

create table servicetype (
	typeid int auto_increment,
    type varchar(100),
    constraint pk_servicetype primary key (typeid)
);

create table service (
	serviceid int auto_increment,
    name varchar(100),
    price int,
    description mediumtext,
    duration time,
    license mediumblob,
    typeid int,
    providerid int,
    constraint pk_service primary key (serviceid),
    constraint fk_service_type foreign key (typeid) references servicetype(typeid) on update cascade on delete cascade,
	constraint fk_service_provider foreign key (providerid) references serviceprovider(id) on update cascade on delete cascade
);

create table timeslot (
	serviceid int,
    slot time,
	constraint fk_timeslot_service foreign key (serviceid) references service(serviceid) on update cascade on delete cascade,
    constraint pk_timeslot primary key (serviceid,slot)
);

create table booking (
	bookid int auto_increment,
    poid int,
    svid int,
    slot time,
    book_timestamp datetime default now(),
    servedate date,
    payment_method varchar(20),
	status enum('approval process', 'accept', 'decline', 'payment process', 'payment sucessful', 'scheduled', 'serving', 'finished'),
	constraint fk_booking_po foreign key (poid) references petowner(id) on update cascade on delete restrict,
	constraint fk_booking_slot foreign key (svid,slot) references timeslot(serviceid, slot) on update cascade on delete restrict,
    constraint pk_book primary key (bookid)
);

create table booking_pet (
	bookid int,
    petid int,
    constraint fk_bp_bookid foreign key (bookid) references booking(bookid) on update cascade on delete cascade,
    constraint fk_bp_petid foreign key (petid) references pet(petid) on update cascade on delete restrict,
    constraint pk_bp primary key (bookid, petid)
);

create table service_report(
	bookid int, 
    text mediumtext,
    image mediumblob,
    constraint fk_report foreign key (bookid) references booking(bookid) on update cascade on delete cascade,
    constraint pk_report primary key (bookid)
);

create table service_review(
	bookid int, 
	start int,
    comment mediumtext,
    constraint fk_review foreign key (bookid) references booking(bookid) on update cascade on delete cascade,
    constraint pk_review primary key (bookid)
);

create table service_update(
	bookid int, 
    no_update int,
	text mediumtext,
    image mediumblob,
    constraint fk_update foreign key (bookid) references booking(bookid) on update cascade on delete cascade,
    constraint pk_report primary key (bookid, no_update)
);


create table notification(
	notiid int auto_increment,
    text mediumtext,
    userid int,
    constraint fk_noti foreign key (userid) references user(userid) on update cascade on delete cascade,
    constraint pk_noti primary key (notiid)
);

create table schedule(
	scheduleid int auto_increment,
    scheduled_time datetime,
    tittle mediumtext,
    detail mediumtext,
    userid int,
    constraint fk_schedule foreign key (userid) references user(userid) on update cascade on delete cascade,
	constraint pk_schedule primary key (scheduleid)
);


