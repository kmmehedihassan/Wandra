import React from 'react';
import Slider from "./Slider"
import "./homeMain.css"
import DestinationCardSlider from './DestinationCardSlider';
import TourCardSlider from "./TourCardSlider";
import Footer from "../Footer/Footer";
import {popularDestination, popularTour, tourCardData} from "../Database/data"



const Home = () => {
    return (
      <>
        <Slider />

        <section>
          <div id="body">
            <DestinationCardSlider slides={popularDestination} title="Explore Bangladesh" />

            <TourCardSlider slides={tourCardData} title="Popular Tours" />

            <Footer />
          </div>
        </section>
      </>
    );
}

export default Home;
