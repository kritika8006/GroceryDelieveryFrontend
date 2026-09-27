import Hero from "../components/Home/Hero"
import Feature from "../components/Home/Feature"
import HomeCategories from "../components/Home/HomeCategories"
import PopularProducts from "../components/Home/PopularProducts"
import AppPromoBanner from "../components/Home/AppPromoBanner"
import NewsLetter from "../components/Home/NewsLetter"


const Home = () => {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Hero />
      <Feature />
      <HomeCategories />
      <PopularProducts />
      <AppPromoBanner/>
      <NewsLetter/>
     
    </div>
  )
}

export default Home