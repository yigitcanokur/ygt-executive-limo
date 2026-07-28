import Image from "next/image";

const phoneDisplay = "(201) 897-1912";
const phoneHref = "+12018971912";
const whatsapp = "12018971912";

const fleet = [
  {
    name: "Luxury Sedan",
    detail: "Mercedes-Benz S-Class or equivalent",
    icon: "◇",
  },
  {
    name: "Luxury SUV",
    detail: "Cadillac Escalade ESV, Chevrolet Suburban or equivalent",
    icon: "◆",
  },
  {
    name: "Executive Van",
    detail: "Mercedes-Benz Executive Sprinter",
    icon: "▣",
  },
  {
    name: "Passenger Van",
    detail: "Mercedes-Benz Sprinter or Ford Transit",
    icon: "▤",
  },
];

const services = [
  ["Airport Transfers", "MIA, FLL and private aviation"],
  ["Cruise Port Transfers", "PortMiami and Port Everglades"],
  ["Hourly Chauffeur", "Flexible service for business or leisure"],
  ["Corporate Transportation", "Professional travel for executives and teams"],
  ["Special Events", "Weddings, nightlife, galas and sporting events"],
  ["Roadshows", "Coordinated multi-stop executive transportation"],
];

export default function Home() {
  return (
    <main>
      <header className="siteHeader">
        <a className="brand" href="#home" aria-label="YGT Executive Limo home">
          <Image src="/images/logo.png" width={170} height={170} alt="YGT Executive Limo logo" priority />
        </a>
        <nav>
          <a href="#services">Services</a>
          <a href="#fleet">Fleet</a>
          <a href="#airports">Airports & Ports</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="goldButton compact" href="#booking">Book Now</a>
      </header>

      <section className="hero" id="home">
        <div className="heroImage" aria-hidden="true" />
        <div className="heroShade" />
        <div className="heroContent">
          <p className="eyebrow">Miami&apos;s Premier Chauffeur Service</p>
          <h1>Luxury transportation, delivered with discretion.</h1>
          <p className="heroCopy">
            Professional chauffeur service across Miami, Fort Lauderdale and South Florida.
          </p>
          <div className="heroActions">
            <a className="goldButton" href="#booking">Reserve Your Ride</a>
            <a className="outlineButton" href={`tel:${phoneHref}`}>Call {phoneDisplay}</a>
            <a className="outlineButton" href={`https://wa.me/${whatsapp}`} target="_blank">WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="bookingShell" id="booking">
        <div className="bookingIntro">
          <span>Book your ride</span>
          <small>Fast. Easy. Reliable.</small>
        </div>
        <form className="bookingGrid" action="mailto:yigitcanflorida@gmail.com" method="post" encType="text/plain">
          <label>Pick-up location<input name="pickup" placeholder="Enter pick-up location" required /></label>
          <label>Drop-off location<input name="dropoff" placeholder="Enter drop-off location" required /></label>
          <label>Date<input name="date" type="date" required /></label>
          <label>Time<input name="time" type="time" required /></label>
          <label>Vehicle category
            <select name="vehicle" defaultValue="">
              <option value="" disabled>Select vehicle</option>
              {fleet.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label>Passengers<input name="passengers" type="number" min="1" defaultValue="1" /></label>
          <button className="goldButton formButton" type="submit">Continue Booking</button>
        </form>
        <p className="bookingNote">
          This first version sends the trip details to YGT Executive Limo for manual confirmation.
          Instant pricing and card payment will be connected in the next phase, then replaced by Limo Anywhere.
        </p>
      </section>

      <section className="trustStrip">
        {[
          ["Professional chauffeurs", "Licensed, discreet and service-focused"],
          ["Punctual & reliable", "Flight-aware scheduling and clear communication"],
          ["Luxury & comfort", "Premium vehicles for every occasion"],
          ["24/7 support", "Direct assistance before and during your trip"],
        ].map(([title, text]) => (
          <div key={title}><strong>{title}</strong><span>{text}</span></div>
        ))}
      </section>

      <section className="section" id="fleet">
        <div className="sectionHeading">
          <p className="eyebrow">Our Fleet</p>
          <h2>A premium category for every journey</h2>
          <p>Vehicle models may vary by availability. An equivalent or higher-class vehicle may be provided.</p>
        </div>
        <div className="fleetGrid">
          {fleet.map((item) => (
            <article className="fleetCard" key={item.name}>
              <div className="fleetIcon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
              <a href="#booking">Reserve this category →</a>
            </article>
          ))}
        </div>
      </section>

      <section className="splitSection" id="services">
        <div className="splitImage">
          <Image src="/images/sprinter-airport.jpeg" fill sizes="(max-width: 900px) 100vw, 50vw" alt="Luxury SUV and Sprinter at a private aviation terminal" />
        </div>
        <div className="splitContent">
          <p className="eyebrow">Services</p>
          <h2>From airport arrival to final destination.</h2>
          <div className="serviceList">
            {services.map(([title, text]) => (
              <div key={title}><h3>{title}</h3><p>{text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="airports">
        <div className="sectionHeading">
          <p className="eyebrow">Airports & Ports</p>
          <h2>South Florida transportation, coordinated professionally</h2>
        </div>
        <div className="destinationGrid">
          {[
            ["Miami International Airport", "MIA"],
            ["Fort Lauderdale-Hollywood International Airport", "FLL"],
            ["PortMiami", "Cruise"],
            ["Port Everglades", "Cruise"],
          ].map(([name, tag]) => (
            <article key={name}><span>{tag}</span><h3>{name}</h3><p>Private, direct and carefully coordinated service.</p></article>
          ))}
        </div>
      </section>

      <section className="aboutSection" id="about">
        <div>
          <p className="eyebrow">About YGT</p>
          <h2>Personal attention. Professional standards.</h2>
        </div>
        <p>
          YGT Executive Limo provides luxury chauffeur service for airport transfers, corporate travel,
          cruise ports, hourly bookings and special events throughout South Florida. Through a trusted
          affiliate network, additional premium vehicle categories can be arranged for individuals,
          families, executives and groups.
        </p>
      </section>

      <section className="ctaSection" id="contact">
        <p className="eyebrow">Ready when you are</p>
        <h2>Reserve your next ride with YGT Executive Limo.</h2>
        <div className="heroActions center">
          <a className="goldButton" href="#booking">Book Now</a>
          <a className="outlineButton" href={`tel:${phoneHref}`}>{phoneDisplay}</a>
          <a className="outlineButton" href={`https://instagram.com/ygtlimo`} target="_blank">@ygtlimo</a>
        </div>
      </section>

      <footer>
        <div className="footerBrand">
          <Image src="/images/logo.png" width={120} height={120} alt="" />
          <p>Luxury chauffeur service in Miami and throughout South Florida.</p>
        </div>
        <div>
          <strong>Contact</strong>
          <a href={`tel:${phoneHref}`}>{phoneDisplay}</a>
          <a href="mailto:yigitcanflorida@gmail.com">yigitcanflorida@gmail.com</a>
          <a href={`https://wa.me/${whatsapp}`}>WhatsApp</a>
        </div>
        <div>
          <strong>Service Areas</strong>
          <span>Miami · Miami Beach · Brickell</span>
          <span>Aventura · Fort Lauderdale</span>
          <span>Boca Raton · West Palm Beach</span>
        </div>
        <small>© 2026 YGT Executive Limo LLC. All rights reserved.</small>
      </footer>
    </main>
  );
}
