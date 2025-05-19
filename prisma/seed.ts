
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create Users
  // IMPORTANT: In a real application, passwords should be hashed before saving!
  // For this seed, we are using plain text to match the previous localStorage approach.
  // You MUST implement password hashing (e.g., using bcryptjs) in your user creation/update logic.
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: 'crm123', // Store HASHED password in production
      name: 'Administrador',
      role: UserRole.Admin,
      canViewCalendarsOf: [],
    },
  });

  const prefeitoUser = await prisma.user.create({
    data: {
      username: 'prefeito',
      password: 'crm123', // Store HASHED password in production
      name: 'Prefeito João Silva',
      role: UserRole.Prefeito,
      canViewCalendarsOf: [],
    },
  });

  const viceUser = await prisma.user.create({
    data: {
      username: 'vice',
      password: 'crm123', // Store HASHED password in production
      name: 'Vice-Prefeita Maria Costa',
      role: UserRole.Vice_prefeito,
      canViewCalendarsOf: [],
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      username: 'viewer',
      password: 'crm123', // Store HASHED password in production
      name: 'Assessor de Gabinete',
      role: UserRole.Visualizador,
      canViewCalendarsOf: [prefeitoUser.id], // Example: can view Prefeito's calendar
    },
  });

  console.log(`Created users: admin, prefeito, vice, viewer`);

  // Create initial appointments (example, adapt from your SQL dump)
  // Ensure dates are valid Date objects for Prisma
  const appointmentsData = [
    { date: new Date('2025-04-30'), time: '08:00', title: 'REUNIÃO DE ALINHAMENTO COM TODOS OS SECRETÁRIOS', participants: 'Todos Secretários', location: 'Gabinete', isCompleted: true, assignedToId: prefeitoUser.id, createdById: adminUser.id, contactPerson: '' },
    { date: new Date('2025-04-30'), time: '14:00', title: 'POSSE DO NÚCLEO DO BAIRRO SÃO JOÃO', location: 'Bairro São João', isCompleted: true, assignedToId: prefeitoUser.id, createdById: adminUser.id, contactPerson: '' },
    { date: new Date('2025-04-30'), time: '15:00', title: 'REUNIÃO COM O SECRETÁRIO CLEBERSON', participants: 'Cleberson Taborda', location: 'Gabinete', isCompleted: true, assignedToId: prefeitoUser.id, createdById: adminUser.id, contactPerson: ''},
    // Add more appointments from your SQL dump, ensuring 'date' is a Date object
    // and assignedToId/createdById are valid user IDs from above.
  ];

  for (const appt of appointmentsData) {
    await prisma.appointment.create({
      data: appt,
    });
  }
  console.log(`Created ${appointmentsData.length} initial appointments.`);

  // Create default theme settings (can be global or per user)
  // For simplicity, let's make one for the admin or a global default.
  // Using a known ID for a global setting or linking to a specific user.
  // If you want per-user settings, you'd create one for each user or on demand.
  const defaultTheme = {
      appName: 'AgendaGov',
      logoLightModeUrl: "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png",
      logoDarkModeUrl: "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png",
      backgroundColor: "#ECEFF1", 
      foregroundColor: "#383A3D", 
      cardColor: "#FFFFFF",       
      cardForegroundColor: "#383A3D", 
      popoverColor: "#FFFFFF",      
      popoverForegroundColor: "#383A3D", 
      primaryColor: "#3F51B5",      
      primaryForegroundColor: "#FFFFFF", 
      secondaryColor: "#E0E5E9",    
      secondaryForegroundColor: "#383A3D", 
      mutedColor: "#E0E5E9",        
      mutedForegroundColor: "#696E75", 
      accentColor: "#9575CD",       
      accentForegroundColor: "#FFFFFF", 
      destructiveColor: "#F44336",  
      destructiveForegroundColor: "#FAFAFA", 
      borderColor: "#D3D7DB",       
      inputColor: "#D3D7DB",        
      ringColor: "#3F51B5",         
      sidebarBackgroundColor: "#2B303B",       
      sidebarForegroundColor: "#F9FAFC",       
      sidebarPrimaryColor: "#3F51B5",          
      sidebarPrimaryForegroundColor: "#FFFFFF", 
      sidebarAccentColor: "#3C4352",           
      sidebarAccentForegroundColor: "#F9FAFC",  
      sidebarBorderColor: "#1F2329",           
      sidebarRingColor: "#3F51B5",
  }

  // Example: Create a global theme setting linked to the admin user for now
  // In a real app, you might have a separate table for global settings
  // or a more sophisticated way to manage default vs user-specific themes.
  await prisma.themeSettings.create({
    data: {
      userId: adminUser.id, // Or have a specific global settings user/flag
      ...defaultTheme
    }
  });
  console.log(`Created default theme settings.`);


  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
