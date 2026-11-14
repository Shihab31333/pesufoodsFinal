import { useEffect, useState } from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CanteenCard from '../components/CanteenCard';
import FoodCard from '../components/FoodCard';
export default function Home() {
  const [canteens, setCanteens] = useState([]); const [items, setItems] = useState([]); const [q, setQ] = useState('');
  useEffect(() => { Promise.all([api.get('/canteens'), api.get('/menu')]).then(([a, b]) => { setCanteens(a.data.canteens); setItems(b.data.items); }); }, []);
  const results = q ? items.filter((item) => item.name.toLowerCase().includes(q.toLowerCase())) : [];
  return <><section className="hero"><div><span className="eyebrow"><Sparkles size={15}/> Campus food, reimagined</span><h1>Your next great<br/><em>meal is here.</em></h1><p>Fresh, fast and full of flavour. Discover the best bites across PES University.</p><div className="search"><Search size={20}/><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dosa, pizza, coffee..."/></div></div><div className="hero-orbit"><div className="hero-dish">🍛</div><span>Made fresh<br/><b>every day</b></span></div></section>{q && <section className="section"><div className="section-heading"><span className="eyebrow">Search results</span><h2>Found for you</h2></div><div className="food-grid">{results.map((item) => <FoodCard key={item._id} item={item}/>)}</div></section>}<section className="section"><div className="section-heading"><div><span className="eyebrow">Find your flavour</span><h2>Three kitchens. One campus.</h2></div><Link to="/canteens" className="link-arrow">Explore all <ArrowRight size={17}/></Link></div><div className="canteen-grid">{canteens.map((canteen, index) => <CanteenCard key={canteen._id} canteen={canteen} index={index}/>)}</div></section><section className="section strip"><span className="eyebrow">Built for busy days</span><h2>Good food should never slow you down.</h2><Link className="button" to="/canteens">Start ordering <ArrowRight size={17}/></Link></section></>;
}
