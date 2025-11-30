
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './views/Home.jsx';
import RechercheForm from './views/RechercheForm.jsx';
import ObeissanceForm from './views/ObeissanceForm.jsx';
import DiversForm from './views/DiversForm.jsx';
import VoirRecherche from './views/VoirRecherche.jsx';
import VoirObeissance from './views/VoirObeissance.jsx';
import VoirDivers from './views/VoirDivers.jsx';
import Liste from './views/Liste.jsx';
import Reglages from './views/Reglages.jsx';
import TirageSort from './views/TirageSort.jsx';
import Imprimer from './views/Imprimer.jsx';
import FormulairesVierges from './views/FormulairesVierges.jsx';
import FAQ from './views/FAQ.jsx';
import Welcome from './views/Welcome.jsx';
// CSS Legacy en premier (style.css copié exactement)
import './styles/forms.css';
// Puis les autres styles spécifiques
import './styles/navbar.css';
import './styles/home.css';
import './styles/footer.css';
import './styles/voir.css';
import './styles/liste.css';
import './styles/reglages.css';
import './styles/tirage.css';
import './styles/imprimer.css';
import './styles/faq.css';
import './styles/welcome.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Welcome sans Navbar/Footer */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Routes principales avec Navbar/Footer */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recherche" element={<RechercheForm />} />
              <Route path="/obeissance" element={<ObeissanceForm />} />
              <Route path="/divers" element={<DiversForm />} />
              <Route path="/voir-recherche" element={<VoirRecherche />} />
              <Route path="/voir-obeissance" element={<VoirObeissance />} />
              <Route path="/voir-divers" element={<VoirDivers />} />
              <Route path="/liste" element={<Liste />} />
              <Route path="/reglages" element={<Reglages />} />
              <Route path="/tirage" element={<TirageSort />} />
              <Route path="/imprimer" element={<Imprimer />} />
              <Route path="/formulaires-vierges" element={<FormulairesVierges />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
