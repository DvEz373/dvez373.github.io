// All site content lives here. Edit this file to update the website.
window.PROFILE = {
  name: "Devin Ezekiel Purba",
  title: "Electrical Engineer · Energy & AI",
  role: "Power System Engineer at Lean Power Solutions Indonesia",
  tagline: "Renewable energy · Power systems · AI & intelligent control",
  location: "Jakarta, Indonesia",
  email: "ezekiel.devin@gmail.com",
  phone: "+62 812 9161 5474",
  portrait: "assets/img/portrait",       // .webp + .jpg
  photos: { graduation: "assets/img/graduation", graduationWide: "assets/img/graduation-wide" },
  links: {
    linkedin: "https://www.linkedin.com/in/devin-ezekiel/",
    github: "https://github.com/dvnezkl",
    instagram: "https://www.instagram.com/dvn.ezekiel/",
  },
  cv: "cv.pdf",

  // Stats with "count" are computed from the lists below, so they stay correct when you add entries.
  stats: [
    { value: 3.84, decimals: 2, label: "GPA, Cum Laude" },
    { count: "experience", label: "Roles & internships" },
    { count: "projects", label: "Projects" },
    { count: "certs", label: "Certifications" },
  ],

  // Areas shown as chips on the home page
  focus: ["Renewable energy", "Distributed energy resources", "Power system dynamics", "Power electronics", "AI · ML · DL · RL", "Intelligent control", "Digital twin", "Automation & digitalization"],

  doors: [
    { href: "experience.html", title: "Experience", line: "Jobs, internships and campus roles", icon: "timeline" },
    { href: "education.html", title: "Education", line: "Degree, exchange and courses", icon: "cap" },
    { href: "projects.html", title: "Projects", line: "Energy, AI and IoT builds", icon: "grid" },
    { href: "skills.html", title: "Skills", line: "Energy systems, AI, control", icon: "bolt" },
    { href: "about.html", title: "About", line: "Who I am and how to reach me", icon: "user" },
  ],

  bio: [
    "I'm an electrical engineer working where energy systems meet intelligent software. My background is in control systems, automation and digitalization: I studied Control Systems and Automation at Universitas Indonesia and wrote my thesis on multi-agent reinforcement learning in a digital twin of industrial IoT edge networks.",
    "Today I work on renewable energy and power systems: power system dynamics, power electronics, distributed energy resources, and the controllers that keep generators, batteries and solar plants stable on the grid.",
    "I'm an AI and digital transformation enthusiast, and I'm most interested in applying AI, machine learning, deep learning and reinforcement learning to intelligent control of energy systems.",
  ],

  experience: [
    {
      type: "work", role: "Power System Engineer", org: "Lean Power Solutions Indonesia", place: "Jakarta",
      start: "Sep 2025", end: "Present",
      summary: "Dynamic modelling and control of conventional and renewable power plants.",
      points: [
        "Synchronous generator (CCGT) and synchronous condenser models with OEL, UEL, SCL, V/Hz limiter, PSS, governors, and P/Q controllers, RTU and PPC.",
        "User-defined PPC for multi-unit hybrid PV and BESS plants with grid-following control, in RMS and EMT.",
        "RMS and EMT models for gas engine, CCGT, gas turbine, steam turbine and DFIG pumped-storage plants; OLTC models for two-winding transformers.",
        "Dynamic model acceptance studies against TSO grid connection requirements; load flow, short circuit and capability curve studies.",
        "Impedance-scanning GUI for PSCAD, Python automation, and an AI-based fault locator.",
      ],
      tags: ["PSS/E", "PSCAD/EMTDC", "MATLAB/Simulink", "Fortran", "Python"],
    },
    {
      type: "campus", role: "Community and Development Staff", org: "Karya Salemba Empat UI", place: "Depok",
      start: "Sep 2023", end: "Sep 2025",
      summary: "Sustainability programmes and technical mentoring.",
      points: [
        "Led 3+ environmental SDG initiatives with 50+ participants.",
        "Managed IoT- and AI-based recycling programmes.",
        "Mentored 5+ teams in the Technology for Indonesia programme.",
      ],
      tags: ["Leadership", "Mentoring"],
    },
    {
      type: "campus", role: "Laboratory Assistant", org: "Control Laboratory, Electrical Engineering UI", place: "Depok",
      start: "Jan 2024", end: "Jul 2025",
      summary: "Taught and supported control engineering labs.",
      points: [
        "Technical guidance for 150+ students in control engineering labs.",
        "Standardized lab protocols, achieving 100% on-time sessions.",
        "MATLAB training for 40+ students.",
      ],
      tags: ["MATLAB", "Control systems", "Teaching"],
    },
    {
      type: "work", role: "Expert Project Assistant", org: "UP2M DTE FTUI", place: "Depok",
      start: "Oct 2024", end: "Dec 2024",
      summary: "ML optimisation for ore smelting.",
      points: [
        "ML-based optimisation model for an Indonesian mining company: +18% efficiency in Rotary Kiln and Electric Furnace operations.",
        "Analysed 100+ process variables for a real-time decision-support framework.",
      ],
      tags: ["TensorFlow", "scikit-learn", "Pandas"],
    },
    {
      type: "internship", role: "Research Intern, Taiwan Experience Education Program", org: "National Taiwan University of Science and Technology", place: "Taipei",
      start: "Jun 2024", end: "Aug 2024",
      summary: "Energy saving for 5G Open RAN.",
      points: [
        "Energy-saving algorithms for 5G Open RAN, 15% power reduction in simulation and lab tests.",
        "Python and C++ on srsRAN and OSC SMO with Docker, Kubernetes and ClearML.",
      ],
      tags: ["Python", "C++", "Kubernetes", "5G"],
    },
    {
      type: "internship", role: "Network Planning Engineer Intern", org: "PLN ICON+", place: "Jakarta",
      start: "Jan 2024", end: "Apr 2024",
      summary: "Telecom planning for power distribution networks.",
      points: [
        "Compared 5+ radio PoC products; designed transmission layouts for distribution networks.",
      ],
      tags: ["Telecom", "Google Earth"],
    },
    {
      type: "campus", role: "Training and Development Staff", org: "EXERCISE FTUI", place: "Depok",
      start: "Jan 2023", end: "Jan 2024",
      summary: "Software and hardware training for students.",
      points: ["Organized MATLAB, Proteus and DigSilent training for 100+ students."],
      tags: ["Training"],
    },
  ],

  projects: [
    {
      id: "marl", cat: "ai", title: "Multi-Agent RL for Edge Computing",
      context: "Bachelor thesis · 2024–2025",
      blurb: "Deep RL task offloading for digital-twin I-IoT edge networks.",
      problem: "Edge servers in industrial IoT get overloaded when tasks are offloaded without coordination.",
      approach: "Formulated offloading as a Markov Decision Process and trained multi-agent deep RL agents in a Python simulation of the edge network.",
      result: "Adaptive offloading policy that balances computational load under changing network conditions.",
      tags: ["Reinforcement learning", "Digital twin", "TensorFlow", "PyTorch"],
      figures: 2,
    },
    {
      id: "sono", cat: "iot", title: "SonoDirect",
      context: "Capstone project · 2024",
      blurb: "AI-powered IoT room sound optimisation for small businesses.",
      problem: "Small venues tune speakers by ear, which gives uneven sound.",
      approach: "ESP32 with MEMS microphones streams room data; ML predicts speaker placement; Flutter web dashboard for control.",
      result: "+19% acoustic accuracy, −12% distortion, −23% setup time.",
      tags: ["ESP32", "Flutter", "scikit-learn"],
      link: "https://github.com/dvnezkl/sonodirect-web-flutter",
      figures: 3,
    },
    {
      id: "scanocr", cat: "ai", title: "SCANOCR",
      context: "Lab assistant selection · 2023",
      blurb: "Real-time document scanner with computer vision and OCR.",
      problem: "Manual data entry from paper documents is slow and error-prone.",
      approach: "PyQt5 desktop app using OpenCV for page detection and Tesseract for text recognition.",
      result: "90%+ recognition accuracy, −25% data-entry errors.",
      tags: ["OpenCV", "Tesseract", "PyQt5"],
      link: "https://github.com/alexandermaxim8/SCANOCR",
      figures: 2,
    },
    {
      id: "ppc", cat: "energy", title: "Hybrid PV-BESS Plant Controller",
      context: "Work sample · placeholder",
      blurb: "Grid-following PPC for multi-unit PV and battery plants.",
      problem: "Hybrid plants must meet grid code P/Q and voltage requirements as one unit.",
      approach: "User-defined PPC in PSS/E (RMS) and PSCAD (EMT) coordinating multiple PV and BESS units.",
      result: "Placeholder: replace with a non-confidential summary or remove.",
      tags: ["PSS/E", "PSCAD", "Fortran"],
      figures: 1,
    },
  ],

  skillGroups: [
    { name: "Renewable energy & power systems", items: [["Power system dynamics (RMS/EMT)", 90], ["Renewables, BESS & DER integration", 80], ["Power electronics", 70], ["Power plant control & grid codes", 80]] },
    { name: "AI & intelligent control", items: [["Machine & deep learning", 80], ["Reinforcement learning", 80], ["Intelligent & optimal control", 75], ["Digital twin", 70]] },
    { name: "Automation & digitalization", items: [["Control systems", 90], ["IoT & embedded (ESP32)", 70], ["Process automation (Python)", 85], ["Data analysis", 80]] },
    { name: "Tools & languages", items: [["Python", 90], ["MATLAB/Simulink", 85], ["PSS/E · PSCAD/EMTDC", 90], ["C/C++ · Fortran", 70]] },
  ],

  certs: [
    ["TensorFlow Developer Professional Certificate", "DeepLearning.AI", "2024", "https://coursera.org/share/0303786ebfb376c8c67fc7f9c3af14a4"],
    ["Reinforcement Learning Specialization", "University of Alberta", "2024", "https://coursera.org/share/5360f415cf7616da410084059e3bb31a"],
    ["Google IT Automation with Python", "Google", "2024", "https://coursera.org/share/41aaa60812a27a23cd6b35c4d035a933"],
    ["IBM AI Engineering", "IBM", "2023", "https://coursera.org/share/2cec23adffb2c7041f9b84fe34e226d6"],
    ["IBM Data Science", "IBM", "2023", "https://coursera.org/share/b23a8d7904b01ee98299b31c0db18b9f"],
    ["IBM Machine Learning", "IBM", "2023", "https://coursera.org/share/5a3fe4887b6105e8cae81dfeb1067ee5"],
    ["Deep Learning Specialization", "DeepLearning.AI", "2023", "https://coursera.org/share/483a4f1431dacdf4c2c279b29fde1627"],
  ],

  // Education timeline, newest end date first. kind: degree | exchange | courses. Optional photo: path without extension.
  education: [
    {
      kind: "degree", title: "B.Eng. Electrical Engineering", place: "Universitas Indonesia · Depok",
      start: "Aug 2021", end: "Jul 2025",
      summary: "Control Systems and Automation · GPA 3.84 / 4.00 · Cum Laude",
      photo: "assets/img/graduation", photoAlt: "Devin in graduation gown beside the #UI Graduation sign at Universitas Indonesia",
      points: ["Thesis: computation utility optimization with multi-agent deep reinforcement learning in a digital twin of I-IoT edge networks.", "Karya Salemba Empat (KSE) merit scholarship awardee."],
    },
    {
      kind: "courses", title: "Online specializations in AI", place: "Coursera (DeepLearning.AI, IBM, Google, University of Alberta)",
      start: "Jul 2023", end: "Oct 2024",
      summary: "7 certificates covering deep learning, reinforcement learning, ML engineering and automation.",
      points: ["Deep Learning and TensorFlow Developer (DeepLearning.AI)", "Reinforcement Learning Specialization (University of Alberta)", "IBM AI Engineering, Data Science and Machine Learning", "Google IT Automation with Python"],
      link: "skills.html#certs",
    },
    {
      kind: "exchange", title: "Taiwan Experience Education Program", place: "National Taiwan University of Science and Technology · Taipei",
      start: "Jun 2024", end: "Aug 2024",
      summary: "Fully funded research exchange on AI for 5G Open RAN energy saving.",
      points: ["Selected for a fully funded research-based program in collaboration with NTUST.", "Details of the research work are on the Experience page."],
      link: "experience.html",
    },
  ],
};
