const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');
//const jwt = require('jsonwebtoken');
//const { verify } = require('crypto');



const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'pointage'
});

connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données : ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

const app = express();
const PORT = 5000;

const jwt = require('jsonwebtoken');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

app.use(session({
  secret: 'votre_clé_secrète',
  resave: false,
  saveUninitialized: true
}));

// Route de connexion
app.post('/login', (req, res) => {
  const { username } = req.body;
  const logMessage = `${username} s'est connecté à ${new Date()}\n`;

  // Enregistrez le message de connexion dans un fichier log
  fs.appendFile('login.log', logMessage, (err) => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement du fichier log :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du fichier log.' });
    }

    console.log('Fichier log mis à jour avec succès.');
    res.json({ message: 'Authentification réussie' });
  });
});

// Vérification de l'état d'authentification
app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/pointages', (req, res) => {
  connection.query('SELECT * FROM employer', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.post('/ajouter-pointage', (req, res) => {
  const { matricule, nom, prenom, fonction } = req.body;

  // Vérifier si le matricule est unique
  connection.query('SELECT * FROM employer WHERE matricule = ?', [matricule], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la vérification du matricule' });
    } else if (results.length > 0) {
      res.status(400).json({ error: 'Le matricule est déjà utilisé' });
    } else {
      // Le matricule est unique, procédez à l'insertion
      const insertionQuery = 'INSERT INTO employer (matricule, nom, prenom, fonction) VALUES (?, ?, ?, ?)';
      connection.query(insertionQuery, [matricule, nom, prenom, fonction], (insertionError, insertionResults) => {
        if (insertionError) {
          console.error(insertionError);
          res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'employé' });
        } else {
          res.json({ message: 'Employé ajouté avec succès' });
        }
      });
    }
  });
});


app.put('/modifier-employe/:id', (req, res) => {
  const employeId = req.params.id;
  const { matricule, nom, prenom, fonction } = req.body;

  connection.query('UPDATE employer SET matricule = ?, nom = ?, prenom = ?, fonction = ? WHERE id = ?', 
    [matricule, nom, prenom, fonction, employeId], 
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la modification de l\'employé' });
      } else {
        res.json({ message: 'Employé modifié avec succès' });
      }
    });
});

app.delete('/supprimer-employe/:id', (req, res) => {
  const employeId = req.params.id;
  connection.query('DELETE FROM employer WHERE id = ?', [employeId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
    } else {
      res.json({ message: 'Employé supprimé avec succès' });
    }
  });
});

app.post('/pointage-entree/:id', (req, res) => {
  const { id } = req.params;
  const heureEntree = new Date();
  const type = 'entrée'; // Spécifiez le type "entrée" ici

  connection.query('INSERT INTO historique_pointages (employe_id, heure, type) VALUES (?, ?, ?)', [id, heureEntree, type], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement du pointage d\'entrée' });
    } else {
      res.json({ message: 'Pointage d\'entrée enregistré avec succès' });
    }
  });
});

app.post('/pointage-sortie/:id', (req, res) => {
  const { id } = req.params;
  const heureSortie = new Date();
  const type = 'sortie'; // Spécifiez le type "sortie" ici

  connection.query('INSERT INTO historique_pointages (employe_id, heure, type) VALUES (?, ?, ?)', [id, heureSortie, type], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement du pointage de sortie' });
    } else {
      res.json({ message: 'Pointage de sortie enregistré avec succès' });
    }
  });
});


app.get('/historique', (req, res) => {
  const type = req.query.type; // Récupère le type (entrée, sortie ou all) depuis la requête

  // Vérifie si le type est spécifié et valide
  let query = `
    SELECT hp.id, e.matricule, e.nom, e.prenom, hp.heure, hp.type
    FROM historique_pointages hp
    INNER JOIN employer e ON hp.employe_id = e.id
  `;

  if (type === 'entrée' || type === 'sortie') {
    query += 'WHERE hp.type = ?';
  }

  connection.query(query, [type], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique des pointages' });
    } else {
      res.json(results);
    }
  });
});




// const plainPassword = 'admin'; // Remplacez ceci par le mot de passe que vous souhaitez hashé

// bcrypt.hash(plainPassword, 10, (err, hash) => {
//   if (err) {
//     console.error('Erreur lors du hachage du mot de passe :', err);
//   } else {
//     console.log('Mot de passe hashé :', hash);
//     // Maintenant, vous pouvez enregistrer le mot de passe hashé dans votre base de données
//   }
// });

app.post('/enregistrer-visiteur', (req, res) => {
  const { nom, prenom, cin, employeId } = req.body;
  const heureEntree = new Date();

  // Enregistrez les informations du visiteur dans la table `visiteurs`
  connection.query('INSERT INTO visiteurs (nom, prenom, cin) VALUES (?, ?, ?)', [nom, prenom, cin], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement du visiteur' });
    } else {
      const visiteurId = results.insertId;

      // Enregistrez le pointage d'entrée du visiteur dans la table `historique_visiteurs`
      connection.query('INSERT INTO historique_visiteurs (visiteur_id, employe_id, heure_entree) VALUES (?, ?, ?)', [visiteurId, employeId, heureEntree], (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de l\'enregistrement du pointage d\'entrée du visiteur' });
        } else {
          res.json({ message: 'Visiteur enregistré avec succès et pointage d\'entrée effectué' });
        }
      });
    }
  });
});



app.post('/enregistrer-sortie-visiteur/:visiteurId/:employeId', (req, res) => {
  const { visiteurId, employeId } = req.params;
  const heureSortie = new Date();

  // Vérifier si le visiteur a déjà un pointage de sortie enregistré
  connection.query('SELECT * FROM historique_visiteurs WHERE visiteur_id = ? AND employe_id = ? AND heure_sortie IS NULL', [visiteurId, employeId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la vérification du pointage de sortie du visiteur' });
    } else if (results.length === 0) {
      res.status(400).json({ error: 'Le visiteur n\'a pas de pointage d\'entrée enregistré ou le pointage de sortie a déjà été effectué' });
    } else {
      // Enregistrez le pointage de sortie du visiteur
      connection.query('UPDATE historique_visiteurs SET heure_sortie = ? WHERE visiteur_id = ? AND employe_id = ?', [heureSortie, visiteurId, employeId], (error, updateResults) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de l\'enregistrement du pointage de sortie du visiteur' });
        } else {
          res.json({ message: 'Pointage de sortie du visiteur enregistré avec succès' });
        }
      });
    }
  });
});

app.get('/historique-visiteurs', (req, res) => {
  connection.query('SELECT e.nom AS nom_employe, e.prenom AS prenom_employe, v.nom AS nom_visiteur, v.prenom AS prenom_visiteur, hp.heure_entree, hp.heure_sortie, hp.id, hp.visiteur_id, hp.employe_id FROM historique_visiteurs hp JOIN employer e ON hp.employe_id = e.id JOIN visiteurs v ON hp.visiteur_id = v.id', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique des visiteurs' });
    } else {
      res.json(results);
    }
  });
});



app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
