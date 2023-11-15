// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/login/login';
import Employer from './components/employer/employer';
import Pointages from './components/pointages/pointages';
import Historiques from './components/historiques/historique';
import Visiteur from './components/visiteurs/visiteur';
import HistoriqueVisiteurs from './components/historiques/historiquesVisiteurs';



const App = () => {
  return (
    <Router>
      <div className="App">
        {/* En-tête ou barre de navigation si nécessaire */}
        <Routes> {/* Utilisez le composant Routes ici */}
          <Route path="/" element={<Login />} /> {/* Utilisez "element" au lieu de "component" */}
          <Route path="/employers" element={<Employer />} /> {/* Utilisez "element" au lieu de "component" */}
          <Route path="/pointages" element={<Pointages />} /> {/* Utilisez "element" au lieu de "component" */}
          <Route path="/historiques" element={<Historiques />} /> {/* Utilisez "element" au lieu de "component" */}
          <Route path="/visiteurs" element={<Visiteur />} /> {/* Utilisez "element" au lieu de "component" */}
          <Route path="/historiques/visiteurs" element={<HistoriqueVisiteurs />} /> {/* Utilisez "element" au lieu de "component" */}
          {/* <Route path="/employee/:id" element={<EmployeeDetails />} /> Utilisez "element" au lieu de "component" */}
        </Routes>
      </div>
    </Router>
  );
};
export default App;
