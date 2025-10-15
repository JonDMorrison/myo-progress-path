import { Link } from "react-router-dom";

export const FooterPublic = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:sam@montrosedental.ca" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="text-center mb-6">
            <h3 className="font-semibold text-lg mb-2">Montrose Dental Centre</h3>
            <p className="text-sm text-muted-foreground">Abbotsford, BC</p>
            <p className="text-sm text-muted-foreground">
              <a href="tel:604-853-5677" className="hover:text-foreground transition-colors">604-853-5677</a>
              {" • "}
              <a href="mailto:info@montrosedentalcentre.com" className="hover:text-foreground transition-colors">
                info@montrosedentalcentre.com
              </a>
            </p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {currentYear} Montrose Myo by Montrose Dental Centre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
