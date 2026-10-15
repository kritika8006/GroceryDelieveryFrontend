import { footerData } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-app-green text-white/80 py-14">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">

        <div>
          <h2 className="font-serif text-xl text-white mb-4">{footerData.brand.name}</h2>
          <p className="text-sm text-white/60 mb-5 leading-relaxed">{footerData.brand.description}</p>
          <div className="flex gap-3">
            {footerData.brand.socials.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index} href={social.link} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-app-clay transition-colors"
                >
                  <Icon className="size-5 fill-white" />
                </a>
              );
            })}
          </div>
        </div>

        {footerData.sections.map((section, index) => (
          <div key={index}>
            <h3 className="font-medium text-white mb-4 text-sm">{section.title}</h3>
            <ul className="space-y-2.5 text-sm text-white/60">
              {section.links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.to || link.href || "#"} className="hover:text-app-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-medium text-white mb-4 text-sm">Contact</h3>
          <div className="space-y-3 text-sm text-white/60">
            {footerData.contact.map((item, index) => {
              const Icon = item.icon;
              const isEmail = item.text.includes("@");
              return (
                <a
                  key={index}
                  href={isEmail ? `mailto:${item.text}` : "#"}
                  className="flex items-center gap-2 hover:text-app-gold transition-colors"
                >
                  <Icon className="size-4" /> {item.text}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/10 text-xs text-white/40">
        © {new Date().getFullYear()} {footerData.brand.name}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;