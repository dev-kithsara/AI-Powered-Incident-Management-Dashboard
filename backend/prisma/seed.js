const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ims.com' },
    update: {},
    create: { name: 'System Admin', email: 'admin@ims.com', password: hashedPassword, role: 'admin' }
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@ims.com' },
    update: {},
    create: { name: 'Manager One', email: 'manager@ims.com', password: hashedPassword, role: 'manager' }
  });
  const staff = await prisma.user.upsert({
    where: { email: 'staff@ims.com' },
    update: {},
    create: { name: 'Staff Member', email: 'staff@ims.com', password: hashedPassword, role: 'staff' }
  });

  const incidents = [
    { title: 'Database Server Crash', description: 'Primary database server went offline causing service disruption for 2 hours. All dependent services were affected and users could not access the system.', severity: 'CRITICAL', category: 'Infrastructure', department: 'IT', status: 'CLOSED', reportedBy: staff.id },
    { title: 'Network Firewall Misconfiguration', description: 'Firewall rules were incorrectly updated allowing unauthorized traffic into the internal network segment.', severity: 'HIGH', category: 'Security', department: 'IT', status: 'UNDER_REVIEW', reportedBy: staff.id },
    { title: 'Employee Slip and Fall', description: 'Employee slipped on wet floor near the main entrance causing minor injury to the left knee. Medical attention was provided.', severity: 'MEDIUM', category: 'Health & Safety', department: 'Facilities', status: 'IN_PROGRESS', reportedBy: manager.id },
    { title: 'API Rate Limit Breach', description: 'Third-party payment API rate limit was exceeded causing transaction failures for 45 minutes during peak trading hours.', severity: 'HIGH', category: 'Software', department: 'Engineering', status: 'CLOSED', reportedBy: staff.id },
    { title: 'Unauthorized Data Access Attempt', description: 'Multiple failed login attempts detected from unknown IP addresses in Eastern Europe. Brute force pattern identified by SIEM.', severity: 'CRITICAL', category: 'Security', department: 'IT', status: 'IN_PROGRESS', reportedBy: admin.id }
  ];

  for (const inc of incidents) {
    await prisma.incident.create({ data: inc });
  }

  console.log('✅ Seed complete.');
  console.log('   Users: admin@ims.com / manager@ims.com / staff@ims.com');
  console.log('   Password: Admin@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
