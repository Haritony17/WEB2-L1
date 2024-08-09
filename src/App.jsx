import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Patrimoine from './Patrimoine'; 
import Possession from './Possession'; 

function App() {
  const [formData, setFormData] = useState({
    Possesseur: '',
    libelle: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    tauxAmortissement: '',
    valeurConstante: '',
  });

  const [possessions, setPossessions] = useState([]);
  const [dateCalcul, setDateCalcul] = useState('');
  const [totalValeur, setTotalValeur] = useState(0);
  const [patrimoine, setPatrimoine] = useState(null);
  const [possesseur, setPossesseur] = useState('');

  useEffect(() => {
    fetch('./data/data.json')
      .then(response => response.json())
      .then(data => {
        const personneData = data.find(item => item.model === 'Personne').data;
        const patrimoineData = data.find(item => item.model === 'Patrimoine').data;
        setPossesseur(personneData.nom);
        setPossessions(patrimoineData.possessions.map(p => new Possession(
          p.possesseur.nom,
          p.libelle,
          p.valeur,
          new Date(p.dateDebut),
          p.dateFin ? new Date(p.dateFin) : null,
          p.tauxAmortissement,
          p.valeurConstante
        )));
        setPatrimoine(new Patrimoine(personneData.nom, patrimoineData.possessions.map(p => new Possession(
          p.possesseur.nom,
          p.libelle,
          p.valeur,
          new Date(p.dateDebut),
          p.dateFin ? new Date(p.dateFin) : null,
          p.tauxAmortissement,
          p.valeurConstante
        ))));
      })
      .catch(error => console.error('Erreur lors de la récupération des données:', error));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addPossession = (e) => {
    e.preventDefault();
    const newPossession = new Possession(
      formData.Possesseur,
      formData.libelle,
      parseFloat(formData.valeur),
      new Date(formData.dateDebut),
      formData.dateFin ? new Date(formData.dateFin) : null,
      parseFloat(formData.tauxAmortissement),
      parseFloat(formData.valeurConstante)
    );

    if (patrimoine) {
      patrimoine.addPossession(newPossession);
      setPossessions([...possessions, newPossession]);
    }

    setFormData({
      Possesseur: '',
      libelle: '',
      valeur: '',
      dateDebut: '',
      dateFin: '',
      tauxAmortissement: '',
      valeurConstante: '',
    });
  };

  const handleDateCalculChange = (e) => {
    setDateCalcul(e.target.value);
  };

  const handleCalculateTotal = () => {
    if (patrimoine && dateCalcul) {
      const date = new Date(dateCalcul);

      // Mise à jour de la date de fin des possessions
      const updatedPossessions = possessions.map(possession => {
        if (!possession.dateFin || new Date(possession.dateFin) > date) {
          return new Possession(
            possession.possesseur,
            possession.libelle,
            possession.valeur,
            possession.dateDebut,
            date,
            possession.tauxAmortissement,
            possession.valeurConstante
          );
        }
        return possession;
      });

      setPossessions(updatedPossessions);
      patrimoine.possessions = updatedPossessions;

      // Calcul du total avec la nouvelle date
      const total = patrimoine.getValeur(date);
      setTotalValeur(total);
    } else {
      console.error("Patrimoine ou dateCalcul non définis");
    }
  };

  return (
    <div className="container mt-4">
      <h1>Patrimoine</h1>
      <Form onSubmit={addPossession}>
        <Form.Group controlId="formPossesseur">
          <Form.Label>Possesseur</Form.Label>
          <Form.Control
            type="text"
            name="Possesseur"
            value={formData.Possesseur}
            onChange={handleChange}
            placeholder="Entrez le possesseur"
          />
        </Form.Group>
        <Form.Group controlId="formLibelle">
          <Form.Label>Libellé</Form.Label>
          <Form.Control
            type="text"
            name="libelle"
            value={formData.libelle}
            onChange={handleChange}
            placeholder="Entrez le libellé"
          />
        </Form.Group>
        <Form.Group controlId="formValeur">
          <Form.Label>Valeur Initiale</Form.Label>
          <Form.Control
            type="number"
            name="valeur"
            value={formData.valeur}
            onChange={handleChange}
            placeholder="Entrez la valeur initiale"
          />
        </Form.Group>
        <Form.Group controlId="formDateDebut">
          <Form.Label>Date Début</Form.Label>
          <Form.Control
            type="date"
            name="dateDebut"
            value={formData.dateDebut}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formDateFin">
          <Form.Label>Date Fin</Form.Label>
          <Form.Control
            type="date"
            name="dateFin"
            value={formData.dateFin}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formTauxAmortissement">
          <Form.Label>Amortissement (%)</Form.Label>
          <Form.Control
            type="number"
            name="tauxAmortissement"
            value={formData.tauxAmortissement}
            onChange={handleChange}
            placeholder="Entrez le taux d'amortissement"
          />
        </Form.Group>
        <Form.Group controlId="formValeurConstante">
          <Form.Label>Valeur Constante</Form.Label>
          <Form.Control
            type="number"
            name="valeurConstante"
            value={formData.valeurConstante}
            onChange={handleChange}
            placeholder="Entrez la valeur constante"
          />
        </Form.Group>
        
        <Button variant="success" type="submit" className="mt-3">
          Ajouter
        </Button>
      </Form>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Possesseur</th>
            <th>Libellé</th>
            <th>Valeur Initiale</th>
            <th>Date Début</th>
            <th>Date Fin</th>
            <th>Amortissement (%)</th>
            <th>Valeur Constante</th>
          </tr>
        </thead>
        <tbody>
          {possessions.map((possession, index) => (
            <tr key={index}>
              <td>{possesseur}</td>
              <td>{possession.libelle}</td>
              <td>{possession.valeur}</td>
              <td>{new Date(possession.dateDebut).toLocaleDateString()}</td>
              <td>{possession.dateFin ? new Date(possession.dateFin).toLocaleDateString() : '-'}</td>
              <td>{possession.tauxAmortissement}</td>
              <td>{possession.valeurConstante || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Form.Group controlId="formDateCalcul" className="mt-4">
        <Form.Label>Date de Calcul</Form.Label>
        <Form.Control
          type="date"
          value={dateCalcul}
          onChange={handleDateCalculChange}
        />
        <Button variant="primary" onClick={handleCalculateTotal} className="mt-2">
          Calculer Total
        </Button>
      </Form.Group>

      {totalValeur !== 0 && (
        <h3 className="mt-4">Valeur Totale au {new Date(dateCalcul).toLocaleDateString()}: {totalValeur.toFixed(2)} EUR</h3>
      )}
    </div>
  );
}

export default App;
