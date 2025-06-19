const { MongoClient } = require("mongodb");
require("dotenv").config();

async function main() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connecté à MongoDB");

    const db = client.db("testdb");
    const collection = db.collection("test");

    // 🔄 Insertion
    await collection.insertOne({ name: "AppUser", age: 29 });
    console.log("➕ Document inséré.");

    // 🔍 Requête : récupérer tous les documents avec nom + âge
    const docs = await collection.find({}, { projection: { _id: 0, name: 1, age: 1 } }).toArray();

    console.log("📄 Liste des utilisateurs dans la collection 'test' :");
    docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Nom : ${doc.name}, Âge : ${doc.age}`);
    });

    // 🔁 Update
    await collection.updateOne({ name: "AppUser" }, { $set: { age: 30 } });
    console.log("🔄 Document mis à jour (AppUser âge -> 30).");

    // ❌ Suppression
    await collection.deleteOne({ name: "AppUser" });
    console.log("🗑️ Document supprimé (AppUser).");

  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    await client.close();
    console.log("🔌 Déconnecté");
  }
}

main();
