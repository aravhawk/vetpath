"""
Seed the VetPath database with O*NET-style occupation data
"""

from database import init_database, get_db

# Comprehensive occupation data based on O*NET
OCCUPATIONS = [
    # Manufacturing & Production
    {
        "occupation_code": "17-2112.00",
        "occupation_title": "Industrial Engineer",
        "description": "Design, develop, test, and evaluate integrated systems for managing industrial production processes.",
        "median_wage": 95300,
        "job_outlook": "Faster than average",
        "growth_rate": 10.0,
        "industry": "manufacturing",
        "education_required": "Bachelor's degree",
        "skills": ["process improvement", "quality control", "project management", "data analysis",
                   "team leadership", "problem solving", "operations management", "lean manufacturing"]
    },
    {
        "occupation_code": "51-1011.00",
        "occupation_title": "Production Supervisor",
        "description": "Directly supervise and coordinate the activities of production and operating workers.",
        "median_wage": 62010,
        "job_outlook": "Average",
        "growth_rate": 5.0,
        "industry": "manufacturing",
        "education_required": "High school diploma or equivalent",
        "skills": ["team leadership", "scheduling", "quality control", "safety management",
                   "inventory management", "training", "communication", "problem solving"]
    },
    {
        "occupation_code": "51-4041.00",
        "occupation_title": "CNC Machine Tool Operator",
        "description": "Set up and operate computer-controlled machines to fabricate metal or plastic parts.",
        "median_wage": 45750,
        "job_outlook": "Average",
        "growth_rate": 3.0,
        "industry": "manufacturing",
        "education_required": "High school diploma or equivalent",
        "skills": ["equipment operation", "precision measurement", "blueprint reading",
                   "quality inspection", "maintenance", "safety procedures", "mathematics"]
    },
    {
        "occupation_code": "17-2141.00",
        "occupation_title": "Mechanical Engineer",
        "description": "Perform engineering duties in planning and designing tools, engines, machines, and other mechanically functioning equipment.",
        "median_wage": 96310,
        "job_outlook": "Average",
        "growth_rate": 2.0,
        "industry": "manufacturing",
        "education_required": "Bachelor's degree",
        "skills": ["mechanical design", "CAD software", "problem solving", "project management",
                   "technical documentation", "quality assurance", "teamwork", "mathematics"]
    },

    # Technology & IT
    {
        "occupation_code": "15-1212.00",
        "occupation_title": "Information Security Analyst",
        "description": "Plan, implement, upgrade, or monitor security measures for the protection of computer networks and information.",
        "median_wage": 112000,
        "job_outlook": "Much faster than average",
        "growth_rate": 32.0,
        "industry": "technology",
        "education_required": "Bachelor's degree",
        "skills": ["cybersecurity", "network security", "risk assessment", "security clearance",
                   "incident response", "security protocols", "threat analysis", "problem solving"]
    },
    {
        "occupation_code": "15-1232.00",
        "occupation_title": "Network Administrator",
        "description": "Install, configure, and maintain local area networks, wide area networks, and internet systems.",
        "median_wage": 90520,
        "job_outlook": "Average",
        "growth_rate": 3.0,
        "industry": "technology",
        "education_required": "Bachelor's degree",
        "skills": ["network administration", "troubleshooting", "system configuration",
                   "security management", "documentation", "communication", "problem solving"]
    },
    {
        "occupation_code": "15-1211.00",
        "occupation_title": "Computer Systems Analyst",
        "description": "Analyze science, engineering, business, and other data processing problems to develop and implement solutions.",
        "median_wage": 102240,
        "job_outlook": "Average",
        "growth_rate": 9.0,
        "industry": "technology",
        "education_required": "Bachelor's degree",
        "skills": ["systems analysis", "problem solving", "project management", "communication",
                   "data analysis", "technical documentation", "teamwork", "requirements gathering"]
    },
    {
        "occupation_code": "15-1251.00",
        "occupation_title": "Software Developer",
        "description": "Research, design, and develop computer and network software or specialized utility programs.",
        "median_wage": 127260,
        "job_outlook": "Much faster than average",
        "growth_rate": 25.0,
        "industry": "technology",
        "education_required": "Bachelor's degree",
        "skills": ["programming", "software development", "problem solving", "debugging",
                   "system design", "teamwork", "communication", "project management"]
    },

    # Logistics & Transportation
    {
        "occupation_code": "13-1081.00",
        "occupation_title": "Logistics Analyst",
        "description": "Analyze and coordinate the logistical functions of a firm or organization.",
        "median_wage": 77520,
        "job_outlook": "Faster than average",
        "growth_rate": 18.0,
        "industry": "logistics",
        "education_required": "Bachelor's degree",
        "skills": ["logistics management", "supply chain", "data analysis", "inventory management",
                   "process improvement", "communication", "problem solving", "project management"]
    },
    {
        "occupation_code": "11-3071.00",
        "occupation_title": "Transportation Manager",
        "description": "Plan, direct, or coordinate the transportation operations within an organization.",
        "median_wage": 98560,
        "job_outlook": "Average",
        "growth_rate": 6.0,
        "industry": "logistics",
        "education_required": "Bachelor's degree",
        "skills": ["team leadership", "logistics management", "fleet management", "budgeting",
                   "scheduling", "compliance", "communication", "problem solving"]
    },
    {
        "occupation_code": "43-5071.00",
        "occupation_title": "Shipping and Receiving Supervisor",
        "description": "Coordinate activities of workers engaged in verifying and keeping records of incoming and outgoing shipments.",
        "median_wage": 55230,
        "job_outlook": "Average",
        "growth_rate": 4.0,
        "industry": "logistics",
        "education_required": "High school diploma or equivalent",
        "skills": ["inventory management", "team leadership", "documentation", "scheduling",
                   "quality control", "safety procedures", "communication", "organization"]
    },

    # Construction & Skilled Trades
    {
        "occupation_code": "47-1011.00",
        "occupation_title": "Construction Supervisor",
        "description": "Directly supervise and coordinate activities of construction workers.",
        "median_wage": 72290,
        "job_outlook": "Average",
        "growth_rate": 5.0,
        "industry": "construction",
        "education_required": "High school diploma or equivalent",
        "skills": ["team leadership", "project management", "blueprint reading", "safety management",
                   "scheduling", "quality control", "budgeting", "communication"]
    },
    {
        "occupation_code": "49-9021.00",
        "occupation_title": "HVAC Technician",
        "description": "Install, maintain, and repair heating, ventilation, and air conditioning systems.",
        "median_wage": 51390,
        "job_outlook": "Much faster than average",
        "growth_rate": 15.0,
        "industry": "construction",
        "education_required": "Postsecondary nondegree award",
        "skills": ["equipment maintenance", "troubleshooting", "electrical systems",
                   "refrigeration", "safety procedures", "customer service", "blueprint reading"]
    },
    {
        "occupation_code": "47-2111.00",
        "occupation_title": "Electrician",
        "description": "Install, maintain, and repair electrical wiring, equipment, and fixtures.",
        "median_wage": 60240,
        "job_outlook": "Faster than average",
        "growth_rate": 9.0,
        "industry": "construction",
        "education_required": "High school diploma or equivalent",
        "skills": ["electrical systems", "troubleshooting", "blueprint reading", "safety procedures",
                   "equipment installation", "maintenance", "problem solving", "mathematics"]
    },

    # Energy & Utilities
    {
        "occupation_code": "51-8013.00",
        "occupation_title": "Power Plant Operator",
        "description": "Control, operate, or maintain machinery to generate electric power.",
        "median_wage": 94790,
        "job_outlook": "Declining",
        "growth_rate": -15.0,
        "industry": "energy",
        "education_required": "High school diploma or equivalent",
        "skills": ["equipment operation", "monitoring systems", "safety procedures",
                   "troubleshooting", "maintenance", "documentation", "teamwork"]
    },
    {
        "occupation_code": "47-5013.00",
        "occupation_title": "Wind Turbine Technician",
        "description": "Inspect, diagnose, adjust, or repair wind turbines. Perform maintenance on wind turbine equipment.",
        "median_wage": 56260,
        "job_outlook": "Much faster than average",
        "growth_rate": 44.0,
        "industry": "energy",
        "education_required": "Postsecondary nondegree award",
        "skills": ["equipment maintenance", "troubleshooting", "safety procedures",
                   "climbing", "electrical systems", "mechanical systems", "documentation"]
    },

    # Healthcare Support
    {
        "occupation_code": "29-2042.00",
        "occupation_title": "Emergency Medical Technician",
        "description": "Assess injuries, administer emergency medical care, and transport injured or sick persons to medical facilities.",
        "median_wage": 36930,
        "job_outlook": "Faster than average",
        "growth_rate": 7.0,
        "industry": "healthcare",
        "education_required": "Postsecondary nondegree award",
        "skills": ["emergency response", "medical procedures", "patient care", "communication",
                   "stress management", "teamwork", "problem solving", "documentation"]
    },
    {
        "occupation_code": "11-9111.00",
        "occupation_title": "Medical and Health Services Manager",
        "description": "Plan, direct, or coordinate medical and health services in hospitals, clinics, or similar organizations.",
        "median_wage": 104830,
        "job_outlook": "Much faster than average",
        "growth_rate": 28.0,
        "industry": "healthcare",
        "education_required": "Bachelor's degree",
        "skills": ["team leadership", "healthcare administration", "budgeting", "compliance",
                   "communication", "problem solving", "project management", "operations management"]
    },

    # Management & Operations
    {
        "occupation_code": "11-1021.00",
        "occupation_title": "General Manager",
        "description": "Plan, direct, or coordinate operations of companies or organizations.",
        "median_wage": 102450,
        "job_outlook": "Average",
        "growth_rate": 6.0,
        "industry": "management",
        "education_required": "Bachelor's degree",
        "skills": ["team leadership", "strategic planning", "budgeting", "operations management",
                   "communication", "problem solving", "decision making", "project management"]
    },
    {
        "occupation_code": "11-3051.00",
        "occupation_title": "Operations Manager",
        "description": "Direct administrative and operational activities of business operations.",
        "median_wage": 97970,
        "job_outlook": "Average",
        "growth_rate": 6.0,
        "industry": "management",
        "education_required": "Bachelor's degree",
        "skills": ["team leadership", "operations management", "process improvement", "budgeting",
                   "scheduling", "quality control", "communication", "problem solving"]
    },
    {
        "occupation_code": "13-1111.00",
        "occupation_title": "Management Analyst",
        "description": "Conduct organizational studies and evaluations, design systems and procedures.",
        "median_wage": 95290,
        "job_outlook": "Faster than average",
        "growth_rate": 11.0,
        "industry": "management",
        "education_required": "Bachelor's degree",
        "skills": ["data analysis", "problem solving", "process improvement", "communication",
                   "project management", "strategic planning", "documentation", "teamwork"]
    },

    # Training & Education
    {
        "occupation_code": "13-1151.00",
        "occupation_title": "Training and Development Specialist",
        "description": "Design and conduct training and development programs to improve individual and organizational performance.",
        "median_wage": 63080,
        "job_outlook": "Average",
        "growth_rate": 6.0,
        "industry": "education",
        "education_required": "Bachelor's degree",
        "skills": ["training development", "instruction", "curriculum design", "communication",
                   "presentation skills", "assessment", "documentation", "teamwork"]
    },

    # Emergency Services
    {
        "occupation_code": "33-1012.00",
        "occupation_title": "Fire Chief",
        "description": "Plan, direct, and coordinate activities of a fire department.",
        "median_wage": 78020,
        "job_outlook": "Average",
        "growth_rate": 4.0,
        "industry": "emergency_services",
        "education_required": "Postsecondary nondegree award",
        "skills": ["team leadership", "emergency response", "strategic planning", "budgeting",
                   "communication", "decision making", "safety management", "training"]
    },
    {
        "occupation_code": "33-3051.00",
        "occupation_title": "Police Officer",
        "description": "Maintain order and protect life and property by enforcing laws and ordinances.",
        "median_wage": 65790,
        "job_outlook": "Average",
        "growth_rate": 3.0,
        "industry": "emergency_services",
        "education_required": "High school diploma or equivalent",
        "skills": ["law enforcement", "communication", "problem solving", "physical fitness",
                   "firearms proficiency", "report writing", "teamwork", "decision making"]
    },

    # Project Management
    {
        "occupation_code": "11-9199.00",
        "occupation_title": "Project Manager",
        "description": "Plan, direct, and coordinate activities to ensure project goals are accomplished within prescribed time frames and budgets.",
        "median_wage": 94500,
        "job_outlook": "Faster than average",
        "growth_rate": 7.0,
        "industry": "management",
        "education_required": "Bachelor's degree",
        "skills": ["project management", "team leadership", "budgeting", "scheduling",
                   "risk management", "communication", "problem solving", "stakeholder management"]
    },
]

