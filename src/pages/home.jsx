import HeaderHome from '../components/home/HeaderHome'
import HeroHome from '../components/home/HeroHome'
import FeatureHome from '../components/home/FeatureHome'
import PriceHome from '../components/home/PriceHome'
import StepHome from '../components/home/StepHome'
import FooterHome from '../components/home/FooterHome'
import ContactForm from '../components/home/ContactForm'

const Home = () => {
  return (
    <div>
      <HeaderHome />
      <div id="hero-home">
        <HeroHome />
      </div>
      <div id="feature-home">
        <FeatureHome />
      </div>
      <div id="step-home">
        <StepHome />
      </div>
      <div id="price-home">
        <PriceHome />
      </div>
      <div id="contact-form">
        <ContactForm />
      </div>
      <FooterHome />
    </div>
  )
}

export default Home
