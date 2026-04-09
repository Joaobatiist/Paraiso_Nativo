import React from 'react';
import './home.css';
import Hero from './Hero/Hero';
import Acomodacoes from './Acomodacoes/Acomodacoes';
import Essencia from './Essencia/Essencia';
import FloatingBook from './FloatingBook/FloatingBook';
import Footer from './footer/footer';

const Home = () => (
  <main className="home-page">
    <Hero />
    <Acomodacoes />
    <Essencia />
    <FloatingBook />
    <Footer />
  </main>
);

export default Home;
