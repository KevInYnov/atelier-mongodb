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

Maintenant nous allons créer nôtre première base de donné que nous appelleront `testdb`.



## 2 – MongoDB Replica Set
## 3 – Intégration dans une application
##  4 – Sharding

