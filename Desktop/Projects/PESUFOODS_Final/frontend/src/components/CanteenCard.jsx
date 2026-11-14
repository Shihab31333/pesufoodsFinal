import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function CanteenCard({ canteen, index }) { return <article className={`canteen-card card-${index}`}><img src={canteen.image} alt={canteen.name}/><div className="canteen-overlay"><span className="eyebrow">{canteen.isOpen ? 'Open now' : 'Closed'}</span><h2>{canteen.name}</h2><p>{canteen.description}</p><small><MapPin size={14}/> {canteen.location}</small><Link className="button light" to={`/canteens/${canteen._id}`}>View menu <ArrowUpRight size={16}/></Link></div></article>; }
