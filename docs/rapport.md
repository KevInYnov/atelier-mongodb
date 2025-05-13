# Introduction

Ce compte rendu porte sur le module NoSQL.

Il nous a été demandé de réaliser les objectifs suivants :

- Installation de MongoDB en mode standalone avec activation de l’authentification
- Création d’un utilisateur admin et d’une base `testdb` avec insertion de documents
- Manipulation des données via CLI (`mongosh`) et interface graphique (MongoDB Compass)
- Déploiement d’un replica set avec 3 instances MongoDB, initialisation et vérification des rôles
- Test de la réplication : insertion sur le PRIMARY, lecture sur les SECONDARY
- Connexion à MongoDB via URI avec gestion des préférences de lecture et des modes de réplication
- Développement d’une application connectée à MongoDB (sécurisée, support des opérations CRUD)
- Tests réalisés sur standalone et replica set avec documentation des méthodes de connexion
- (Bonus) Déploiement d’une architecture sharding avec shards, config servers et mongos router
- Activation du sharding sur une base, définition d’une clé de sharding, observation de la répartition des données

# Environnement

Etant un groupe de 5 personnes, afin de pouvoir collaborer efficacement nous avons décider de créer un `GitHub` qui ce composera de 6 `Branch`, une par personnes plus la `Branch` main qui regroupera l'ensemble du travail réaliser. 

Nous avons décider d'utiliser des vitual machine `VM` afin de réaliser le projet. 
Nous avons choisi de travailler sur un système d'exploitation Parrot (une distribution Linux) pour ce projet, et ce, pour plusieurs raisons. 
Tout d'abord, étant dans une spécialisation en cybersécurité, j'apprends à utiliser les outils que je serai amené à maîtriser dans ma future vocation, et rien de mieux que la pratique pour cela. 


# Réalisation du projet

## 1 – MongoDB Standalone
## 2 – MongoDB Replica Set
Déployer au moins 3 instances MongoDB en replica set:
1. Préparation de l’environnement
1.1 Création des répertoires de données
Je Crée trois dossiers pour stocker les données de différentes instances qie je vais créer par la suite :
mkdir -p /var/lib/mongo/rs0/db0 /var/lib/mongo/rs0/db1 /var/lib/mongo/rs0/db2  
chown -R mongodb:mongodb /var/lib/mongo/rs0

Chaque instance va avoir son propre chemin de données pour éviter les conflits entre les différentes instances.

1.2 Création de fichiers de configuration
Dupliquez le fichier /etc/mongod.conf pour obtenir trois configurations :

cp /etc/mongod.conf /etc/mongod0.conf  
cp /etc/mongod.conf /etc/mongod1.conf  
cp /etc/mongod.conf /etc/mongod2.conf

voici les configuration à faire dans les fichiers de configurations :  
storage:
  dbPath: /var/lib/mongo/rs0/db<N>      # db0, db1 ou db2
net:
  bindIp: 127.0.0.1                   # accès local uniquement
  port: 2701<N>                       # 27010, 27011, 27012
replication:
  replSetName: "rs0"                  # même nom partout
processManagement:
  pidFilePath: /var/run/mongodb/rs0-<N>.pid

2. Démarrage des trois instances
2.1 Lancement manuel
Pour chaque config, lancez :

mongod --config /etc/mongod0.conf --fork --logpath /var/log/mongodb/rs0-0.log  
mongod --config /etc/mongod1.conf --fork --logpath /var/log/mongodb/rs0-1.log  
mongod --config /etc/mongod2.conf --fork --logpath /var/log/mongodb/rs0-2.log  
Chaque instance écoute alors sur son port dédié

3. Initialisation du replica set
Connectez-vous à l’instance du port 27010 :

mongosh --port 27010
Lancez :

js
Copier
Modifier
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "127.0.0.1:27010" },
    { _id: 1, host: "127.0.0.1:27011" },
    { _id: 2, host: "127.0.0.1:27012" }
  ]
})

## 3 – Intégration dans une application
##  4 – Sharding

