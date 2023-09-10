--ejemplo de script, esta es una propuesta dados los comentarios recibidos de los profesores
--script de creación de las tablas de la base de datos

create database TTb040;

use TTb040;

create table tipos_profesional(
    id_tipo int auto_increment primary key,
    descripcion varchar(30)
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
    foreign key(id_tipoProfesional) references tipos_profesional(id_tipo) ON UPDATE CASCADE
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE
);

create table archivos(
    id_profesional int not null,
    nombreArchivo char(50) not null,
    archivo longblob not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table historial_profesionales(
    id_paciente int not null,
    id_profesional int not null,
    fechaIni date not null,
    fechaTer date,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table tipoCitas(
    id_tipoCita int auto_increment primary key,
    descripcion char(25) not null
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
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
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
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
);

create table imgUsuariosPacientes(
    id_paciente int not null,
    img blob not null,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
);

create table videos(
    id_video int auto_increment primary key,
    id_profesional int not null,
    nombreVideo varchar(50) not null,
    video blob not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table imgUsuariosProfesionales(
    id_profesional int not null,
    img blob not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
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
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE
);

create table musculos(
    id_musculos int auto_increment primary key,
    nombre_musculo char(20) not null
);

create table ejercicios(
    id_ejercicio int auto_increment primary key,
    descripcion char(100) not null,
    id_musculo int not null,
    foreign key(id_musculo) references musculos(id_musculos) ON UPDATE CASCADE ON DELETE CASCADE
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_video) references videos(id_video) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_ejercicio) references ejercicios(id_ejercicio) ON DELETE CASCADE
);


create table tipoComida(
    id_comida int auto_increment primary key,
    descripcion char(50) not null
);


create table proteinas(
    id_proteinas int auto_increment primary key,
    descripcion char(50) not null
);

create table lacteos(
    id_lacteos int auto_increment primary key,
    descripcion char(50) not null
);

create table frutas(
    id_frutas int auto_increment primary key,
    descripcion char(50) not null
);

create table verduras(
    id_verduras int auto_increment primary key,
    descripcion char(50) not null
);

create table granos(
    id_granos int auto_increment primary key,
    descripcion char(50) not null
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_comida) references tipoComida(id_comida) ON UPDATE CASCADE
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE
);

create table c_enfermedades(
    id_enfermedad int auto_increment primary key,
    descripcion char(50) not null
);

create table proximas_citas(
    id_profesional int not null,
    id_paciente int not null,
    fecha_hora datetime not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE
);

/*script pasado, considero que podemos hacer uso del que se encuentra arriba*/
/*
create table tipos_profesional(
    id_tipo int auto_increment primary key,
    descripcion varchar(30)
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
    foreign key(id_tipoProfesional) references tipos_profesional(id_tipo) ON UPDATE CASCADE
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table historial_profesionales(
    id_paciente int not null,
    id_profesional int not null,
    fechaIni date not null,
    fechaTer date,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table tipoCitas(
    id_tipoCita int auto_increment primary key,
    descripcion char(25) not null
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
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
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
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
);

create table imgUsuariosPacientes(
    id_paciente int not null,
    img blob not null,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
);

create table videos(
    id_video int auto_increment primary key,
    id_profesional int not null,
    nombreVideo varchar(50) not null,
    video blob not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table imgUsuariosProfesionales(
    id_profesional int not null,
    img blob not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
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
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE
);

create table musculos(
    id_musculos int auto_increment not null,
    nombre_musculo char(20) not null
);

create table ejercicios(
    id_ejercicio int auto_increment not null,
    descripcion char(100) not null,
    id_musculo int not null,
    foreign key(id_musculo) references musculos(id_musculos) ON UPDATE CASCADE ON DELETE CASCADE
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_video) references videos(id_video) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_ejercicio) references ejercicios(id_ejercicio) ON DELETE CASCADE
);

--creacion de la parte de menus y de alimento
create table tipoComida(
    id_comida int auto_increment primary key,
    descripcion char(50) not null
);

--tablas con los alimentos para obtener los ID y con ello definir las cantidades de los alimentos
create table proteinas(
    id_proteinas int auto_increment primary key,
    descripcion char(50) not null
);

create table lacteos(
    id_lacteos int auto_increment primary key,
    descripcion char(50) not null
);

create table frutas(
    id_frutas int auto_increment primary key,
    descripcion char(50) not null
);

create table verduras(
    id_verduras int auto_increment primary key,
    descripcion char(50) not null
);

create table granos(
    id_granos int auto_increment primary key,
    descripcion char(50) not null
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_comida) references tipoComida(id_comida) ON UPDATE CASCADE
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
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE
);

create table c_enfermedades(
    id_enfermedad int auto_increment primary key,
    descripcion char(50) not null
);

create table proximas_citas(
    id_profesional int not null,
    id_paciente int not null,
    fecha_hora datetime not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE
);
*/