# Military MOS to civilian occupation crosswalk
MILITARY_CROSSWALK = [
    # Army Infantry
    {"mos_code": "11B", "branch": "Army", "military_title": "Infantryman",
     "civilian_codes": ["33-3051.00", "33-1012.00", "11-3051.00", "47-1011.00"]},

    # Army Logistics
    {"mos_code": "92A", "branch": "Army", "military_title": "Automated Logistical Specialist",
     "civilian_codes": ["13-1081.00", "43-5071.00", "11-3071.00"]},
    {"mos_code": "92Y", "branch": "Army", "military_title": "Unit Supply Specialist",
     "civilian_codes": ["43-5071.00", "13-1081.00", "11-3071.00"]},

    # Army Aviation
    {"mos_code": "15T", "branch": "Army", "military_title": "UH-60 Helicopter Repairer",
     "civilian_codes": ["49-9021.00", "17-2141.00", "51-4041.00"]},

    # Army Signal/IT
    {"mos_code": "25B", "branch": "Army", "military_title": "Information Technology Specialist",
     "civilian_codes": ["15-1232.00", "15-1212.00", "15-1211.00", "15-1251.00"]},
    {"mos_code": "25S", "branch": "Army", "military_title": "Satellite Communication Systems Operator",
     "civilian_codes": ["15-1232.00", "15-1212.00", "15-1211.00"]},

    # Army Medical
    {"mos_code": "68W", "branch": "Army", "military_title": "Combat Medic Specialist",
     "civilian_codes": ["29-2042.00", "11-9111.00"]},

    # Army Maintenance
    {"mos_code": "91B", "branch": "Army", "military_title": "Wheeled Vehicle Mechanic",
     "civilian_codes": ["49-9021.00", "51-4041.00", "47-2111.00"]},

    # Navy
    {"mos_code": "IT", "branch": "Navy", "military_title": "Information Systems Technician",
     "civilian_codes": ["15-1232.00", "15-1212.00", "15-1211.00", "15-1251.00"]},
    {"mos_code": "MM", "branch": "Navy", "military_title": "Machinist's Mate",
     "civilian_codes": ["51-4041.00", "17-2141.00", "51-8013.00"]},
    {"mos_code": "HM", "branch": "Navy", "military_title": "Hospital Corpsman",
     "civilian_codes": ["29-2042.00", "11-9111.00"]},
    {"mos_code": "LS", "branch": "Navy", "military_title": "Logistics Specialist",
     "civilian_codes": ["13-1081.00", "43-5071.00", "11-3071.00"]},

    # Air Force
    {"mos_code": "3D0X2", "branch": "Air Force", "military_title": "Cyber Systems Operations",
     "civilian_codes": ["15-1212.00", "15-1232.00", "15-1211.00"]},
    {"mos_code": "2A6X1", "branch": "Air Force", "military_title": "Aerospace Propulsion",
     "civilian_codes": ["17-2141.00", "49-9021.00", "51-4041.00"]},
    {"mos_code": "2T2X1", "branch": "Air Force", "military_title": "Air Transportation",
     "civilian_codes": ["13-1081.00", "11-3071.00", "43-5071.00"]},

    # Marine Corps
    {"mos_code": "0311", "branch": "Marine Corps", "military_title": "Rifleman",
     "civilian_codes": ["33-3051.00", "33-1012.00", "11-3051.00"]},
    {"mos_code": "0621", "branch": "Marine Corps", "military_title": "Field Radio Operator",
     "civilian_codes": ["15-1232.00", "15-1212.00"]},
    {"mos_code": "0481", "branch": "Marine Corps", "military_title": "Landing Support Specialist",
     "civilian_codes": ["13-1081.00", "11-3071.00", "43-5071.00"]},
    {"mos_code": "3521", "branch": "Marine Corps", "military_title": "Automotive Maintenance Technician",
     "civilian_codes": ["49-9021.00", "51-4041.00"]},
]

