
import { footerData } from "../../assets/assets"; // Sahi path check karein

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo & Brand Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">{footerData.brand.name}</h2>
          <p className="text-sm text-gray-300 mb-4">{footerData.brand.description}</p>
          <div className="flex gap-3">
            {footerData.brand.socials.map((social, index) => {
              const Icon = social.icon; // Component access
              return (
                <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-blue-600 transition">
                  <Icon className="size-5 fill-white" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Dynamic Sections (Quick Links & Customer Service) */}
        {footerData.sections.map((section, index) => (
          <div key={index}>
            <h3 className="font-semibold mb-4">{section.title.toUpperCase()}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {section.links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.to || link.href || "#"} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Us Section */}
        <div>
          <h3 className="font-semibold mb-4">CONTACT US</h3>
          <div className="space-y-3 text-sm text-gray-300">
            {footerData.contact.map((item, index) => {
              const Icon = item.icon;
              const isEmail = item.text.includes("@");
              return (
                <a 
                  key={index} 
                  href={isEmail ? `mailto:${item.text}` : "#"} 
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Icon className="size-4" /> {item.text}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;