/*REGISTROS DE LOS TIPOS DE COMIDAS*/

INSERT INTO tipoComida VALUES (0, "Desayuno.");
INSERT INTO tipoComida VALUES (0, "Comida.");
INSERT INTO tipoComida VALUES (0, "Cena.");
INSERT INTO tipoComida VALUES (0, "Colacion.");

/*REGISTROS DE LOS MUSCULOS*/

INSERT INTO musculos VALUES(0, "Pectorales.");
INSERT INTO musculos VALUES(0, "Dorsales.");
INSERT INTO musculos VALUES(0, "Deltoides.");
INSERT INTO musculos VALUES(0, "Trapecio.");
INSERT INTO musculos VALUES(0, "Bíceps.");
INSERT INTO musculos VALUES(0, "Cuádriceps.");
INSERT INTO musculos VALUES(0, "Isqiotibiales.");
INSERT INTO musculos VALUES(0, "Gluteos.");
INSERT INTO musculos VALUES(0, "Abdominales.");
INSERT INTO musculos VALUES(0, "Pantorrillas.");
INSERT INTO musculos VALUES(0, "Flexores de cadera.");

/*REGISTROS DE TIPOS DE CITAS*/

INSERT INTO tipocitas VALUES (0, "Presencial");
INSERT INTO tipocitas VALUES (0, "En linea");

/*REGISTROS DE TIPOS DE PROFESIONALES*/

INSERT INTO tipos_profesional VALUES (0, "Nutriologo");
INSERT INTO tipos_profesional VALUES (0, "Preparador fisico");
INSERT INTO tipos_profesional VALUES (0, "Nutriologo y preparador fisico");

/*REGISTROS DEL CATALOGO DE ENFERMEDADES*/

