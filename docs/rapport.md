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

# Environnement

Etant un groupe de 5 personnes, afin de pouvoir collaborer efficacement nous avons décider de créer un `GitHub` qui ce composera de 6 `Branch`, une par personnes plus la `Branch` main qui regroupera l'ensemble du travail réaliser. 

Pour le déploiement de notre serveur de base de données MongoDB, nous avons opté pour une solution Docker, afin de garantir un environnement de développement reproductible, isolé et facile à déployer.

# Setup GitHub

Dans un premier temps nous allons créer l'arborescence demander à s'avoir :

![[1.png]]

Une fois l'arborescence créer nous le déposeront sur la **branch** `main` afin que tout le monde puisse partir de la même base pour avancé efficacement en évitant le plus possible les merges.
Pour ce faire : 
`git add .`
`git commit -m "first commit"`
`git push -u origin main`

Puis nous allons créer nôtre propre branch à partir de la branch `main` :
`git checkout -b KevinM`

Nous seront alors automatiquement rediriger sur la Branch créer, si ce n'est pas le cas : 
`git switch KevinM`

Nous avons maintenant de quoi travailler efficacement avec nôtre propre branch dédier. 

# Réalisation du projet

## 1 – MongoDB Standalone

### Installer MongoDB 

Dans un premier temps, nous devons installer MongoDB pour cela il nous faut d'abord importer la clé GPG officielle de MongoDB : 
`curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \ sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor`

Puis ajouter le dépôt MongoDB à APT : 
`echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] \ https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | \ sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list`

Mettre à jour les paquets :
`sudo apt update`

Installer MongoDB : 
`sudo apt install -y mongodb-org`

Lancer service MongoDB :
`sudo systemctl start mongod`

Vérifie que MongoDB fonctionne :
`sudo systemctl status mongod`

Tester la connexion : 
`mongosh`

![[2.png]]

Une fois la liste d'étapes terminer MogoDB est prêt à être utiliser.

### Activer l’authentification et créer un utilisateur admin

Par défaut MongoDB n'a pas l'authentification d'activé et aucun utilisateur existe, nous allons donc devoir en créer un avant de configurer l'authentification. 

Pour ce faire accéder au shell de MongoDB : 
`mongosh`

Puis utiliser l'espace logique `admin` : 
`use admin`

Puis créer l'utilisateur `admin` qui auras tout les droits `root` :
`db.createUser({user: "admin", pwd:"motdepasse", roles:[{role: "root", db:"admin"}]})`

Vous pourrez ensuite vérifier les utilisateur créer avec :
`db.getUsers()`

![[3.png]]

Une fois l'utilisateur créer il nous suffit d'activer l'authentification en modifiant le fichier conf qui ce trouve ici : `/etc/mongod.conf`

![[4.png]]

Explication : 
	- enlever le commentaire dans `security` pour activer les options de sécurité.
	- `authorization: enabled` : Active l'authentification

Puis redémarrer le service `mongod` : 
`sudo systemctl restart mongod`

Une fois le service redémarré, l'authentification sera activé, pour ce connecter à nouveau il faudra donc spécifier l'utilisateur :
`mongosh -u admin -p motdepasse --authenticationDatabase admin`

Explication : 
	- `-u admin` : précise le nom de l'utilisateur.
	- `-p motdepasse` : précise le mot de passe.
	- `--authenticationDatabase admin` : Indique la base de données où l'utilisateur a été créé.

Pour vérifié les droit de l'utilisateur créer : 
`use admin`
`db.getUser("admin")`

![[6.png]]

Vous avez donc les droit n'nécessaire et avez activé l'authentification. 

### Créer une base `testdb` avec une collection de test

Maintenant nous allons créer nôtre première base de donné que nous appelleront `testdb` avec une collection d'utilisateurs :
`use testdb`
`db.createCollection("users")`

Une fois la collection créer il nous suffit d'ajouter des données avec :
`db.users.insertOne({ name: "Diana", age: 28 })`

Pour voir les données : 
`db.users.find()`

![[7.png]]

Pour supprimé une donné :
`db.users.deleteOne({name: "Abdoul"})`

Pour modifier une donné :
`db.users.updateOne({name: "Diana"}, {$set: {age: 40}})`

![[8.png]]

## 2 – MongoDB Replica Set

Déployer au moins 3 instances MongoDB en replica set:

1. Préparation de l’environnement 1.1 Création des répertoires de données Je Crée trois dossiers pour stocker les données de différentes instances qie je vais créer par la suite : 
   mkdir -p /var/lib/mongo/rs0/db0 /var/lib/mongo/rs0/db1 /var/lib/mongo/rs0/db2  
    chown -R mongodb:mongodb /var/lib/mongo/rs0

Chaque instance va avoir son propre chemin de données pour éviter les conflits entre les différentes instances.

1.2 Création de fichiers de configuration Dupliquez le fichier /etc/mongod.conf pour obtenir trois configurations :

cp /etc/mongod.conf /etc/mongod0.conf  
cp /etc/mongod.conf /etc/mongod1.conf  
cp /etc/mongod.conf /etc/mongod2.conf

