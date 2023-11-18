/*ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123';
flush privileges;*/

create database TTb040;

use TTb040;

create table tipos_profesional(
    id_tipo int auto_increment primary key,
    descripcion varchar(30)
);

create table usuarios_profesionales(
    id_profesional int auto_increment primary key,
    nombre char(25) not null,
    apPaterno char(25) ,
    apMaterno char(25) ,
    email varchar(40) not null unique,
    edad int not null,
    fecha_N date not null,
    numTel varchar(20) ,
    password char(16) not null,
    id_tipoProfesional int,
    valido char(1) not null,
    direccion char(200),
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
    extension char(5) not null,
    img blob not null,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON DELETE CASCADE
);

create table videos(
    id_video int auto_increment primary key,
    id_profesional int not null,
    nombreVideo varchar(50) not null,
    video longblob not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON DELETE CASCADE
);

create table imgUsuariosProfesionales(
    id_profesional int not null,
    extension char(5) not null,
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
	id_ER int auto_increment primary key,
	id_profesional int not null,
    id_paciente int not null,
    cantidad char(20) not null,
    id_video int default 0,
    id_ejercicio int not null,
    fechaInicio date not null,
    fechaFin date not null,
    vigencia char(1) not null,
    foreign key(id_profesional) references usuarios_profesionales(id_profesional) ON UPDATE CASCADE ON DELETE CASCADE,
    foreign key(id_paciente) references usuarios_pacientes(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE,
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

/*REGISTROS DE EJEMPLO DE EJERCICIOS CON LA LISTA DE MUSCULOS OBTENIDA*/
INSERT INTO ejercicios VALUES (0, "Press de banca", 1);
INSERT INTO ejercicios VALUES (0, "Fondos en paralelas", 1);
INSERT INTO ejercicios VALUES (0, "Aperturas con mancuernas", 1);
INSERT INTO ejercicios VALUES (0, "Dominadas", 2);
INSERT INTO ejercicios VALUES (0, "Lagartijas", 2);
INSERT INTO ejercicios VALUES (0, "Remo con barra T", 2);
INSERT INTO ejercicios VALUES (0, "Press militar", 3);
INSERT INTO ejercicios VALUES (0, "Elevaciones laterales con mancuernas", 3);
INSERT INTO ejercicios VALUES (0, "Elevaciones frontales con barra o mancuernas", 3);
INSERT INTO ejercicios VALUES (0, "Ecogimientos de hombros con barra", 4);
INSERT INTO ejercicios VALUES (0, "Encogimientos de hombros con mancuernas", 4);
INSERT INTO ejercicios VALUES (0, "Elevaciones de trapecio con polea alta", 4);
INSERT INTO ejercicios VALUES (0, "Curl de biceps con barra", 5);
INSERT INTO ejercicios VALUES (0, "Curl de biceps con mancuernas", 5);
INSERT INTO ejercicios VALUES (0, "Curl martillo", 5);
INSERT INTO ejercicios VALUES (0, "Sentadillas", 6);
INSERT INTO ejercicios VALUES (0, "Extensiones de cuadriceps en maquina", 6);
INSERT INTO ejercicios VALUES (0, "Prensa de piernas", 6);
INSERT INTO ejercicios VALUES (0, "Curl de piernas tumbado", 7);
INSERT INTO ejercicios VALUES (0, "Peso muerto", 7);
INSERT INTO ejercicios VALUES (0, "Levantamiento de cadera", 7);
INSERT INTO ejercicios VALUES (0, "Sentadillas profundas", 8);
INSERT INTO ejercicios VALUES (0, "Zancadas", 8);
INSERT INTO ejercicios VALUES (0, "Puentes de gluteos", 8);
INSERT INTO ejercicios VALUES (0, "Encogimientos abdominal", 9);
INSERT INTO ejercicios VALUES (0, "Plancha", 9);
INSERT INTO ejercicios VALUES (0, "Elevacion de piernas en suspension", 9);
INSERT INTO ejercicios VALUES (0, "Elevacion de talones de pie", 10);
INSERT INTO ejercicios VALUES (0, "Elevacion de talones sentado", 10);
INSERT INTO ejercicios VALUES (0, "Saltos de pantorrilla", 10);
INSERT INTO ejercicios VALUES (0, "Sentadillas de sumo", 11);
INSERT INTO ejercicios VALUES (0, "Patada de gluteo", 11);
INSERT INTO ejercicios VALUES (0, "Elevacion de piernas en posición prono", 11);

/*REGISTROS DE EJEMPLO DE COMIDAS, ESTOS EXTRAIDOS DEL ARCHIVO PDF DE "guia-alimentos.pdf" DE LA CARPETA "./archivos/listaAlimentoDieta/"*/
        /*FRUTAS*/
INSERT INTO frutas VALUES (0, "Agua de coco");
INSERT INTO frutas VALUES (0, "Arándano");
INSERT INTO frutas VALUES (0, "Capulín");
INSERT INTO frutas VALUES (0, "Carambolo");
INSERT INTO frutas VALUES (0, "Chabacano");
INSERT INTO frutas VALUES (0, "Chicozapote");
INSERT INTO frutas VALUES (0, "Chirimoya");
INSERT INTO frutas VALUES (0, "Ciruela");
INSERT INTO frutas VALUES (0, "Ciruela pasa deshuesada");
INSERT INTO frutas VALUES (0, "Dátil");
INSERT INTO frutas VALUES (0, "Durazno (chico)");
INSERT INTO frutas VALUES (0, "Frambuesa");
INSERT INTO frutas VALUES (0, "Fresa rebanada");
INSERT INTO frutas VALUES (0, "Fruta picada");
INSERT INTO frutas VALUES (0, "Gajos de mandarina, toronja y naranja");
INSERT INTO frutas VALUES (0, "Granada china");
INSERT INTO frutas VALUES (0, "Granada roja");
INSERT INTO frutas VALUES (0, "Guanábana");
INSERT INTO frutas VALUES (0, "Guayaba");
INSERT INTO frutas VALUES (0, "Guayaba rosa");
INSERT INTO frutas VALUES (0, "Higo");
INSERT INTO frutas VALUES (0, "Jugo de naranja, toronja o mandarina natural");
INSERT INTO frutas VALUES (0, "Kiwi");
INSERT INTO frutas VALUES (0, "Lichis");
INSERT INTO frutas VALUES (0, "Lima");
INSERT INTO frutas VALUES (0, "Limón real");
INSERT INTO frutas VALUES (0, "Mamey");
INSERT INTO frutas VALUES (0, "Mandarina (chica)");
INSERT INTO frutas VALUES (0, "Mandarina reina");
INSERT INTO frutas VALUES (0, "Mango ataulfo");
INSERT INTO frutas VALUES (0, "Mango petacón");
INSERT INTO frutas VALUES (0, "Manzana (chica)");
INSERT INTO frutas VALUES (0, "Melón picado");
INSERT INTO frutas VALUES (0, "Nanche");
INSERT INTO frutas VALUES (0, "Naranja");
INSERT INTO frutas VALUES (0, "Nectarina");
INSERT INTO frutas VALUES (0, "Níspero");
INSERT INTO frutas VALUES (0, "Papaya hawaiana");
INSERT INTO frutas VALUES (0, "Papaya picada");
INSERT INTO frutas VALUES (0, "Pasas");
INSERT INTO frutas VALUES (0, "Pera");
INSERT INTO frutas VALUES (0, "Perón");
INSERT INTO frutas VALUES (0, "Piña picada");
INSERT INTO frutas VALUES (0, "Plátano dominico");
INSERT INTO frutas VALUES (0, "Plátano macho");
INSERT INTO frutas VALUES (0, "Plátano tabasco");
INSERT INTO frutas VALUES (0, "Sandía picada");
INSERT INTO frutas VALUES (0, "Tangerina");
INSERT INTO frutas VALUES (0, "Tejocote");
INSERT INTO frutas VALUES (0, "Toronja");
INSERT INTO frutas VALUES (0, "Tuna");
INSERT INTO frutas VALUES (0, "Uva roja o verde");
INSERT INTO frutas VALUES (0, "Zapote negro");
INSERT INTO frutas VALUES (0, "Zarzamora");
        /*GRANOS-CEREALES*/        
INSERT INTO granos VALUES (0, "Amaranto tostado");
INSERT INTO granos VALUES (0, "Avena en hojuelas");
INSERT INTO granos VALUES (0, "Avena Cocida");
INSERT INTO granos VALUES (0, "Arroz blanco o integral cocido");
INSERT INTO granos VALUES (0, "Baguette");
INSERT INTO granos VALUES (0, "Barrita de granola o avena");
INSERT INTO granos VALUES (0, "Bolillo sin migajón");
INSERT INTO granos VALUES (0, "Bollo de hamburguesa");
INSERT INTO granos VALUES (0, "Camote");
INSERT INTO granos VALUES (0, "Canelones");
INSERT INTO granos VALUES (0, "Cáscara de papa sin freir");
INSERT INTO granos VALUES (0, "Cereal de caja con azúcar");
INSERT INTO granos VALUES (0, "Cereal de caja sin azúcar");
INSERT INTO granos VALUES (0, "Crepas");
INSERT INTO granos VALUES (0, "Elote cocido");
INSERT INTO granos VALUES (0, "Elote blanco desgranado");
INSERT INTO granos VALUES (0, "Galleta de animalitos");
INSERT INTO granos VALUES (0, "Galletas habaneras");
INSERT INTO granos VALUES (0, "Galleta María");
INSERT INTO granos VALUES (0, "Galleta para sopa");
INSERT INTO granos VALUES (0, "Galleta salada");
INSERT INTO granos VALUES (0, "Granola con fruta seca, baja en grasa");
INSERT INTO granos VALUES (0, "Harina de arroz");
INSERT INTO granos VALUES (0, "Harina de maíz para atole");
INSERT INTO granos VALUES (0, "Hot cake");
INSERT INTO granos VALUES (0, "Maicena de sabor");
INSERT INTO granos VALUES (0, "Maíz (blanco, cacahuazintle, palomero)");
INSERT INTO granos VALUES (0, "Masa de maíz");
INSERT INTO granos VALUES (0, "Palitos de pan");
INSERT INTO granos VALUES (0, "Palomitas naturales");
INSERT INTO granos VALUES (0, "Pan para hot dog (media noche)");
INSERT INTO granos VALUES (0, "Pan árabe");
INSERT INTO granos VALUES (0, "Pan birote");
INSERT INTO granos VALUES (0, "Pan de caja (blanco, integral, multigrano)");
INSERT INTO granos VALUES (0, "Pan molido");
INSERT INTO granos VALUES (0, "Pan tostado");
INSERT INTO granos VALUES (0, "Papa (hervida o al horno)");
INSERT INTO granos VALUES (0, "Papa cambray");
INSERT INTO granos VALUES (0, "Pasta hervida (fideo, espagueti, lasaña, etc.)");
INSERT INTO granos VALUES (0, "Peneques (sin freír)");
INSERT INTO granos VALUES (0, "Tlacoyo (sin freír)");
INSERT INTO granos VALUES (0, "Tortilla de maíz");
INSERT INTO granos VALUES (0, "Tortilla de maíz azul");
INSERT INTO granos VALUES (0, "Tortilla de harina");
INSERT INTO granos VALUES (0, "Tortilla de harina light");
INSERT INTO granos VALUES (0, "Tostada horneada");
INSERT INTO granos VALUES (0, "Salvado de maíz");
INSERT INTO granos VALUES (0, "Salvado de trigo");
INSERT INTO granos VALUES (0, "Yuca");
INSERT INTO granos VALUES (0, "Barra de granola");
INSERT INTO granos VALUES (0, "Chicharrón de harina enchilado");
INSERT INTO granos VALUES (0, "Frituras de maíz");
INSERT INTO granos VALUES (0, "Galleta con chispas de chocolate");
INSERT INTO granos VALUES (0, "Galleta de avena con pasas");
INSERT INTO granos VALUES (0, "Galleta integral con miel");
INSERT INTO granos VALUES (0, "Galleta tipo sándwich");
INSERT INTO granos VALUES (0, "Palomitas con mantequilla");
INSERT INTO granos VALUES (0, "Pan dulce (bisquet, cuernito, o concha)");
INSERT INTO granos VALUES (0, "Panqué");
INSERT INTO granos VALUES (0, "Papas fritas");
INSERT INTO granos VALUES (0, "Papas fritas reducidas en grasa");
INSERT INTO granos VALUES (0, "Puré de papa preparado");
INSERT INTO granos VALUES (0, "Roles de canela ó pasas");
INSERT INTO granos VALUES (0, "Tamal");
INSERT INTO granos VALUES (0, "Tostada");
INSERT INTO granos VALUES (0, "Totopos y nachos");
INSERT INTO granos VALUES (0, "Waffle");
        /*LACTEOS*/
INSERT INTO lacteos VALUES (0, "Leche de soya baja en grasa");
INSERT INTO lacteos VALUES (0, "Leche descremada");
INSERT INTO lacteos VALUES (0, "Leche en polvo descremada");
INSERT INTO lacteos VALUES (0, "Leche evaporada descremada");
INSERT INTO lacteos VALUES (0, "Yogurt light");
INSERT INTO lacteos VALUES (0, "Yogurt para beber bajo en grasa y azúcar");
INSERT INTO lacteos VALUES (0, "Leche en polvo");
INSERT INTO lacteos VALUES (0, "Leche entera");
INSERT INTO lacteos VALUES (0, "Leche evaporada");
INSERT INTO lacteos VALUES (0, "Leche liconsa en polvo");
INSERT INTO lacteos VALUES (0, "Leche liconsa liquida");
INSERT INTO lacteos VALUES (0, "Yogurt natural");
INSERT INTO lacteos VALUES (0, "Yogurt para beber con fruta");
INSERT INTO lacteos VALUES (0, "mozzarella");
INSERT INTO lacteos VALUES (0, "nata");
INSERT INTO lacteos VALUES (0, "natillas");
INSERT INTO lacteos VALUES (0, "queso de burgos");
INSERT INTO lacteos VALUES (0, "queso de cabrales");
INSERT INTO lacteos VALUES (0, "queso en porciones");
INSERT INTO lacteos VALUES (0, "queso manchego curado");
INSERT INTO lacteos VALUES (0, "requesón");
INSERT INTO lacteos VALUES (0, "yogur");
        /*VERDURAS*/
INSERT INTO verduras VALUES (0, "Acelga cocida");
INSERT INTO verduras VALUES (0, "Acelga cruda");
INSERT INTO verduras VALUES (0, "Alcachofa");
INSERT INTO verduras VALUES (0, "Apio cocido");
INSERT INTO verduras VALUES (0, "Apio crudo");
INSERT INTO verduras VALUES (0, "Champiñón cocido rebanado");
INSERT INTO verduras VALUES (0, "Champiñón crudo entero");
INSERT INTO verduras VALUES (0, "Chilacas");
INSERT INTO verduras VALUES (0, "Chilacayote");
INSERT INTO verduras VALUES (0, "Cilantro");
INSERT INTO verduras VALUES (0, "Col cruda");
INSERT INTO verduras VALUES (0, "Colecita de bruselas");
INSERT INTO verduras VALUES (0, "Coliflor cocida");
INSERT INTO verduras VALUES (0, "Ejotes cocidos picados");
INSERT INTO verduras VALUES (0, "Espárragos crudos");
INSERT INTO verduras VALUES (0, "Espinaca cocida");
INSERT INTO verduras VALUES (0, "Espinaca cruda");
INSERT INTO verduras VALUES (0, "Flor de calabaza cocida");
INSERT INTO verduras VALUES (0, "Flor de Maguey");
INSERT INTO verduras VALUES (0, "Huitlacoche cocido");
INSERT INTO verduras VALUES (0, "Lechuga");
INSERT INTO verduras VALUES (0, "Nabo");
INSERT INTO verduras VALUES (0, "Nopal Cocido");
INSERT INTO verduras VALUES (0, "Nopal Crudo");
INSERT INTO verduras VALUES (0, "Nopal de Cambray");
INSERT INTO verduras VALUES (0, "Papaloquelite");
INSERT INTO verduras VALUES (0, "Pepino rebanado");
INSERT INTO verduras VALUES (0, "Pimiento morrón (rojo, amarillo, verde)");
INSERT INTO verduras VALUES (0, "Rábano");
INSERT INTO verduras VALUES (0, "Pico de gallo");
INSERT INTO verduras VALUES (0, "Setas cocidas");
INSERT INTO verduras VALUES (0, "Tomate Verd");
INSERT INTO verduras VALUES (0, "Berenjena");
INSERT INTO verduras VALUES (0, "Berro cocido");
INSERT INTO verduras VALUES (0, "Berro crudo");
INSERT INTO verduras VALUES (0, "Betabel rallado");
INSERT INTO verduras VALUES (0, "Brócoli cocido");
INSERT INTO verduras VALUES (0, "Brocoli crudo");
INSERT INTO verduras VALUES (0, "Calabacita alargada ó redonda cruda");
INSERT INTO verduras VALUES (0, "Calabacita cocida");
INSERT INTO verduras VALUES (0, "Calabaza de castilla cocida");
INSERT INTO verduras VALUES (0, "Cebolla blanca rebanada cruda");
INSERT INTO verduras VALUES (0, "Cebolla cocida");
INSERT INTO verduras VALUES (0, "Cebolla de cambray");
INSERT INTO verduras VALUES (0, "Chayote cocido");
INSERT INTO verduras VALUES (0, "Chepil");
INSERT INTO verduras VALUES (0, "Chícharo");
INSERT INTO verduras VALUES (0, "Chicoria");
INSERT INTO verduras VALUES (0, "Chile de árbol");
INSERT INTO verduras VALUES (0, "Chile Habanero");
INSERT INTO verduras VALUES (0, "Chile Jalapeño");
INSERT INTO verduras VALUES (0, "Chile Poblano");
INSERT INTO verduras VALUES (0, "Germen de Alfafa");
INSERT INTO verduras VALUES (0, "Germen de lenteja");
INSERT INTO verduras VALUES (0, "Huazontle");
INSERT INTO verduras VALUES (0, "Jicama picada");
INSERT INTO verduras VALUES (0, "Jitomate bola");
INSERT INTO verduras VALUES (0, "Jitomate cereza");
INSERT INTO verduras VALUES (0, "Jugo de tomate natural");
INSERT INTO verduras VALUES (0, "Jugo de verduras");
INSERT INTO verduras VALUES (0, "Jugo de zanahoria");
INSERT INTO verduras VALUES (0, "Pepinillos");
INSERT INTO verduras VALUES (0, "Poro crudo");
INSERT INTO verduras VALUES (0, "Puré de tomate");
INSERT INTO verduras VALUES (0, "Quelite");
INSERT INTO verduras VALUES (0, "Romeritos cocidos");
INSERT INTO verduras VALUES (0, "Romeritos crudos");
INSERT INTO verduras VALUES (0, "Verdolagas");
INSERT INTO verduras VALUES (0, "Xoconostle");
INSERT INTO verduras VALUES (0, "Zanahoria miniatura");
INSERT INTO verduras VALUES (0, "Zanahoria Picada o rallada");
        /*PROTEINAS*/
INSERT INTO proteinas VALUES (0, "Abulón fresco");
INSERT INTO proteinas VALUES (0, "Acociles");
INSERT INTO proteinas VALUES (0, "Aguayón");
INSERT INTO proteinas VALUES (0, "Almeja fresca");
INSERT INTO proteinas VALUES (0, "Atún en agua");
INSERT INTO proteinas VALUES (0, "Bacalao seco");
INSERT INTO proteinas VALUES (0, "Bagre");
INSERT INTO proteinas VALUES (0, "Bistec de res");
INSERT INTO proteinas VALUES (0, "Blanco de nilo");
INSERT INTO proteinas VALUES (0, "Cabeza de pescado");
INSERT INTO proteinas VALUES (0, "Cabrito");
INSERT INTO proteinas VALUES (0, "Calamar");
INSERT INTO proteinas VALUES (0, "Camarón cocido");
INSERT INTO proteinas VALUES (0, "Camarón gigante");
INSERT INTO proteinas VALUES (0, "Camarón pacotilla");
INSERT INTO proteinas VALUES (0, "Camarón seco");
INSERT INTO proteinas VALUES (0, "Cangrejo");
INSERT INTO proteinas VALUES (0, "Carne de avestruz");
INSERT INTO proteinas VALUES (0, "Carne de jaiba");
INSERT INTO proteinas VALUES (0, "Carne de res seca");
INSERT INTO proteinas VALUES (0, "Carne molida de pollo y pavo");
INSERT INTO proteinas VALUES (0, "Cazón");
INSERT INTO proteinas VALUES (0, "Chambarete");
INSERT INTO proteinas VALUES (0, "Charales frescos");
INSERT INTO proteinas VALUES (0, "Charales secos");
INSERT INTO proteinas VALUES (0, "Clara de huevo");
INSERT INTO proteinas VALUES (0, "Cuete de res");
INSERT INTO proteinas VALUES (0, "Escalopa de res");
INSERT INTO proteinas VALUES (0, "Escamoles");
INSERT INTO proteinas VALUES (0, "Fajitas de pollo sin piel");
INSERT INTO proteinas VALUES (0, "Falda de res");
INSERT INTO proteinas VALUES (0, "Filete de guachinango");
INSERT INTO proteinas VALUES (0, "Filete de pescado, mero, mojarra, merluza");
INSERT INTO proteinas VALUES (0, "Filete de res y tampiqueña");
INSERT INTO proteinas VALUES (0, "Guachinango");
INSERT INTO proteinas VALUES (0, "Jaiba cocida entera");
INSERT INTO proteinas VALUES (0, "Jugo de almeja");
INSERT INTO proteinas VALUES (0, "Liebre");
INSERT INTO proteinas VALUES (0, "Machaca");
INSERT INTO proteinas VALUES (0, "Maciza de res");
INSERT INTO proteinas VALUES (0, "Medallón de filete de res");
INSERT INTO proteinas VALUES (0, "Mejillones");
INSERT INTO proteinas VALUES (0, "Milanesa de pollo y res");
INSERT INTO proteinas VALUES (0, "Molida de pollo");
INSERT INTO proteinas VALUES (0, "Molleja de pollo");
INSERT INTO proteinas VALUES (0, "Muslo de pollo sin piel");
INSERT INTO proteinas VALUES (0, "Pancita de res");
INSERT INTO proteinas VALUES (0, "Pargo");
INSERT INTO proteinas VALUES (0, "Pata de res");
INSERT INTO proteinas VALUES (0, "Pechuga a la plancha, asada, cocida");
INSERT INTO proteinas VALUES (0, "Pechuga de pavo");
INSERT INTO proteinas VALUES (0, "Pechuga de pollo deshuesada");
INSERT INTO proteinas VALUES (0, "Pescado en trozo");
INSERT INTO proteinas VALUES (0, "Pierna de pollo sin piel");
INSERT INTO proteinas VALUES (0, "Puntas de res");
INSERT INTO proteinas VALUES (0, "Queso cottage");
INSERT INTO proteinas VALUES (0, "Requesón");
INSERT INTO proteinas VALUES (0, "Riñones de res");
INSERT INTO proteinas VALUES (0, "Róbalo");
INSERT INTO proteinas VALUES (0, "Surimi");
INSERT INTO proteinas VALUES (0, "Tampiqueña");
INSERT INTO proteinas VALUES (0, "Venado cocido");
INSERT INTO proteinas VALUES (0, "Agujas de res");
INSERT INTO proteinas VALUES (0, "Anchoa con aceite");
INSERT INTO proteinas VALUES (0, "Arrachera");
INSERT INTO proteinas VALUES (0, "Atún en aceite");
INSERT INTO proteinas VALUES (0, "Barbacoa Maciza");
INSERT INTO proteinas VALUES (0, "Bistec de ternera");
INSERT INTO proteinas VALUES (0, "Bonito");
INSERT INTO proteinas VALUES (0, "Carne de cerdo");
INSERT INTO proteinas VALUES (0, "Carpa cocida");
INSERT INTO proteinas VALUES (0, "Cecina");
INSERT INTO proteinas VALUES (0, "Conejo");
INSERT INTO proteinas VALUES (0, "Falda de cerdo");
INSERT INTO proteinas VALUES (0, "Filete de cerdo");
INSERT INTO proteinas VALUES (0, "Filete de salmón");
INSERT INTO proteinas VALUES (0, "Guajolote de Pavo");
INSERT INTO proteinas VALUES (0, "Hígado de pollo");
INSERT INTO proteinas VALUES (0, "Hígado de res");
INSERT INTO proteinas VALUES (0, "Jamón de pavo y/o pierna");
INSERT INTO proteinas VALUES (0, "Lomo de cerdo");
INSERT INTO proteinas VALUES (0, "Maciza de res");
INSERT INTO proteinas VALUES (0, "Molida de cerdo");
INSERT INTO proteinas VALUES (0, "Molida de res (sirloin)");
INSERT INTO proteinas VALUES (0, "Ostión");
INSERT INTO proteinas VALUES (0, "Ostión en lata");
INSERT INTO proteinas VALUES (0, "Pescuezo de pollo s/piel");
INSERT INTO proteinas VALUES (0, "Pierna de cerdo");
INSERT INTO proteinas VALUES (0, "Queso de cabra");
INSERT INTO proteinas VALUES (0, "Queso fresco");
INSERT INTO proteinas VALUES (0, "Queso panela");
INSERT INTO proteinas VALUES (0, "Salmón");
INSERT INTO proteinas VALUES (0, "Trucha cocida");
INSERT INTO proteinas VALUES (0, "Bistec de bola");
INSERT INTO proteinas VALUES (0, "Carne de suadero");
INSERT INTO proteinas VALUES (0, "Chicharrón");
INSERT INTO proteinas VALUES (0, "Costillas de cerdo");
INSERT INTO proteinas VALUES (0, "Gusanos de maguey");
INSERT INTO proteinas VALUES (0, "Huevo");
INSERT INTO proteinas VALUES (0, "Longaniza");
INSERT INTO proteinas VALUES (0, "Pecho de res");
INSERT INTO proteinas VALUES (0, "Queso mozarella");
INSERT INTO proteinas VALUES (0, "Queso parmesano");
INSERT INTO proteinas VALUES (0, "Salami de pavo");
INSERT INTO proteinas VALUES (0, "Salchicha de cerdo");
INSERT INTO proteinas VALUES (0, "Salchicha de pavo");
INSERT INTO proteinas VALUES (0, "Sardina en aceite");
INSERT INTO proteinas VALUES (0, "Sardinas en Tomate");
INSERT INTO proteinas VALUES (0, "Sierra");
INSERT INTO proteinas VALUES (0, "Suadero");
INSERT INTO proteinas VALUES (0, "Alón de pollo con piel cocido");
INSERT INTO proteinas VALUES (0, "Cerdo en canal");
INSERT INTO proteinas VALUES (0, "Costilla de res");
INSERT INTO proteinas VALUES (0, "Espaldilla");
INSERT INTO proteinas VALUES (0, "Lengua de cerdo");
INSERT INTO proteinas VALUES (0, "Maciza de cerdo");
INSERT INTO proteinas VALUES (0, "Moronga");
INSERT INTO proteinas VALUES (0, "Mortadela");
INSERT INTO proteinas VALUES (0, "Nuggets de pollo");
INSERT INTO proteinas VALUES (0, "Ostión ahumado");
INSERT INTO proteinas VALUES (0, "Palitos de pescado congelados");
INSERT INTO proteinas VALUES (0, "Paloma");
INSERT INTO proteinas VALUES (0, "Pastel de pavo y puerco");
INSERT INTO proteinas VALUES (0, "Pepperoni");
INSERT INTO proteinas VALUES (0, "Pollo rostizado");
INSERT INTO proteinas VALUES (0, "Queso amarillo");
INSERT INTO proteinas VALUES (0, "Queso americano");
INSERT INTO proteinas VALUES (0, "Queso asadero");
INSERT INTO proteinas VALUES (0, "Queso blanco");
INSERT INTO proteinas VALUES (0, "Queso canasto");
INSERT INTO proteinas VALUES (0, "Queso chihuahua");
INSERT INTO proteinas VALUES (0, "Queso fundido");
INSERT INTO proteinas VALUES (0, "Queso gouda");
INSERT INTO proteinas VALUES (0, "Queso manchego");
INSERT INTO proteinas VALUES (0, "Queso Oaxaca");
INSERT INTO proteinas VALUES (0, "Retazo de pollo");
INSERT INTO proteinas VALUES (0, "Salchicha");
INSERT INTO proteinas VALUES (0, "Sesos de cerdo");
INSERT INTO proteinas VALUES (0, "Sesos de res");
INSERT INTO proteinas VALUES (0, "Tripas de res");
INSERT INTO proteinas VALUES (0, "Yema de huevo");

/*DENTRO DE ESTA TABLA DEBEMOS DE CONTENER UN REGISTRO QUE FUNCIONE COMO VALOR NULL, EL CUAL SOLO SERA PARA TENER UN VALOR QUE ASIGNAR CUANDO NO EXISTE UN VIDEO PREVIAMENTE CREADO
    CON ESTO DEBEMOS DE TENER UN REGISTRO DE PROFESIONAL DE LA SALUD QUE SEA EL DE PRUEBA O BASE*/
INSERT INTO usuarios_profesionales VALUES (0, 'admin', '', '', 'app2bfit@gmail.com', 23, '2023-1-1', '', 'adminRoot_', 1, 1, '');
ALTER TABLE usuarios_profesionales MODIFY COLUMN apPaterno char(25) not null;
ALTER TABLE usuarios_profesionales MODIFY COLUMN apMaterno char(25) not null;
ALTER TABLE usuarios_profesionales MODIFY COLUMN numTel varchar(20) not null;
UPDATE usuarios_profesionales set id_profesional = 0 where id_profesional = 1;
ALTER TABLE usuarios_profesionales AUTO_INCREMENT = 1;
INSERT INTO videos VALUES (0, 0, "Sin video", "");
UPDATE videos set id_video = 0 where id_video = 1;
ALTER TABLE videos AUTO_INCREMENT = 1;