INSERT INTO c_enfermedades VALUES (0, "Acidemia glutárica tipo 1.");
INSERT INTO c_enfermedades VALUES (0, "Hipertensión arterial.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad coronaria.");
INSERT INTO c_enfermedades VALUES (0, "Insuficiencia cardíaca congestiva.");
INSERT INTO c_enfermedades VALUES (0, "Arritmias cardíacas.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad valvular.");
INSERT INTO c_enfermedades VALUES (0, "Asma.");
INSERT INTO c_enfermedades VALUES (0, "EPOC.");
INSERT INTO c_enfermedades VALUES (0, "Neumonía.");
INSERT INTO c_enfermedades VALUES (0, "Tuberculosis.");
INSERT INTO c_enfermedades VALUES (0, "Fibrosis pulmonar.");
INSERT INTO c_enfermedades VALUES (0, "Gastritis.");
INSERT INTO c_enfermedades VALUES (0, "Úlceras gástricas o duodenales.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad por reflujo gastroesofágico (ERGE).");
INSERT INTO c_enfermedades VALUES (0, "Colitis ulcerosa.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad celiaca.");
INSERT INTO c_enfermedades VALUES (0, "Diabetes tipo 1 y tipo 2.");
INSERT INTO c_enfermedades VALUES (0, "Síndrome metabólico.");
INSERT INTO c_enfermedades VALUES (0, "Hiperlipidemia.");
INSERT INTO c_enfermedades VALUES (0, "Hipotiroidismo.");
INSERT INTO c_enfermedades VALUES (0, "Hipertiroidismo (enfermedad de Graves).");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad de la glándula suprarrenal.");
INSERT INTO c_enfermedades VALUES (0, "Trastornos de la hormona del crecimiento.");
INSERT INTO c_enfermedades VALUES (0, "Insuficiencia renal crónica.");
INSERT INTO c_enfermedades VALUES (0, "Cálculos renales.");
INSERT INTO c_enfermedades VALUES (0, "Nefropatía diabética.");
INSERT INTO c_enfermedades VALUES (0, "Migrañas.");
INSERT INTO c_enfermedades VALUES (0, "Epilepsia.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad de Parkinson.");
INSERT INTO c_enfermedades VALUES (0, "Esclerosis múltiple.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad de Alzheimer.");
INSERT INTO c_enfermedades VALUES (0, "Influenza (gripe).");
INSERT INTO c_enfermedades VALUES (0, "VIH/SIDA.");
INSERT INTO c_enfermedades VALUES (0, "Hepatitis A, B, C.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedades de transmisión sexual (ITS).");
INSERT INTO c_enfermedades VALUES (0, "Tuberculosis.");
INSERT INTO c_enfermedades VALUES (0, "Anemia.");
INSERT INTO c_enfermedades VALUES (0, "Hemofilia.");
INSERT INTO c_enfermedades VALUES (0, "Leucemia.");
INSERT INTO c_enfermedades VALUES (0, "Trombocitopenia.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedades de la coagulación.");
INSERT INTO c_enfermedades VALUES (0, "Psoriasis.");
INSERT INTO c_enfermedades VALUES (0, "Dermatitis atópica.");
INSERT INTO c_enfermedades VALUES (0, "Acné severo.");
INSERT INTO c_enfermedades VALUES (0, "Carcinoma de piel (melanoma).");
INSERT INTO c_enfermedades VALUES (0, "Vitiligo.");
INSERT INTO c_enfermedades VALUES (0, "Depresión mayor.");
INSERT INTO c_enfermedades VALUES (0, "Trastorno de ansiedad generalizada.");
INSERT INTO c_enfermedades VALUES (0, "Trastorno bipolar.");
INSERT INTO c_enfermedades VALUES (0, "Esquizofrenia.");
INSERT INTO c_enfermedades VALUES (0, "Trastornos de la alimentación (anorexia, bulimia).");
INSERT INTO c_enfermedades VALUES (0, "Cáncer de mama.");
INSERT INTO c_enfermedades VALUES (0, "Cáncer de próstata.");
INSERT INTO c_enfermedades VALUES (0, "Cáncer de colon.");
INSERT INTO c_enfermedades VALUES (0, "Cáncer de pulmón.");
INSERT INTO c_enfermedades VALUES (0, "Cáncer de páncreas.");
INSERT INTO c_enfermedades VALUES (0, "Lupus eritematoso sistémico.");
INSERT INTO c_enfermedades VALUES (0, "Artritis reumatoide.");
INSERT INTO c_enfermedades VALUES (0, "Esclerosis sistémica.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad de Crohn.");
INSERT INTO c_enfermedades VALUES (0, "Anemia por deficiencia de hierro.");
INSERT INTO c_enfermedades VALUES (0, "Talasemia.");
INSERT INTO c_enfermedades VALUES (0, "Policitemia vera.");
INSERT INTO c_enfermedades VALUES (0, "Fibrosis quística.");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad de Huntington.");
INSERT INTO c_enfermedades VALUES (0, "Distrofia muscular.");
INSERT INTO c_enfermedades VALUES (0, "Fenilcetonuria (PKU).");
INSERT INTO c_enfermedades VALUES (0, "Enfermedad de Tay-Sachs.");