--ejemplo de script, esta es una propuesta dados los comentarios recibidos de los profesores
--script de creación de las tablas de la base de datos

create database TTb040;

use TTb040;

create table tipos_profesional(
id_tipo int auto_increment primary key,
desc varchar(30)
);

create table usuarios_profesionales(
id_profesional int auto_increment primary key,
nombre char(25) not null,
apPaterno char(25) not null,
apMaterno char(25) not null,
email varchar(40) not null unique,
edad int not null,
fecha_N date not null,
password char(16) not null,
id_tipoProfesional int,
valido char(1) not null,
foreign key(id_tipoProfesional) references tipos_profesional(id_tipo)
);


create table usuarios_pacientes(
id_paciente int auto_increment primary key,
nombre char(25) not null,
apPaterno char(25) not null,
apMaterno char(25) not null,
email varchar(40) not null unique,
edad int not null,
fecha_N date not null,
numTel varchar(20) not null,
password char(16) not null,
id_profesional int not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional)
);

create table archivos(
id_profesional int not null,
archivo blob not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional)
);

create table historial_profesionales(
id_paciente int not null,
id_profesional int not null,
fechaIni date not null,
fechaTer date,
foreign key(id_paciente) references usuarios_pacientes(id_paciente),
foreign key(id_profesional) references usuarios_profesionales(id_profesional)
);

create table tipoCitas(
id_tipoCita int auto_increment primary key,
desc char(25) not null
);

create table citas(
id_tipoCita int not null,
id_profesional int not null,
id_paciente int not null,
fecha_hora datetime not null,
foreign key(id_tipoCita) references tipoCitas(id_tipoCita)
);

create table habito_personal(
id_paciente int not null,
horaD time not null,
horaS time not null,
desc_fisica char(100) not null,
rutinaDia char(100) not null,
foreign key(id_paciente) references usuarios_pacientes(id_paciente)
);

create table habito_alimenticio(
id_paciente int not null,
masConsumidos varchar(200),
alimentos_alergia varchar(200),
cantidad_agua float not null,
cantidad_comidas int not null,
cantidad_colaciones int not null,
horaDesayuno time,
horaComida time,
horaCena time,
foreign key(id_paciente) references usuarios_pacientes(id_paciente)
);

create table imgUsuariosPacientes(
id_paciente int not null,
img blob not null,
foreign key(id_paciente) references usuarios_pacientes(id_paciente)
);

create table videos(
id_video int auto_increment primary key,
id_profesional int not null,
nombreVideo varchar(50) not null,
video blob not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional)
);

create table imgUsuariosProfesionales(
id_profesional int not null,
img blob not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional)
);

create table infoMpaciente(
id_paciente int not null,
estatura float not null,
ocupacion char(50) not null,
imc float not null,
objetivo char(100) not null,
alergias char(150) not null,
medicamentosC char(150) not null,
enferm char(100) not null,
enfermFam char(100) not null,
foreign key(id_paciente) references usuarios_pacientes(id_paciente)
);

create table musculos(
id_musculos int auto_increment not null,
nombre_musculo char(20) not null
);

create table ejercicios(
id_ejercicio int auto_increment not null,
desc char(100) not null,
id_musculo int not null,
foreign key(id_musculo) references musculos(id_musculos)
);

create table ejercicio_rutina(
id_profesional int not null,
id_paciente int not null,
cantidad char(20) not null,
id_video int not null,
id_ejercicio int not null,
fechaInicio date not null,
fechaFin date not null,
vigencia char(1) not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional),
foreign key(id_paciente) references usuarios_pacientes(id_paciente),
foreign key(id_video) references videos(id_video),
foreign key(id_ejercicio) references ejercicios(id_ejercicio)
);

--creacion de la parte de menus y de alimento
create table tipoComida(
id_comida int auto_increment primary key,
desc char(50) not null
);

--tablas con los alimentos para obtener los ID y con ello definir las cantidades de los alimentos
create table proteinas(
id_proteinas int auto_increment primary key,
desc char(50) not null
);

create table lacteos(
id_lacteos int auto_increment primary key,
desc char(50) not null
);

create table frutas(
id_frutas int auto_increment primary key,
desc char(50) not null
);

create table verduras(
id_verduras int auto_increment primary key,
desc char(50) not null
);

create table granos(
id_granos int auto_increment primary key,
desc char(50) not null
);


create table alimento_dieta(
id_profesional int not null,
id_paciente int not null,
id_comida int not null,
proteinas char(100) not null,
cantidades_proteinas char(150) not null,
lacteos char(100) not null,
cantidades_lacteos char(150) not null,
frutas char(100) not null,
cantidades_frutas char(150) not null,
verduras char(100) not null,
cantidades_verduras char(150) not null,
granos char(100) not null,
cantidades_granos char(150) not null,
duracion int not null,
vigencia char(1) not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional),
foreign key(id_paciente) references usuarios_pacientes(id_paciente),
foreign key(id_comida) references tipoComida(id_comida)
);

create table mediciones(
id_profesional int not null,
id_paciente int not null,
peso float not null,
axiliar_media float not null,
abdominal float not null,
bicipital float not null,
muslo float not null, 
suprailiaco float not null,
triceps float not null,
subescapular float not null,
toracica float not null,
pantorrilla_medial float not null,
cintura float not null,
fecha date not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional),
foreign key(id_paciente) references usuarios_pacientes(id_paciente)
);

create table c_enfermedades(
id_enfermedad int auto_increment primary key,
desc char(50) not null
);

create table proximas_citas(
id_profesional int not null,
id_paciente int not null,
fecha_hora datetime not null,
foreign key(id_profesional) references usuarios_profesionales(id_profesional),
foreign key(id_paciente) references usuarios_pacientes(id_paciente)
);