# Training resources for skill gaps
TRAINING_RESOURCES = [
    {"skill_name": "project management", "certification_name": "PMP or CAPM",
     "provider": "Project Management Institute", "estimated_time": "3-6 months",
     "cost": "Often covered by VA benefits", "va_eligible": True},

    {"skill_name": "data analysis", "certification_name": "Google Data Analytics Certificate",
     "provider": "Google/Coursera", "estimated_time": "6 months",
     "cost": "Free on Coursera", "va_eligible": True},

    {"skill_name": "cybersecurity", "certification_name": "CompTIA Security+",
     "provider": "CompTIA", "estimated_time": "3-4 months",
     "cost": "$392 exam fee, often VA covered", "va_eligible": True},

    {"skill_name": "network administration", "certification_name": "CompTIA Network+",
     "provider": "CompTIA", "estimated_time": "2-3 months",
     "cost": "$358 exam fee, often VA covered", "va_eligible": True},

    {"skill_name": "programming", "certification_name": "Google IT Support Certificate",
     "provider": "Google/Coursera", "estimated_time": "6 months",
     "cost": "Free on Coursera", "va_eligible": True},

    {"skill_name": "software development", "certification_name": "AWS Certified Developer",
     "provider": "Amazon Web Services", "estimated_time": "3-6 months",
     "cost": "$150 exam fee", "va_eligible": True},

    {"skill_name": "lean manufacturing", "certification_name": "Six Sigma Green Belt",
     "provider": "ASQ or IASSC", "estimated_time": "2-3 months",
     "cost": "$438 exam fee, often employer paid", "va_eligible": True},

    {"skill_name": "quality control", "certification_name": "ASQ Certified Quality Inspector",
     "provider": "American Society for Quality", "estimated_time": "2-3 months",
     "cost": "$394 exam fee", "va_eligible": True},

    {"skill_name": "electrical systems", "certification_name": "Journeyman Electrician License",
     "provider": "State Licensing Board", "estimated_time": "4 years apprenticeship",
     "cost": "Paid apprenticeship", "va_eligible": True},

    {"skill_name": "HVAC", "certification_name": "EPA Section 608 Certification",
     "provider": "EPA Approved Programs", "estimated_time": "1-2 weeks",
     "cost": "$150-300", "va_eligible": True},

    {"skill_name": "CAD software", "certification_name": "Autodesk Certified User",
     "provider": "Autodesk", "estimated_time": "2-3 months",
     "cost": "$125 exam fee", "va_eligible": True},

    {"skill_name": "healthcare administration", "certification_name": "Certified Medical Manager",
     "provider": "PAHCOM", "estimated_time": "6 months",
     "cost": "$325 exam fee", "va_eligible": True},

    {"skill_name": "supply chain", "certification_name": "APICS Certified Supply Chain Professional",
     "provider": "ASCM", "estimated_time": "6-9 months",
     "cost": "$595 exam fee, often employer paid", "va_eligible": True},

    {"skill_name": "forklift operation", "certification_name": "OSHA Forklift Certification",
     "provider": "OSHA Approved Trainers", "estimated_time": "1 day",
     "cost": "$50-150", "va_eligible": True},

    {"skill_name": "CDL", "certification_name": "Commercial Driver's License",
     "provider": "State DMV", "estimated_time": "3-7 weeks",
     "cost": "$3000-7000, VA eligible", "va_eligible": True},
]


