
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Criar Usuários
  // ATENÇÃO: Em uma aplicação real, as senhas DEVEM ser hasheadas antes de salvar!
  // Para este seed, estamos usando texto plano para corresponder à abordagem anterior.
  // Você DEVE implementar hashing de senha na sua lógica de criação/atualização de usuários.
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: 'crm123', // Armazenar senha HASHADA em produção
      name: 'Administrador',
      role: UserRole.Admin,
      canViewCalendarsOf: [],
    },
  });

  const prefeitoUser = await prisma.user.create({
    data: {
      username: 'prefeito',
      password: 'crm123', // Armazenar senha HASHADA em produção
      name: 'Prefeito João Silva',
      role: UserRole.Prefeito,
      canViewCalendarsOf: [],
    },
  });

  const viceUser = await prisma.user.create({
    data: {
      username: 'vice',
      password: 'crm123', // Armazenar senha HASHADA em produção
      name: 'Vice-Prefeita Maria Costa',
      role: UserRole.Vice_prefeito,
      canViewCalendarsOf: [],
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      username: 'viewer',
      password: 'crm123', // Armazenar senha HASHADA em produção
      name: 'Assessor de Gabinete',
      role: UserRole.Visualizador,
      canViewCalendarsOf: [prefeitoUser.id], // Exemplo: pode ver a agenda do Prefeito
    },
  });

  console.log(`Created users: admin, prefeito, vice, viewer`);

  // Criar compromissos iniciais (exemplo, adapte do seu SQL dump)
  // Garanta que as datas sejam objetos Date válidos para o Prisma
  const appointmentsData = [
    { date: new Date('2025-04-30'), time: '08:00', title: 'REUNIÃO DE ALINHAMENTO COM TODOS OS SECRETÁRIOS', participants: 'Todos Secretários', location: 'Gabinete', isCompleted: true, assignedToId: prefeitoUser.id, createdById: adminUser.id, contactPerson: '' },
    { date: new Date('2025-04-30'), time: '14:00', title: 'POSSE DO NÚCLEO DO BAIRRO SÃO JOÃO', location: 'Bairro São João', isCompleted: true, assignedToId: prefeitoUser.id, createdById: adminUser.id, contactPerson: '' },
    { date: new Date('2025-04-30'), time: '15:00', title: 'REUNIÃO COM O SECRETÁRIO CLEBERSON', participants: 'Cleberson Taborda', location: 'Gabinete', isCompleted: true, assignedToId: prefeitoUser.id, createdById: adminUser.id, contactPerson: ''},
    // Adicione mais compromissos do seu SQL dump, garantindo que 'date' seja um objeto Date
    // e assignedToId/createdById sejam IDs de usuário válidos de cima.
  ];

  for (const appt of appointmentsData) {
    await prisma.appointment.create({
      data: appt,
    });
  }
  console.log(`Created ${appointmentsData.length} initial appointments.`);

  // Criar configurações de tema padrão (pode ser global ou por usuário)
  // Para simplicidade, vamos fazer uma para o admin ou um padrão global.
  // Usando um ID conhecido para uma configuração global ou vinculando a um usuário específico.
  // Se você quiser configurações por usuário, criaria uma para cada usuário ou sob demanda.
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

  // Exemplo: Criar uma configuração de tema global vinculada ao usuário admin por enquanto
  // Em uma aplicação real, você pode ter uma tabela separada para configurações globais
  // ou uma forma mais sofisticada de gerenciar temas padrão vs. específicos do usuário.
  await prisma.themeSettings.create({
    data: {
      userId: adminUser.id, // Ou tenha um usuário/flag específico para configurações globais
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
