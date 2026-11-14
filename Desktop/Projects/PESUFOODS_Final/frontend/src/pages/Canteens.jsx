import { useEffect, useState } from 'react';
import api from '../services/api';
import CanteenCard from '../components/CanteenCard';
export default function Canteens() { const [canteens, setCanteens] = useState([]); useEffect(() => { api.get('/canteens').then(({ data }) => setCanteens(data.canteens)); }, []); return <main className="page"><span className="eyebrow">Our kitchens</span><h1>Choose your canteen.</h1><p className="lead">Every corner of campus has a flavour worth discovering.</p><div className="canteen-grid">{canteens.map((canteen, index) => <CanteenCard key={canteen._id} canteen={canteen} index={index}/>)}</div></main>; }
