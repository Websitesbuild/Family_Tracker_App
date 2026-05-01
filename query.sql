update visited_countries
set traveller_id = 1
where country_code = 'AF'

drop table visited_countries

select * from visited_countries
order by id,traveller_id desc

create table visited_countries(
	id serial primary key,
	traveller_id int,
	country_code char(2),
	unique(traveller_id,country_code),
	foreign key (traveller_id) references users(id)
)

select name as usrName, traveller_id,country_code,color
from users
join visited_countries on users.id = traveller_id

delete 

select * from countries

SELECT pg_get_serial_sequence('users', 'id');


delete from visited_countries
where traveller_id = 4 and country_code = 'IO'

create table countries(
	id serial primary key,
	country_code char(2),
	country_name varchar(100)
)

create table users(
	id serial not null primary key,
	name varchar(50),
	color varchar(20)
)

delete from visited_countries

select * from users

insert into users(name,color)
values('Amit','teal'),('Sumit','red'),('Pooja','purple'),('Aarti','orange')

delete from users

\d users