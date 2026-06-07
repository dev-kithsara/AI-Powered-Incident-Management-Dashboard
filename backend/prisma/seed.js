const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with real-world incident data...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ims.com' },
    update: { password: hashedPassword },
    create: { name: 'System Admin', email: 'admin@ims.com', password: hashedPassword, role: 'admin' }
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@ims.com' },
    update: { password: hashedPassword },
    create: { name: 'Sarah Johnson', email: 'manager@ims.com', password: hashedPassword, role: 'incident_manager' }
  });
  const staff = await prisma.user.upsert({
    where: { email: 'staff@ims.com' },
    update: { password: hashedPassword },
    create: { name: 'David Lee', email: 'staff@ims.com', password: hashedPassword, role: 'staff' }
  });
  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@ims.com' },
    update: { password: hashedPassword },
    create: { name: 'Priya Sharma', email: 'staff2@ims.com', password: hashedPassword, role: 'staff' }
  });

  console.log('✅ Users created');

  // ── Real-world incidents ───────────────────────────────────────────────────
  // Groups designed so AI can find genuine similarities:
  //   Group A: Cyber / Security (5 incidents)
  //   Group B: IT Infrastructure / Server (5 incidents)
  //   Group C: Workplace Safety / Slip-Trip-Fall (5 incidents)
  //   Group D: Data Breach / Privacy (4 incidents)
  //   Group E: Environmental / Chemical Spill (4 incidents)
  //   Group F: HR / Compliance (4 incidents)
  //   Group G: Fire Safety (3 incidents)

  const incidents = [
    // ── GROUP A: Cyber / Security ──────────────────────────────────────────
    {
      title: 'Ransomware Attack on Finance Department',
      description: 'Ransomware malware encrypted 200+ files on the finance department shared drive. Attacker demanded 3 BTC ransom. Systems were isolated immediately. Backups were used to restore data within 6 hours. Initial infection vector was a phishing email with a malicious Excel macro.',
      severity: 'CRITICAL', category: 'Cyber Security', department: 'Finance',
      location: 'Head Office - Finance Floor', status: 'CLOSED', reportedBy: admin.id
    },
    {
      title: 'Phishing Email Campaign Targeting HR Staff',
      description: 'Mass phishing campaign sent to 45 HR employees impersonating the CEO. 3 employees clicked the malicious link and entered credentials. Attackers gained access to payroll system briefly before detection. Multi-factor authentication was not enabled on affected accounts.',
      severity: 'HIGH', category: 'Cyber Security', department: 'Human Resources',
      location: 'HR Department', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'Brute Force Attack on VPN Gateway',
      description: 'Over 50,000 failed authentication attempts detected on the corporate VPN gateway over a 2-hour period from IP ranges in Eastern Europe. Intrusion detection system flagged the activity. VPN gateway temporarily blocked affected IP ranges. No successful breach confirmed.',
      severity: 'HIGH', category: 'Cyber Security', department: 'IT',
      location: 'Network Infrastructure', status: 'CLOSED', reportedBy: admin.id
    },
    {
      title: 'Malware Detected on Executive Laptop',
      description: 'Endpoint detection and response tool flagged keylogger malware on CFO laptop. Malware had been active for approximately 72 hours before detection. Device quarantined immediately. Forensic analysis performed. Credentials for 4 business systems potentially compromised.',
      severity: 'CRITICAL', category: 'Cyber Security', department: 'Executive',
      location: 'C-Suite Floor', status: 'IN_PROGRESS', reportedBy: admin.id
    },
    {
      title: 'Unauthorized USB Device Connected to Workstation',
      description: 'DLP system detected an unauthorized USB storage device connected to an accounting workstation. 2.4GB of financial data was copied before the device was blocked. Employee claimed it was for legitimate work-from-home purposes but had not followed data handling procedures.',
      severity: 'HIGH', category: 'Cyber Security', department: 'Accounting',
      location: 'Accounting Department', status: 'UNDER_REVIEW', reportedBy: staff2.id
    },

    // ── GROUP B: IT Infrastructure / Server ───────────────────────────────
    {
      title: 'Primary Database Server Crash - Production Outage',
      description: 'Primary PostgreSQL database server experienced hardware failure due to RAID controller malfunction. All production services went offline for 3.5 hours. Failover to standby did not trigger automatically due to misconfigured health check timeout. Data restored from hourly snapshots with 47 minutes of data loss.',
      severity: 'CRITICAL', category: 'Infrastructure', department: 'IT',
      location: 'Data Center - Rack 14', status: 'CLOSED', reportedBy: admin.id
    },
    {
      title: 'Web Server Memory Leak Causing Service Degradation',
      description: 'Node.js application server experienced progressive memory leak due to unclosed database connections in background job processor. Server memory climbed from 40% to 98% over 6 hours causing severe slowdowns. Service response time increased from 200ms to 8 seconds before automatic restart triggered.',
      severity: 'HIGH', category: 'Infrastructure', department: 'Engineering',
      location: 'Cloud Infrastructure (AWS)', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'Network Switch Failure Causing Partial Office Outage',
      description: 'Core network switch in Building B failed due to overheating. 80 employees lost network connectivity including VoIP phones, printers, and internet access. Failure caused by blocked air vents and ambient temperature exceeding operating threshold. Temporary patch cable workaround deployed within 45 minutes.',
      severity: 'HIGH', category: 'Infrastructure', department: 'IT',
      location: 'Building B - Server Room', status: 'CLOSED', reportedBy: staff2.id
    },
    {
      title: 'SSL Certificate Expiry Causing E-commerce Downtime',
      description: 'SSL/TLS certificate on the main e-commerce domain expired causing browsers to display security warnings. Automated renewal cron job had failed silently 30 days prior. Sales page was inaccessible for 4 hours resulting in estimated $85,000 revenue loss. Certificate renewed manually.',
      severity: 'CRITICAL', category: 'Infrastructure', department: 'Engineering',
      location: 'Production Environment', status: 'CLOSED', reportedBy: manager.id
    },
    {
      title: 'Cloud Storage Bucket Misconfiguration - Public Access',
      description: 'AWS S3 bucket containing customer invoice PDFs was accidentally set to public read access during a Terraform configuration update. Bucket was publicly accessible for 18 hours before discovery. Approximately 12,000 customer invoice files were potentially exposed. Audit log review ongoing.',
      severity: 'CRITICAL', category: 'Infrastructure', department: 'Engineering',
      location: 'AWS Cloud Environment', status: 'IN_PROGRESS', reportedBy: admin.id
    },

    // ── GROUP C: Workplace Safety / Slip-Trip-Fall ─────────────────────────
    {
      title: 'Employee Slip and Fall on Wet Lobby Floor',
      description: 'Employee slipped on wet floor in the main lobby after a wet mop was left unattended without wet floor warning signs. Suffered minor contusion on right knee and wrist sprain. First aid administered on site. Employee was able to walk unaided. Incident occurred during lunch peak period.',
      severity: 'MEDIUM', category: 'Health & Safety', department: 'Facilities',
      location: 'Main Lobby - Ground Floor', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'Contractor Trip and Fall from Scaffolding',
      description: 'External contractor performing ceiling maintenance tripped over an unsecured power cable on scaffolding and fell approximately 1.5 meters. Sustained fractured wrist and bruised ribs. Hard hat worn as per protocol prevented head injury. Ambulance called. RIDDOR reportable incident.',
      severity: 'HIGH', category: 'Health & Safety', department: 'Facilities',
      location: 'Building C - 3rd Floor Atrium', status: 'CLOSED', reportedBy: manager.id
    },
    {
      title: 'Warehouse Worker Slip on Spilled Hydraulic Oil',
      description: 'Warehouse operative slipped on hydraulic oil leak from a forklift truck. Worker fell backwards striking lower back on concrete floor. Significant lumbar pain reported. Taken to hospital via ambulance. Hydraulic system fault on forklift had been reported 3 days prior but not yet repaired.',
      severity: 'HIGH', category: 'Health & Safety', department: 'Operations',
      location: 'Warehouse - Bay 7', status: 'UNDER_REVIEW', reportedBy: staff2.id
    },
    {
      title: 'Office Worker Tripped Over Trailing Phone Cable',
      description: 'Office employee tripped over a telephone cable routed across a walkway between desks. Fell forward hitting face on desk corner. Required 3 stitches to forehead laceration. Cable had been a known hazard and reported to facilities team 2 weeks earlier without action taken.',
      severity: 'MEDIUM', category: 'Health & Safety', department: 'Sales',
      location: 'Open Plan Office - Sales Floor', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'Visitor Fall on Icy Car Park Surface',
      description: 'External visitor slipped on black ice in the main car park and fell, fracturing their wrist. Gritting of car park had not been completed despite forecasted sub-zero temperatures overnight. Visitor is considering legal action. CCTV footage preserved.',
      severity: 'HIGH', category: 'Health & Safety', department: 'Facilities',
      location: 'Main Car Park - Visitor Bays', status: 'IN_PROGRESS', reportedBy: admin.id
    },

    // ── GROUP D: Data Breach / Privacy ────────────────────────────────────
    {
      title: 'Customer Personal Data Emailed to Wrong Recipient',
      description: 'Customer service agent sent a spreadsheet containing 340 customers personal data including names, addresses, and partial payment details to the wrong email address. Recipient was an external party unrelated to the company. Data subject notification required under GDPR Article 33.',
      severity: 'HIGH', category: 'Data Privacy', department: 'Customer Service',
      location: 'Customer Service Centre', status: 'CLOSED', reportedBy: manager.id
    },
    {
      title: 'HR Database Exposed via Insecure API Endpoint',
      description: 'Security researcher reported that an unauthenticated REST API endpoint was returning employee salary and personal data. Endpoint had been deployed without authentication as part of a hotfix 6 weeks prior. Affected records included 890 current and former employees. ICO notification submitted.',
      severity: 'CRITICAL', category: 'Data Privacy', department: 'HR',
      location: 'Internal HR System', status: 'CLOSED', reportedBy: admin.id
    },
    {
      title: 'Paper Documents with Patient Data Found in Public Bin',
      description: 'Members of the public found printed documents containing patient consultation notes and personal details in a street-side recycling bin. Documents traced back to a locum GP who had printed patient notes and failed to shred them before disposal. Regulatory breach under UK GDPR.',
      severity: 'HIGH', category: 'Data Privacy', department: 'Medical',
      location: 'External - Public Area', status: 'UNDER_REVIEW', reportedBy: staff2.id
    },
    {
      title: 'Laptop Stolen Containing Unencrypted Customer Data',
      description: 'Company laptop stolen from an employees car contained an unencrypted local database backup with approximately 4,500 customer records. Laptop was password protected but hard drive encryption was not enabled contrary to company policy. Police report filed. ICO breach notification submitted within 72 hours.',
      severity: 'CRITICAL', category: 'Data Privacy', department: 'Sales',
      location: 'External - Employee Vehicle', status: 'CLOSED', reportedBy: admin.id
    },

    // ── GROUP E: Environmental / Chemical Spill ────────────────────────────
    {
      title: 'Chemical Solvent Spill in Manufacturing Area',
      description: 'A 25-litre drum of industrial solvent (isopropyl alcohol) tipped over during forklift loading operation. Liquid spread across approximately 15 square metres of factory floor. Area evacuated. Emergency spill kit deployed. Local fire brigade notified as per chemical spill protocol. No injuries.',
      severity: 'HIGH', category: 'Environmental', department: 'Manufacturing',
      location: 'Factory Floor - Chemical Storage Zone', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'Refrigerant Gas Leak in Server Room HVAC Unit',
      description: 'Refrigerant leak detected from aging HVAC cooling unit in the main server room. R410A gas detected at elevated concentration by environmental sensors. Server room evacuated as precaution. HVAC contractor called for emergency repair. Servers maintained temperature within safe limits using portable cooling units.',
      severity: 'MEDIUM', category: 'Environmental', department: 'IT',
      location: 'Data Center - Server Room A', status: 'CLOSED', reportedBy: manager.id
    },
    {
      title: 'Oil Spill from Delivery Vehicle in Loading Bay',
      description: 'Delivery truck experienced catastrophic engine oil failure in the loading bay resulting in approximately 40 litres of engine oil spillage. Oil spread towards a nearby storm drain. Drain blocked with absorbent socks before contamination reached water course. Environmental agency notified.',
      severity: 'HIGH', category: 'Environmental', department: 'Logistics',
      location: 'Loading Bay 3', status: 'CLOSED', reportedBy: staff2.id
    },
    {
      title: 'Battery Acid Leak from UPS Systems',
      description: 'Multiple UPS battery units in the telecoms room experienced swelling and acid leakage due to overcharging caused by faulty charge controller. Corrosive acid contaminated floor and damaged adjacent equipment. Specialist hazmat clean-up required. Telecoms services disrupted for 8 hours.',
      severity: 'HIGH', category: 'Environmental', department: 'IT',
      location: 'Telecoms Room - Building A', status: 'UNDER_REVIEW', reportedBy: admin.id
    },

    // ── GROUP F: HR / Compliance ──────────────────────────────────────────
    {
      title: 'Employee Workplace Harassment Complaint',
      description: 'Formal complaint received from a junior team member alleging repeated verbal harassment by a line manager over a 3-month period. Complainant alleges comments about gender and personal appearance. HR investigation initiated. Both parties interviewed. Manager suspended pending investigation outcome.',
      severity: 'HIGH', category: 'HR & Compliance', department: 'Human Resources',
      location: 'Marketing Department', status: 'IN_PROGRESS', reportedBy: manager.id
    },
    {
      title: 'Timesheet Fraud Discovered During Audit',
      description: 'Internal audit identified a pattern of inflated overtime claims by a team of 4 contractors over a 6-month period. Estimated overpayment of $34,000. Discrepancy discovered by cross-referencing access control logs with timesheet submissions. Contractors terminated. Police referral under consideration.',
      severity: 'HIGH', category: 'HR & Compliance', department: 'Finance',
      location: 'Finance Operations Centre', status: 'UNDER_REVIEW', reportedBy: admin.id
    },
    {
      title: 'Health & Safety Training Records Non-Compliant',
      description: 'Regulatory audit found that 68 employees in the manufacturing division had not completed mandatory annual health and safety refresher training within required timeframes. Records had not been updated in the LMS following a system migration. Regulatory improvement notice issued. 30-day remediation deadline given.',
      severity: 'MEDIUM', category: 'HR & Compliance', department: 'Human Resources',
      location: 'Manufacturing Division', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'GDPR Subject Access Request Response Deadline Missed',
      description: 'A subject access request submitted by a former employee was not identified in the customer service ticket queue due to incorrect categorisation. The mandatory 30-day response deadline was missed by 12 days. ICO complaint subsequently filed by the data subject. DPO notified. Formal response issued.',
      severity: 'MEDIUM', category: 'HR & Compliance', department: 'Legal',
      location: 'Legal & Compliance Team', status: 'CLOSED', reportedBy: staff2.id
    },

    // ── GROUP G: Fire Safety ──────────────────────────────────────────────
    {
      title: 'Kitchen Fire Suppression System Accidental Activation',
      description: 'CO2 fire suppression system in the server room cafe kitchen was accidentally triggered by steam from a commercial dishwasher. System discharged causing brief hypoxic conditions. 3 kitchen staff evacuated safely. False activation set off building-wide fire alarm. Fire brigade attended. Kitchen closed for 4 hours for ventilation.',
      severity: 'HIGH', category: 'Fire Safety', department: 'Facilities',
      location: 'Staff Canteen Kitchen', status: 'CLOSED', reportedBy: manager.id
    },
    {
      title: 'Electrical Fire in Office Server Cupboard',
      description: 'Small electrical fire started in an office server cupboard due to overloaded power strip running several unmanaged switches and a printer. Smoke detected by building alarm. Staff evacuated. Fire extinguished by facilities manager using CO2 extinguisher before fire brigade arrival. Minor smoke damage to equipment.',
      severity: 'HIGH', category: 'Fire Safety', department: 'IT',
      location: 'Office Block - 2nd Floor Server Cupboard', status: 'CLOSED', reportedBy: staff.id
    },
    {
      title: 'Fire Exit Blocked by Delivery Pallets',
      description: 'During a routine fire safety inspection it was found that 3 emergency fire exits in the warehouse were blocked by delivery pallets. Pallets had been stacked against exits by an agency worker unaware of fire safety regulations. Exits cleared immediately. Agency worker given formal warning. Refresher training arranged.',
      severity: 'MEDIUM', category: 'Fire Safety', department: 'Operations',
      location: 'Warehouse - South Wing', status: 'CLOSED', reportedBy: staff2.id
    },
  ];

  let created = 0;
  for (const inc of incidents) {
    await prisma.incident.create({ data: inc });
    created++;
  }

  console.log(`✅ Created ${created} incidents`);

  // ── Add root causes + closures to CLOSED incidents ─────────────────────
  // This gives the AI richer text to embed and find better similarity matches
  const closedIncidents = await prisma.incident.findMany({
    where: { status: 'CLOSED' },
    orderBy: { createdAt: 'asc' }
  });

  const rootCauseTemplates = [
    { cat: 'Human Error',       desc: 'Insufficient staff training and failure to follow established procedures contributed to this incident.' },
    { cat: 'System Failure',    desc: 'Underlying technical system failure combined with inadequate monitoring and alerting mechanisms.' },
    { cat: 'Process Gap',       desc: 'Absence of a formal documented process or checklist resulted in critical steps being missed.' },
    { cat: 'Equipment Failure', desc: 'Equipment reached end of operational life and preventive maintenance schedule was not adhered to.' },
    { cat: 'Human Error',       desc: 'Miscommunication between teams led to incorrect assumptions about responsibilities and ownership.' },
    { cat: 'External Factor',   desc: 'Third-party vendor action or environmental condition outside of organisational control.' },
    { cat: 'Process Gap',       desc: 'Change management process was bypassed leading to unreviewed configuration being deployed to production.' },
    { cat: 'System Failure',    desc: 'Automated failover mechanism failed to trigger due to misconfigured health check thresholds.' },
    { cat: 'Human Error',       desc: 'Employee lacked awareness of the security implications of their actions and had not received recent training.' },
    { cat: 'Process Gap',       desc: 'Regular inspection and audit programme did not cover this area resulting in the hazard going undetected.' },
  ];

  const lessonTemplates = [
    'Implement mandatory refresher training for all staff annually. Introduce automated compliance tracking.',
    'Deploy comprehensive monitoring and alerting. Conduct regular failover testing to validate recovery procedures.',
    'Document and communicate all processes. Introduce pre-task briefings and checklists for high-risk activities.',
    'Establish preventive maintenance schedule. Implement asset lifecycle management programme.',
    'Improve cross-team communication protocols. Introduce formal handover documentation.',
    'Diversify supplier base and implement contingency planning for third-party dependencies.',
    'Enforce change management process. No changes to production without peer review and approval.',
    'Review and test all automated failover configurations quarterly. Simulate disaster recovery scenarios.',
    'Increase security awareness training frequency. Implement phishing simulation exercises.',
    'Expand inspection programme coverage. Include all areas in monthly safety walk-around programme.',
  ];

  let rcCount = 0;
  for (let i = 0; i < closedIncidents.length; i++) {
    const inc = closedIncidents[i];
    const template = rootCauseTemplates[i % rootCauseTemplates.length];
    const lesson   = lessonTemplates[i % lessonTemplates.length];

    // Root cause
    await prisma.incidentRootCause.upsert({
      where: { incidentId: inc.id },
      update: {},
      create: {
        incidentId: inc.id,
        rootCauseCategory: template.cat,
        description: template.desc,
        contributingFactors: 'Lack of oversight, inadequate controls, and time pressure were all contributing factors.',
      }
    });

    // Review
    await prisma.incidentReview.upsert({
      where: { incidentId: inc.id },
      update: {},
      create: {
        incidentId: inc.id,
        reviewNotes: 'Incident reviewed by management. All corrective actions verified as completed. Process improvements implemented.',
        effectivenessRating: 3 + (i % 3),
        reviewerId: manager.id,
      }
    });

    // Closure
    await prisma.incidentClosure.upsert({
      where: { incidentId: inc.id },
      update: {},
      create: {
        incidentId: inc.id,
        closureSummary: 'Incident fully investigated, root cause identified, and corrective actions implemented. All affected parties notified.',
        lessonsLearned: lesson,
        closedBy: admin.id,
        closureDate: new Date(),
      }
    });

    rcCount++;
  }

  console.log(`✅ Added root causes, reviews & closures to ${rcCount} closed incidents`);
  console.log('');
  console.log('🎉 Seed complete! Login credentials:');
  console.log('   admin@ims.com   / Admin@123  (Admin)');
  console.log('   manager@ims.com / Admin@123  (Manager)');
  console.log('   staff@ims.com   / Admin@123  (Staff)');
  console.log('   staff2@ims.com  / Admin@123  (Staff)');
  console.log('');
  console.log('📊 Data seeded:');
  console.log(`   ${created} incidents (Cyber Security, IT Infrastructure, H&S, Data Privacy, Environmental, HR, Fire Safety)`);
  console.log('   AI embedding will auto-process in ~30 seconds after backend starts');
}

main().catch(console.error).finally(() => prisma.$disconnect());