voici les configuration à faire dans les fichiers de configurations :  
storage: dbPath: /var/lib/mongo/rs0/db # db0, db1 ou db2 net: bindIp: 127.0.0.1 # accès local uniquement port: 2701 # 27010, 27011, 27012 replication: replSetName: "rs0" # même nom partout processManagement: pidFilePath: /var/run/mongodb/rs0-.pid

2. Démarrage des trois instances 2.1 Lancement manuel Pour chaque config, lancez :

mongod --config /etc/mongod0.conf --fork --logpath /var/log/mongodb/rs0-0.log  
mongod --config /etc/mongod1.conf --fork --logpath /var/log/mongodb/rs0-1.log  
mongod --config /etc/mongod2.conf --fork --logpath /var/log/mongodb/rs0-2.log  
Chaque instance écoute alors sur son port dédié

3. Initialisation du replica set Connectez-vous à l’instance du port 27010 :

mongosh --port 27010 Lancez :

rs.initiate({ _id: "rs0", members: [ { _id: 0, host: "127.0.0.1:27010" }, { _id: 1, host: "127.0.0.1:27011" }, { _id: 2, host: "127.0.0.1:27012" } ] })

4. Activation de l’authentification et création des utilisateurs 4.1 Modifier les fichiers de config pour activer l’authentification Dans les fichier de conf mongo suivant :
    
    - mongod0.conf
    - mongod1.conf
    - mongod2.conf
    
    j'ai changer le paramettre suivant : security: authorization: enabled
    

4.2 Redémarrer les instances Je redémarre les instances pour prendre en compte cette modification. je réalise la commande suivante pour voir le PID de mongodb voici la commande que j'ai faite et son résultat : root@debian:/etc# ps aux | grep mongod mongodb 39218 0.7 3.2 3716860 128896 ? Ssl 11:11 2:18 /usr/bin/mongod --config /etc/mongod.conf

Une fois cela trouver j'execute la commande suivante pour kill le processus : sudo kill 39218

Une fois le kill réaliser il faut restart mongoDB mongod --config /etc/mongod0.conf mongod --config /etc/mongod1.conf mongod --config /etc/mongod2.conf

4.3 Création de l’utilisateur admin Je me connecte à la base de données sans authentification : mongosh --port 27010

Par la suite je crée un utilisateur administrateur dans la base admin :

use admin db.createUser({ user: "admin", pwd: "mon_mdp_super_secret", roles: [ { role: "root", db: "admin" } ] })

4.4 Tester la connexion authentifiée Maintenant que l’utilisateur existe, je me connecte avec celui-ci pour voir si ce nouvelle utilisateur fonctionne :

mongosh --port 27010 -u admin -p mon_mdp_super_secret --authenticationDatabase admin

5. Création de la base testdb et insertion de documents 5.1 Connexion authentifiée Reste connecté en admin (ou reconnecte-toi) sur le port 27010.

5.2 Création de la base et insertion

use testdb

db.testcollection.insertMany([ { nom: "Alice", age: 25 }, { nom: "Bob", age: 30 } ])

6. Test de la réplication (lecture sur secondaires) 6.1 Connexion sur une instance secondaire

Exemple sur le port 27011 :

mongosh --port 27011 -u admin -p mon_mdp_super_secret --authenticationDatabase admin

6.2 Lire la collection en mode lecture secondaire Par défaut, la lecture se fait sur PRIMARY. Pour lire sur SECONDARY, il faut préciser dans la commande la préférence de lecture :

db.getMongo().setReadPref('secondary') db.testcollection.find().pretty()

7. Connexion via URI (utile pour applications) Exemple de connexion MongoDB URI avec replica set et authentification :

mongodb://admin:mon_mdp_super_secret@127.0.0.1:27010,127.0.0.1:27011,127.0.0.1:27012/testdb?replicaSet=rs0&readPreference=secondary Tu peux tester avec mongosh en ligne de commande (nécessite mongosh > 1.6) : mongosh "mongodb://admin:mon_mdp_super_secret@127.0.0.1:27010,127.0.0.1:27011,127.0.0.1:27012/testdb?replicaSet=rs0&readPreference=secondary"
## 3 – Intégration dans une application

Nous allons maintenant intégrer nôtre base de donné à une application, pour ce faire :

Créer le dossier de l'application : 
`mkdir mongo-app`

Initié l'environnement node.js :
`npm init -y`

Installé les dépendance :
`npm install mongodb dotenv`

Puis créer 2 fichiers :
	fichier : `.env`
	fichier : `index.js`

Dans le fichier `.env` écrire l'URI pour permettre la connexion à la BDD :
`MONGO_URI=mongodb://admin:adminpass@localhost:27017/testdb
`
Dans le fichier `index.js` écrire un script qui simule une application avec :
`const uri = process.env.MONGO_URI;` -> récupérer les info de connexion 
`const client = new MongoClient(uri);` -> établir la connexion
`const db = client.db("testdb");` -> indique la BDD utilisé
`const collection = db.collection("test");` indique la collection utilisé
`collection.insertOne({ name: "AppUser", age: 29 });` -> Insert des données
`collection.updateOne({ name: "AppUser" }, { $set: { age: 30 } });` -> modifie des données
`collection.deleteOne({ name: "AppUser" });` -> Supprime des données

Pour lancé l'application : 
`node index.js`

![[9.png]]

Puis vérifier dans la console mongosh.

![[10.png]]