def seed_database():
    """Seed the database with initial data"""
    print("Initializing database...")
    init_database()

    with get_db() as conn:
        cursor = conn.cursor()

        # Clear existing data
        cursor.execute("DELETE FROM occupation_skills")
        cursor.execute("DELETE FROM military_crosswalk")
        cursor.execute("DELETE FROM training_resources")
        cursor.execute("DELETE FROM occupations")

        print("Seeding occupations...")
        for occ in OCCUPATIONS:
            skills = occ.pop("skills", [])
            cursor.execute("""
                INSERT INTO occupations
                (occupation_code, occupation_title, description, median_wage,
                 job_outlook, growth_rate, industry, education_required)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                occ["occupation_code"],
                occ["occupation_title"],
                occ["description"],
                occ["median_wage"],
                occ["job_outlook"],
                occ["growth_rate"],
                occ["industry"],
                occ["education_required"]
            ))

            # Add skills
            for i, skill in enumerate(skills):
                importance = max(1, 5 - i)  # Higher importance for skills listed first
                cursor.execute("""
                    INSERT INTO occupation_skills (occupation_code, skill_name, importance_level)
                    VALUES (?, ?, ?)
                """, (occ["occupation_code"], skill.lower(), importance))

        print("Seeding military crosswalk...")
        for entry in MILITARY_CROSSWALK:
            for i, civ_code in enumerate(entry["civilian_codes"]):
                match_strength = max(1, 5 - i)  # Higher match for first listed
                cursor.execute("""
                    INSERT INTO military_crosswalk
                    (mos_code, branch, military_title, civilian_occupation_code, match_strength)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    entry["mos_code"],
                    entry["branch"],
                    entry["military_title"],
                    civ_code,
                    match_strength
                ))

        print("Seeding training resources...")
        for resource in TRAINING_RESOURCES:
            cursor.execute("""
                INSERT INTO training_resources
                (skill_name, certification_name, provider, estimated_time, cost, va_eligible)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                resource["skill_name"].lower(),
                resource["certification_name"],
                resource["provider"],
                resource["estimated_time"],
                resource["cost"],
                1 if resource["va_eligible"] else 0
            ))

        conn.commit()

    print("Database seeded successfully!")
    print(f"  - {len(OCCUPATIONS)} occupations")
    print(f"  - {len(MILITARY_CROSSWALK)} MOS crosswalk entries")
    print(f"  - {len(TRAINING_RESOURCES)} training resources")


if __name__ == "__main__":
    seed_database()
